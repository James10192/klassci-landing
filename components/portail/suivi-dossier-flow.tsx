"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { lireDemandeVerification, type DemandeVerification } from "@/lib/portail/verification";

import { BoutonPrincipal, champ, dateIso, dateNaissanceValide } from "./pieces";
import { VerificationCode } from "./verification-code";

type Ecole = { code: string; libelle: string };

type Situation = {
  type: "inscription" | "reinscription";
  reference: string;
  statut: { code: string; libelle: string };
  contact: { email_masque: string | null; email_verifie: boolean; a_confirmer: boolean };
  verification_active: boolean;
  prise_rdv_ouverte: boolean;
  rendez_vous: null | {
    date: string;
    heure_debut: string;
    heure_fin: string;
    convocation: string | null;
    peut_modifier: boolean;
  };
  peut_recevoir_convocation: boolean;
};

type Vue = "identification" | "oubli" | "situation" | "email" | "code";

/** « lundi 29 septembre 2026 » : une date ISO se lit mal au guichet. */
function dateLisible(iso: string, locale: string): string {
  const d = new Date(`${iso}T12:00:00`);

  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

function decouper(iso?: string): { jour: string; mois: string; annee: string } {
  const morceaux = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (morceaux === null) return { jour: "", mois: "", annee: "" };

  return { annee: morceaux[1], mois: String(Number(morceaux[2])), jour: String(Number(morceaux[3])) };
}

/**
 * Une famille revient suivre une demande deja deposee.
 *
 * Elle se fait reconnaitre par sa reference (ou son matricule pour une
 * reinscription) et sa date de naissance, voit ou en est son dossier, verifie
 * ou corrige l'adresse e-mail qui recevra la convocation, et peut se la faire
 * renvoyer. Reference perdue : elle part par e-mail a l'adresse du dossier,
 * jamais a l'ecran.
 */
export function SuiviDossierFlow({
  etablissement,
  identifiantInitial,
  naissanceInitiale,
  onOuvrirRdv,
  sansTitre,
}: {
  etablissement: Ecole;
  /** La page porte deja le titre : l'ecran d'identification ne le repete pas. */
  sansTitre?: boolean;
  identifiantInitial?: string;
  naissanceInitiale?: string;
  /** Ouvre la prise ou la modification de rendez-vous pour cette reference. */
  onOuvrirRdv?: (reference: string, dateNaissance: string) => void;
}) {
  const t = useTranslations("inscription.suivi");
  const locale = useLocale();
  const connue = decouper(naissanceInitiale);
  const [identifiant, setIdentifiant] = useState(identifiantInitial ?? "");
  const [jour, setJour] = useState(connue.jour);
  const [mois, setMois] = useState(connue.mois);
  const [annee, setAnnee] = useState(connue.annee);
  const [email, setEmail] = useState("");
  const [vue, setVue] = useState<Vue>("identification");
  const [situation, setSituation] = useState<Situation | null>(null);
  const [verification, setVerification] = useState<DemandeVerification | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const naissance = dateIso(jour, mois, annee);
  const naissanceOk = dateNaissanceValide(jour, mois, annee);
  const identite = { identifiant: identifiant.trim(), date_naissance: naissance };

  const appeler = useCallback(
    async (action: string, corps: Record<string, unknown>) => {
      const reponse = await fetch(`/api/suivi/${etablissement.code}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const lu = (await reponse.json().catch(() => null)) as Record<string, unknown> | null;

      return { statut: reponse.status, corps: lu ?? {} };
    },
    [etablissement.code],
  );

  function lireSituation(corps: Record<string, unknown>): Situation | null {
    const brute = (corps.situation ?? corps) as Record<string, unknown>;

    return brute.trouve === true ? (brute as unknown as Situation) : null;
  }

  const consulter = useCallback(async () => {
    if (!naissanceOk || identifiant.trim() === "" || enCours) return;
    setEnCours(true);
    setMessage(null);
    try {
      const { statut, corps } = await appeler("consulter", identite);
      const lue = lireSituation(corps);
      if (lue !== null) {
        setSituation(lue);
        setVue("situation");
      } else {
        setMessage(t(statut === 429 ? "erreurs.trop" : "erreurs.introuvable"));
      }
    } catch {
      setMessage(t("erreurs.indisponible"));
    } finally {
      setEnCours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naissanceOk, identifiant, naissance, enCours, appeler, t]);

  useEffect(() => {
    if (identifiantInitial && naissanceInitiale) void consulter();
    // Premier affichage seulement : la famille arrive deja identifiee.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function agir(action: "email" | "verifier" | "convocation") {
    if (enCours) return;
    setEnCours(true);
    setMessage(null);
    try {
      const { statut, corps } = await appeler(action, action === "email" ? { ...identite, email: email.trim() } : identite);
      const lue = lireSituation(corps);
      if (lue !== null) setSituation(lue);

      const demande = lireDemandeVerification(corps);
      if (demande !== null) {
        setVerification(demande);
        setVue("code");
        return;
      }

      const code = typeof corps.code === "string" ? corps.code : statut === 422 ? "email_invalide" : "indisponible";
      setMessage(t.has(`codes.${code}`) ? t(`codes.${code}`) : t("erreurs.indisponible"));
      if (lue !== null) setVue("situation");
    } catch {
      setMessage(t("erreurs.indisponible"));
    } finally {
      setEnCours(false);
    }
  }

  async function demanderReference() {
    if (!naissanceOk || email.trim() === "" || enCours) return;
    setEnCours(true);
    setMessage(null);
    try {
      const { statut } = await appeler("reference-oubliee", { email: email.trim(), date_naissance: naissance });
      setMessage(t(statut === 202 ? "oubli.envoye" : statut === 429 ? "erreurs.trop" : "erreurs.indisponible"));
    } catch {
      setMessage(t("erreurs.indisponible"));
    } finally {
      setEnCours(false);
    }
  }

  const naissanceChamps = (
    <div className="mt-3">
      <span className="block text-sm font-medium">{t("naissance")}</span>
      <div className="mt-1 grid grid-cols-3 gap-2">
        <input className={champ} inputMode="numeric" aria-label={t("jour")} placeholder={t("jour")} value={jour} onChange={(e) => setJour(e.target.value)} />
        <input className={champ} inputMode="numeric" aria-label={t("mois")} placeholder={t("mois")} value={mois} onChange={(e) => setMois(e.target.value)} />
        <input className={champ} inputMode="numeric" aria-label={t("annee")} placeholder={t("annee")} value={annee} onChange={(e) => setAnnee(e.target.value)} />
      </div>
    </div>
  );

  const bandeau = message !== null && (
    <p role="status" aria-live="polite" className="mt-4 rounded-xl border border-border bg-bg-alt p-3 text-sm text-text-secondary">
      {message}
    </p>
  );

  if (vue === "code" && verification !== null) {
    return (
      <VerificationCode
        ecole={etablissement.code}
        demande={verification}
        onVerifie={async () => {
          setVerification(null);
          setVue("identification");
          await consulter();
          setMessage(t("verifie"));
        }}
        onModifier={() => { setVerification(null); setVue("email"); }}
      />
    );
  }

  if (vue === "identification" || vue === "oubli") {
    const oubli = vue === "oubli";

    return (
      <>
        {(oubli || !sansTitre) && (
          <>
            <h2 className="text-lg font-semibold tracking-tight">{t(oubli ? "oubli.titre" : "titre")}</h2>
            <p className="mt-1 text-pretty text-sm text-text-secondary">{t(oubli ? "oubli.aide" : "aide")}</p>
          </>
        )}

        <label className={`${oubli || !sansTitre ? "mt-5" : ""} block text-sm font-medium`}>
          {t(oubli ? "email" : "identifiant")}
          <input
            className={champ}
            value={oubli ? email : identifiant}
            onChange={(e) => (oubli ? setEmail(e.target.value) : setIdentifiant(e.target.value))}
            type={oubli ? "email" : "text"}
            inputMode={oubli ? "email" : "text"}
            autoComplete={oubli ? "email" : "off"}
            placeholder={oubli ? undefined : t("identifiantExemple")}
          />
        </label>
        {naissanceChamps}

        <div className="mt-5">
          <BoutonPrincipal
            onClick={() => void (oubli ? demanderReference() : consulter())}
            disabled={enCours || !naissanceOk || (oubli ? email.trim() === "" : identifiant.trim() === "")}
            occupe={enCours}
          >
            {t(oubli ? "oubli.action" : "action")}
          </BoutonPrincipal>
        </div>
        {bandeau}

        <button
          type="button"
          onClick={() => { setMessage(null); setVue(oubli ? "identification" : "oubli"); }}
          className="mt-4 min-h-[40px] text-sm text-accent underline-offset-4 hover:underline"
        >
          {t(oubli ? "oubli.retour" : "oubli.lien")}
        </button>
      </>
    );
  }

  if (situation === null) return null;
  const rdv = situation.rendez_vous;
  const contact = situation.contact;
  const peutVerifier = situation.verification_active && contact.email_masque !== null && !contact.email_verifie;

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight">{t(situation.type === "inscription" ? "dossierInscription" : "dossierReinscription")}</h2>
      <p className="mt-1 text-sm text-text-secondary">{t("reference", { reference: situation.reference })}</p>

      <div className="mt-5 rounded-xl bg-bg-alt p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{t("etat")}</p>
        <p className="mt-1 text-sm font-semibold">{situation.statut.libelle}</p>
      </div>

      <div className="mt-3 rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{t("contact.titre")}</p>
        {contact.email_masque !== null ? (
          <p className="mt-1 text-sm">
            <span className="font-semibold">{contact.email_masque}</span>{" "}
            <span className="text-text-secondary">· {t(contact.email_verifie ? "contact.verifie" : "contact.nonVerifie")}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-text-secondary">{t("contact.aucun")}</p>
        )}
        {contact.a_confirmer && <p className="mt-2 text-sm text-text-secondary">{t("contact.retenue")}</p>}

        {vue === "email" ? (
          <div className="mt-3">
            <label className="block text-sm font-medium">
              {t("email")}
              <input className={champ} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <div className="mt-3">
              <BoutonPrincipal onClick={() => void agir("email")} disabled={enCours || !email.includes("@")} occupe={enCours}>
                {t(situation.verification_active ? "contact.envoyerCode" : "contact.enregistrer")}
              </BoutonPrincipal>
            </div>
            <button type="button" onClick={() => setVue("situation")} className="mt-2 min-h-[40px] text-sm text-text-muted hover:text-text">
              {t("annuler")}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {peutVerifier && (
              <button type="button" onClick={() => void agir("verifier")} disabled={enCours} className="min-h-[40px] text-sm font-semibold text-accent underline-offset-4 hover:underline disabled:opacity-50">
                {t("contact.verifier")}
              </button>
            )}
            {situation.statut.code === "en_attente" || situation.statut.code === "acceptee" ? (
              <button type="button" onClick={() => { setEmail(""); setVue("email"); }} className="min-h-[40px] text-sm text-accent underline-offset-4 hover:underline">
                {t(contact.email_masque === null ? "contact.ajouter" : "contact.modifier")}
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{t("rdv.titre")}</p>
        {rdv !== null ? (
          <>
            <p className="mt-1 text-sm font-semibold">{t("rdv.creneau", { date: dateLisible(rdv.date, locale), debut: rdv.heure_debut, fin: rdv.heure_fin })}</p>
            <div className="mt-3 space-y-2">
              {situation.peut_recevoir_convocation && (
                <BoutonPrincipal onClick={() => void agir("convocation")} disabled={enCours} occupe={enCours}>
                  {t("rdv.recevoir")}
                </BoutonPrincipal>
              )}
              {onOuvrirRdv && rdv.peut_modifier && (
                <button type="button" onClick={() => onOuvrirRdv(situation.reference, naissance)} className="min-h-[40px] text-sm text-accent underline-offset-4 hover:underline">
                  {t("rdv.modifier")}
                </button>
              )}
            </div>
          </>
        ) : situation.prise_rdv_ouverte && situation.statut.code === "en_attente" && onOuvrirRdv ? (
          <div className="mt-3">
            <BoutonPrincipal onClick={() => onOuvrirRdv(situation.reference, naissance)}>{t("rdv.choisir")}</BoutonPrincipal>
          </div>
        ) : (
          <p className="mt-1 text-sm text-text-secondary">{t("rdv.aucun")}</p>
        )}
      </div>

      {bandeau}

      <button
        type="button"
        onClick={() => { setSituation(null); setMessage(null); setVue("identification"); }}
        className="mt-4 min-h-[40px] text-sm text-text-muted underline-offset-4 hover:text-text hover:underline"
      >
        {t("autre")}
      </button>
    </>
  );
}
