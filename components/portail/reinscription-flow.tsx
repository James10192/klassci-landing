"use client";

import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useId, useMemo, useRef, useState } from "react";

import type { EtablissementVisible } from "@/lib/portail/tenants";

import {
  Alerte,
  BoutonPrincipal,
  Carte,
  CaseDate,
  RESSORT,
  champ,
  dateNaissanceValide,
  entree,
} from "./pieces";
import { classer, ecranDe, type Classement, type RegleEcran } from "./reponses";

/**
 * Le parcours de réinscription, d'un bout à l'autre, sans changer de page.
 *
 * Trois temps — je m'identifie, je vérifie que c'est bien moi, je confirme —
 * qui s'enchaînent en place. La famille qui remplit ça le fait souvent depuis
 * un téléphone, parfois en connexion lente : chaque écran tient sans défiler,
 * chaque champ dit ce qu'il attend, et rien ne se perd si l'envoi échoue.
 */

type Situation = {
  trouve: boolean;
  prenom?: string;
  classe_actuelle?: string | null;
  annee_cible?: string | null;
  eligible?: boolean;
  demande_existante?: boolean;
};

type Etape = "identification" | "confirmation" | "succes";

type CleEtat =
  | "dejaDeposee"
  | "nonEligible"
  | "introuvable"
  | "ferme"
  | "tropDeTentatives"
  | "affluence"
  | "identificationBloquee"
  | "indisponible"
  | "champsInvalides"
  | "refus";

/**
 * Ce que chaque genre de réponse donne comme écran, ici.
 *
 * La même table que la candidature, avec le vocabulaire de CE parcours :
 * « année non configurée » et « conflit » n'ont pas de sens pour une
 * réinscription, ils retombent donc sur ce que le visiteur peut comprendre.
 *
 * Elle était écrite en ternaire imbriqué à quatre niveaux, qui ré-implémentait
 * à la main la règle « code inconnu → indisponible ». Deux écritures de la même
 * règle finissent toujours par diverger — celle-ci avait déjà commencé.
 */
const ECRANS: Partial<Record<Classement["genre"], RegleEcran<CleEtat>>> = {
  ferme: { sansCode: "ferme" },
  invalide: { sansCode: "champsInvalides" },
  tropDeTentatives: {
    // Trois seaux, trois phrases. Celui d'une adresse dit vrai en parlant de
    // tentatives ; le plafond de l'établissement se remplit du trafic de tout
    // le monde ; et le seau du matricule peut avoir été rempli par un TIERS,
    // avec une fenêtre d'un quart d'heure. Les confondre accuse le visiteur de
    // ce qu'il n'a pas fait, et lui promet un délai qui n'est pas le bon.
    codes: {
      affluence: "affluence",
      trop_de_tentatives: "tropDeTentatives",
      identification_bloquee: "identificationBloquee",
    },
    sansCode: "tropDeTentatives",
  },
};

export function ReinscriptionFlow({
  etablissement,
  onAboutir,
}: {
  etablissement: EtablissementVisible;
  /**
   * Signale au portail que le parcours a abouti.
   *
   * Il n'affiche « Ce n'est pas mon cas » que tant qu'on peut encore s'être
   * trompé de porte. Sous l'écran de succès, ce bouton proposerait d'annuler
   * une réinscription déjà enregistrée — et doublerait l'action « faire une
   * autre demande » que cet écran propose déjà.
   */
  onAboutir?: (abouti: boolean) => void;
}) {
  const t = useTranslations("reinscription");
  const idBase = useId();

  const [etape, setEtape] = useState<Etape>("identification");
  const [matricule, setMatricule] = useState("");
  const [jour, setJour] = useState("");
  const [mois, setMois] = useState("");
  const [annee, setAnnee] = useState("");
  const [situation, setSituation] = useState<Situation | null>(null);
  const [etat, setEtat] = useState<CleEtat | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [consentement, setConsentement] = useState(false);

  // Résolu ici, où l'espace de messages est écrit en dur : c'est la seule
  // façon pour next-intl de vérifier que la clé existe vraiment.
  const messageEtat = etat
    ? { cle: etat, titre: t(`etats.${etat}.titre`), texte: t(`etats.${etat}.texte`) }
    : null;

  const refMois = useRef<HTMLInputElement>(null);
  const refAnnee = useRef<HTMLInputElement>(null);

  const dateComplete = useMemo(
    () => dateNaissanceValide(jour, mois, annee),
    [jour, mois, annee],
  );

  const peutChercher = matricule.trim().length > 0 && dateComplete && !enCours;

  const dateISO = useCallback(
    () => `${annee}-${mois.padStart(2, "0")}-${jour.padStart(2, "0")}`,
    [annee, mois, jour],
  );

  /**
   * Traduit la réponse du relais en un état d'écran.
   *
   * Le classement des codes HTTP est partagé avec la candidature
   * (`reponses.ts`) : c'était la même table écrite en trois exemplaires, et
   * les trois ne couvraient pas les mêmes cas — celle de la candidature
   * perdait le `!ok` et le corps illisible, donc un 401, ce silence-là même
   * que le relais journalise comme une panne d'école entière.
   *
   * Ce qui reste ici, et qui doit y rester, c'est la traduction vers le
   * vocabulaire d'écrans de CE parcours : « année non configurée » et
   * « conflit » n'ont pas de sens pour une réinscription, ils retombent donc
   * sur ce que le visiteur peut comprendre.
   */
  const interpreter = useCallback(
    async (reponse: Response): Promise<Situation | null> => {
      const classement = await classer(reponse);

      if (classement.genre === "ok") {
        return classement.corps as Situation;
      }

      setEtat(ecranDe(classement, ECRANS, "indisponible"));

      return null;
    },
    [],
  );

  const chercher = useCallback(async () => {
    if (!peutChercher) return;

    setEnCours(true);
    setEtat(null);

    try {
      const reponse = await fetch(`/api/reinscription/${etablissement.code}/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule: matricule.trim(), dateNaissance: dateISO() }),
      });

      const corps = await interpreter(reponse);

      if (corps === null) return;

      if (corps.trouve !== true) {
        setEtat("introuvable");
        return;
      }

      if (corps.demande_existante === true) {
        setSituation(corps);
        setEtat("dejaDeposee");
        return;
      }

      if (corps.eligible !== true) {
        setSituation(corps);
        setEtat("nonEligible");
        return;
      }

      setSituation(corps);
      setEtape("confirmation");
    } catch {
      setEtat("indisponible");
    } finally {
      setEnCours(false);
    }
  }, [peutChercher, etablissement.code, matricule, dateISO, interpreter]);

  const confirmer = useCallback(async () => {
    if (!consentement || enCours) return;

    setEnCours(true);
    setEtat(null);

    try {
      const reponse = await fetch(`/api/reinscription/${etablissement.code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricule: matricule.trim(),
          dateNaissance: dateISO(),
          consentement: true,
        }),
      });

      const corps = await interpreter(reponse);

      if (corps === null) return;

      if ((corps as { enregistre?: boolean }).enregistre === true) {
        setEtape("succes");
        onAboutir?.(true);
        return;
      }

      // KLASSCI refuse DÉLIBÉRÉMENT de dire pourquoi il ne sert pas un
      // dossier : déjà réinscrit, plus d'année courante, rien à réinscrire —
      // une seule et même réponse. Deviner ici la raison, et écrire à une
      // famille « votre réinscription est déjà faite » alors que le serveur
      // ne l'a jamais affirmé, l'enverrait à la scolarité avec la mauvaise
      // question. On dit ce qu'on sait : ça n'a pas abouti.
      setEtat("refus");
    } catch {
      setEtat("indisponible");
    } finally {
      setEnCours(false);
    }
  }, [consentement, enCours, etablissement.code, matricule, dateISO, interpreter, onAboutir]);

  const recommencer = useCallback(() => {
    onAboutir?.(false);
    setEtape("identification");
    setSituation(null);
    setEtat(null);
    setConsentement(false);
    setMatricule("");
    setJour("");
    setMois("");
    setAnnee("");
  }, [onAboutir]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait" initial={false}>
        {etape === "identification" && (
          <m.div
            key="identification"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT}
          >
            <Carte>
              <m.div {...entree(0)}>
                <h2 className="text-balance text-xl font-semibold tracking-tight text-text">
                  {t("identification.titre")}
                </h2>
                <p className="mt-1.5 text-pretty text-sm text-text-secondary">
                  {t("identification.aide")}
                </p>
              </m.div>

              <m.div {...entree(1)} className="mt-6">
                <label
                  htmlFor={`${idBase}-matricule`}
                  className="block text-sm font-medium text-text"
                >
                  {t("identification.matricule.label")}
                </label>
                <input
                  id={`${idBase}-matricule`}
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") chercher();
                  }}
                  placeholder={t("identification.matricule.placeholder")}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className={champ}
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  {t("identification.matricule.aide")}
                </p>
              </m.div>

              <m.div {...entree(2)} className="mt-5">
                <span className="block text-sm font-medium text-text">
                  {t("identification.naissance.label")}
                </span>
                {/* Trois champs plutot qu'un selecteur natif : sur telephone,
                    remonter vingt ans dans un calendrier est penible, alors
                    qu'une date de naissance se tape de memoire. */}
                <div className="mt-2 grid grid-cols-[1fr_1fr_1.4fr] gap-2">
                  <CaseDate
                    label={t("identification.naissance.jour")}
                    value={jour}
                    onChange={(v) => {
                      setJour(v);
                      if (v.length === 2) refMois.current?.focus();
                    }}
                    max={2}
                    placeholder="15"
                  />
                  <CaseDate
                    ref={refMois}
                    label={t("identification.naissance.mois")}
                    value={mois}
                    onChange={(v) => {
                      setMois(v);
                      if (v.length === 2) refAnnee.current?.focus();
                    }}
                    max={2}
                    placeholder="03"
                  />
                  <CaseDate
                    ref={refAnnee}
                    label={t("identification.naissance.annee")}
                    value={annee}
                    onChange={setAnnee}
                    max={4}
                    placeholder="2004"
                    onEnter={chercher}
                  />
                </div>
              </m.div>

              <Alerte etat={messageEtat} />

              <m.div {...entree(3)} className="mt-6">
                <BoutonPrincipal onClick={chercher} disabled={!peutChercher} occupe={enCours}>
                  {enCours ? t("identification.chargement") : t("identification.action")}
                </BoutonPrincipal>
              </m.div>
            </Carte>
          </m.div>
        )}

        {etape === "confirmation" && situation && (
          <m.div
            key="confirmation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT}
          >
            <Carte>
              <m.h2
                {...entree(0)}
                className="text-balance text-xl font-semibold tracking-tight text-text"
              >
                {situation.prenom
                  ? t("confirmation.salutation", { prenom: situation.prenom })
                  : t("confirmation.salutationSansPrenom")}
              </m.h2>

              <m.dl
                {...entree(1)}
                className="mt-5 divide-y divide-border overflow-hidden rounded-xl bg-bg-alt"
              >
                <Ligne intitule={t("confirmation.classe")} valeur={situation.classe_actuelle} />
                <Ligne intitule={t("confirmation.annee")} valeur={situation.annee_cible} />
              </m.dl>

              <m.label
                {...entree(2)}
                className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-accent-light"
              >
                <input
                  type="checkbox"
                  checked={consentement}
                  onChange={(e) => setConsentement(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-border-strong text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                <span className="text-pretty text-sm leading-relaxed text-text-secondary">
                  {t("confirmation.consentement")}
                </span>
              </m.label>

              <Alerte etat={messageEtat} />

              <m.div {...entree(3)} className="mt-5 flex flex-col gap-3">
                <BoutonPrincipal
                  onClick={confirmer}
                  disabled={!consentement || enCours}
                  occupe={enCours}
                >
                  {enCours ? t("confirmation.chargement") : t("confirmation.action")}
                </BoutonPrincipal>
                <button
                  type="button"
                  onClick={recommencer}
                  className="mx-auto min-h-[40px] px-3 text-sm text-text-muted underline-offset-4 transition-colors duration-200 hover:text-text hover:underline"
                >
                  {t("confirmation.retour")}
                </button>
              </m.div>
            </Carte>
          </m.div>
        )}

        {etape === "succes" && (
          <m.div
            key="succes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT}
          >
            <Carte>
              <m.div
                initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={RESSORT}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-light"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-accent"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </m.div>

              <m.h2
                {...entree(1)}
                className="mt-5 text-balance text-center text-xl font-semibold tracking-tight text-text"
              >
                {t("succes.titre")}
              </m.h2>
              <m.p
                {...entree(2)}
                className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary"
              >
                {t("succes.texte")}
              </m.p>
              <m.p
                {...entree(3)}
                className="mt-4 rounded-xl bg-bg-alt p-3 text-pretty text-center text-xs leading-relaxed text-text-muted"
              >
                {t("succes.rappel")}
              </m.p>

              <m.div {...entree(4)} className="mt-5 text-center">
                <button
                  type="button"
                  onClick={recommencer}
                  className="min-h-[40px] px-3 text-sm text-accent underline-offset-4 transition-colors duration-200 hover:underline"
                >
                  {t("succes.action")}
                </button>
              </m.div>
            </Carte>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────── pièces ────────── */

function Ligne({ intitule, valeur }: { intitule: string; valeur?: string | null }) {
  if (!valeur) return null;

  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-text-muted">{intitule}</dt>
      <dd className="text-right text-sm font-semibold text-text">{valeur}</dd>
    </div>
  );
}
