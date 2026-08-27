"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useId, useMemo, useRef, useState } from "react";

import type { EtablissementReinscription } from "@/lib/reinscription/tenants";

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
  | "indisponible"
  | "champsInvalides"
  | "refus";

const RESSORT = { type: "spring", duration: 0.3, bounce: 0 } as const;

/** Chaque bloc entre décalé du précédent : l'écran se compose au lieu d'apparaître. */
function entree(rang: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { ...RESSORT, delay: rang * 0.06 },
  };
}

function estNombre(valeur: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(valeur)) return false;
  const n = Number(valeur);
  return n >= min && n <= max;
}

export function ReinscriptionFlow({
  etablissement,
}: {
  etablissement: EtablissementReinscription;
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

  const refMois = useRef<HTMLInputElement>(null);
  const refAnnee = useRef<HTMLInputElement>(null);

  const dateComplete = useMemo(
    () => estNombre(jour, 1, 31) && estNombre(mois, 1, 12) && estNombre(annee, 1900, 2100),
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
   * Volontairement centralisé : c'est le seul endroit où l'on décide de ce que
   * le visiteur voit, et le laisser s'éparpiller dans les deux appels
   * produirait tôt ou tard deux messages différents pour la même situation.
   */
  const interpreter = useCallback(
    async (reponse: Response): Promise<Situation | null> => {
      if (reponse.status === 503) {
        // 503 recouvre deux causes : le canal fermé par l'école (KLASSCI rend
        // `ouvert: false`) et l'instance injoignable (le relais rend `erreur`).
        // Les confondre enverrait la famille attendre une ouverture qui a
        // peut-être déjà eu lieu.
        const corps = await reponse.json().catch(() => null);
        setEtat(corps && corps.ouvert === false ? "ferme" : "indisponible");
        return null;
      }

      if (reponse.status === 429) {
        setEtat("tropDeTentatives");
        return null;
      }

      if (reponse.status === 422 || reponse.status === 400) {
        setEtat("champsInvalides");
        return null;
      }

      if (!reponse.ok) {
        setEtat("indisponible");
        return null;
      }

      const corps = (await reponse.json().catch(() => null)) as Situation | null;

      if (corps === null) {
        setEtat("indisponible");
        return null;
      }

      return corps;
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
  }, [consentement, enCours, etablissement.code, matricule, dateISO, interpreter]);

  const recommencer = useCallback(() => {
    setEtape("identification");
    setSituation(null);
    setEtat(null);
    setConsentement(false);
    setMatricule("");
    setJour("");
    setMois("");
    setAnnee("");
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait" initial={false}>
        {etape === "identification" && (
          <motion.div
            key="identification"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT}
          >
            <Carte>
              <motion.div {...entree(0)}>
                <h2 className="text-balance text-xl font-semibold tracking-tight text-[var(--text)]">
                  {t("identification.titre")}
                </h2>
                <p className="mt-1.5 text-pretty text-sm text-[var(--text-secondary)]">
                  {t("identification.aide")}
                </p>
              </motion.div>

              <motion.div {...entree(1)} className="mt-6">
                <label
                  htmlFor={`${idBase}-matricule`}
                  className="block text-sm font-medium text-[var(--text)]"
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
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  {t("identification.matricule.aide")}
                </p>
              </motion.div>

              <motion.div {...entree(2)} className="mt-5">
                <span className="block text-sm font-medium text-[var(--text)]">
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
              </motion.div>

              <Alerte etat={etat} />

              <motion.div {...entree(3)} className="mt-6">
                <BoutonPrincipal onClick={chercher} disabled={!peutChercher} occupe={enCours}>
                  {enCours ? t("identification.chargement") : t("identification.action")}
                </BoutonPrincipal>
              </motion.div>
            </Carte>
          </motion.div>
        )}

        {etape === "confirmation" && situation && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT}
          >
            <Carte>
              <motion.h2
                {...entree(0)}
                className="text-balance text-xl font-semibold tracking-tight text-[var(--text)]"
              >
                {situation.prenom
                  ? t("confirmation.salutation", { prenom: situation.prenom })
                  : t("confirmation.salutationSansPrenom")}
              </motion.h2>

              <motion.dl
                {...entree(1)}
                className="mt-5 divide-y divide-[var(--border)] overflow-hidden rounded-xl bg-[var(--bg-alt)]"
              >
                <Ligne intitule={t("confirmation.classe")} valeur={situation.classe_actuelle} />
                <Ligne intitule={t("confirmation.annee")} valeur={situation.annee_cible} />
              </motion.dl>

              <motion.label
                {...entree(2)}
                className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-[var(--accent-light)]"
              >
                <input
                  type="checkbox"
                  checked={consentement}
                  onChange={(e) => setConsentement(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-[var(--border-strong)] text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                />
                <span className="text-pretty text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t("confirmation.consentement")}
                </span>
              </motion.label>

              <Alerte etat={etat} />

              <motion.div {...entree(3)} className="mt-5 flex flex-col gap-3">
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
                  className="mx-auto min-h-[40px] px-3 text-sm text-[var(--text-muted)] underline-offset-4 transition-colors duration-200 hover:text-[var(--text)] hover:underline"
                >
                  {t("confirmation.retour")}
                </button>
              </motion.div>
            </Carte>
          </motion.div>
        )}

        {etape === "succes" && (
          <motion.div
            key="succes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT}
          >
            <Carte>
              <motion.div
                initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={RESSORT}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-[var(--accent)]"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </motion.div>

              <motion.h2
                {...entree(1)}
                className="mt-5 text-balance text-center text-xl font-semibold tracking-tight text-[var(--text)]"
              >
                {t("succes.titre")}
              </motion.h2>
              <motion.p
                {...entree(2)}
                className="mt-2 text-pretty text-center text-sm leading-relaxed text-[var(--text-secondary)]"
              >
                {t("succes.texte")}
              </motion.p>
              <motion.p
                {...entree(3)}
                className="mt-4 rounded-xl bg-[var(--bg-alt)] p-3 text-pretty text-center text-xs leading-relaxed text-[var(--text-muted)]"
              >
                {t("succes.rappel")}
              </motion.p>

              <motion.div {...entree(4)} className="mt-5 text-center">
                <button
                  type="button"
                  onClick={recommencer}
                  className="min-h-[40px] px-3 text-sm text-[var(--accent)] underline-offset-4 transition-colors duration-200 hover:underline"
                >
                  {t("succes.action")}
                </button>
              </motion.div>
            </Carte>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────── pièces ────────── */

/** Rayon concentrique : la carte à 20px, les champs internes à 12px pour 8px de marge. */
function Carte({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-[var(--bg-card)] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04),0_16px_40px_-12px_rgba(16,24,40,0.10)] sm:p-8">
      {children}
    </div>
  );
}

const champ =
  "mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-[16px] text-[var(--text)] " +
  "placeholder:text-[var(--text-muted)] transition-[border-color,box-shadow] duration-200 " +
  "focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-light)]";

type ProprietesCaseDate = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder: string;
  onEnter?: () => void;
};

/**
 * Une case de date.
 *
 * Elle porte une `ref` parce que le jour passe la main au mois, et le mois à
 * l'année, dès que la case est pleine : on tape sa date de naissance d'un
 * trait, sans jamais viser un champ.
 */
const CaseDate = forwardRef<HTMLInputElement, ProprietesCaseDate>(function CaseDate(
  { label, value, onChange, max, placeholder, onEnter },
  ref,
) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--text-muted)]">{label}</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, max))}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        // Chiffres a chasse fixe : la largeur ne saute pas pendant la frappe.
        className={`${champ} mt-1 text-center tabular-nums`}
      />
    </label>
  );
});

function Ligne({ intitule, valeur }: { intitule: string; valeur?: string | null }) {
  if (!valeur) return null;

  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-[var(--text-muted)]">{intitule}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--text)]">{valeur}</dd>
    </div>
  );
}

function BoutonPrincipal({
  children,
  onClick,
  disabled,
  occupe,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  occupe?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={occupe}
      className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-[15px] font-semibold text-white transition-[background-color,scale,opacity] duration-200 hover:bg-[var(--accent-hover)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
    >
      {children}
    </button>
  );
}

function Alerte({ etat }: { etat: CleEtat | null }) {
  const t = useTranslations("reinscription.etats");

  return (
    <AnimatePresence initial={false}>
      {etat && (
        <motion.div
          key={etat}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={RESSORT}
          role="status"
          aria-live="polite"
          className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] p-4"
        >
          <p className="text-sm font-semibold text-[var(--text)]">{t(`${etat}.titre`)}</p>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-[var(--text-secondary)]">
            {t(`${etat}.texte`)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
