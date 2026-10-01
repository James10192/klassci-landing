"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { champ, dateIso, dateNaissanceValide } from "./pieces";

type Ecole = { code: string; libelle: string };

type Creneau = {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  etat: "disponible" | "complet";
};

type Convocation = {
  statut: string | null;
  canal: "email" | "whatsapp" | null;
  destination: string | null;
  message_id: string | null;
  tentatives: number;
  fallback_utilise: boolean;
  envoyee_at: string | null;
  delivree_at: string | null;
  erreur: string | null;
};

type Reservation = {
  date: string;
  /** Où se présenter : réglé par l'école, absent sur une instance qui ne l'expose pas encore. */
  lieu?: string | null;
  heure_debut: string;
  heure_fin: string;
  statut: string;
  convocation_url?: string;
  convocation?: Convocation;
};

function decouperNaissance(iso?: string): { jour: string; mois: string; annee: string } {
  const morceaux = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (morceaux === null) {
    return { jour: "", mois: "", annee: "" };
  }
  return { annee: morceaux[1], mois: String(Number(morceaux[2])), jour: String(Number(morceaux[3])) };
}

function formaterDate(iso: string, locale: string): string {
  const morceaux = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (morceaux === null) return iso;

  const date = new Date(Date.UTC(Number(morceaux[1]), Number(morceaux[2]) - 1, Number(morceaux[3])));
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formaterHeure(heure: string): string {
  return /^\d{2}:\d{2}/.test(heure) ? heure.slice(0, 5) : heure;
}

export function RendezVousFlow({
  etablissement,
  referenceInitiale,
  naissanceInitiale,
  identifiantInitial,
  sansTitre,
}: {
  etablissement: Ecole;
  referenceInitiale?: string;
  naissanceInitiale?: string;
  /**
   * Matricule (ou téléphone) déjà saisi ailleurs : la réinscription qui
   * répond « demande déjà enregistrée » l'a en main, et redemander à
   * l'étudiant ce qu'il vient de taper le renvoyait au formulaire de contact.
   */
  identifiantInitial?: string;
  sansTitre?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("inscription.rdv");
  const naissanceConnue = decouperNaissance(naissanceInitiale);
  const naissanceConnueOk = Boolean(naissanceInitiale && dateNaissanceValide(naissanceConnue.jour, naissanceConnue.mois, naissanceConnue.annee));
  const connu = Boolean(referenceInitiale) && naissanceConnueOk;
  const parIdentifiant = !connu && Boolean(identifiantInitial) && naissanceConnueOk;
  const [reference, setReference] = useState(referenceInitiale ?? "");
  const [jour, setJour] = useState(naissanceConnue.jour);
  const [mois, setMois] = useState(naissanceConnue.mois);
  const [annee, setAnnee] = useState(naissanceConnue.annee);
  const [identifiant, setIdentifiant] = useState(identifiantInitial ?? "");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [peutModifier, setPeutModifier] = useState(false);
  /** Dossier retrouvé, mais aucun créneau encore réservé : il faut le dire, sinon la liste seule ne parle pas. */
  const [sansRdv, setSansRdv] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [renvoiOk, setRenvoiOk] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const naissance = dateIso(jour, mois, annee);
  const naissanceOk = dateNaissanceValide(jour, mois, annee);

  const chargerCreneaux = useCallback(async () => {
    const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/creneaux`, { method: "POST" });
    const corps = await reponse.json().catch(() => null);
    if (reponse.ok && corps && Array.isArray(corps.creneaux)) {
      setCreneaux(corps.creneaux);
    }
  }, [etablissement.code]);

  useEffect(() => {
    void chargerCreneaux();
  }, [chargerCreneaux]);

  useEffect(() => {
    if (connu) {
      void consulter();
    } else if (parIdentifiant) {
      void retrouver();
    }
    // Premier affichage seulement : la famille arrive déjà identifiée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connu, parIdentifiant]);

  async function consulter(referenceTrouvee?: string, forcer = false) {
    const cle = (referenceTrouvee ?? reference).trim();
    if (!naissanceOk || cle === "" || (enCours && !forcer)) return;
    setEnCours(true);
    setErreur(null);
    setRenvoiOk(false);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/consulter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: cle, date_naissance: naissance }),
      });
      const corps = await reponse.json().catch(() => null);
      if (corps?.trouve === true) {
        setReservation(corps.reservation);
        setPeutModifier(Boolean(corps.peut_modifier));
        setSansRdv(corps.reservation === null || corps.reservation === undefined);
      } else {
        setReservation(null);
        setSansRdv(false);
        if (corps?.trouve === false) setErreur("introuvable");
      }
    } catch {
      setSansRdv(false);
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function retrouver() {
    if (!naissanceOk || identifiant.trim() === "" || enCours) return;
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/retrouver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant: identifiant.trim(), date_naissance: naissance }),
      });
      const corps = await reponse.json().catch(() => null);
      if (corps?.trouve === true && typeof corps.reference === "string") {
        setReference(corps.reference);
        // Retrouver la référence ne suffisait pas : il fallait encore cliquer
        // « Voir mon rendez-vous », et la moitié des familles s'arrêtaient là,
        // croyant n'avoir rien. On enchaîne.
        await consulter(corps.reference, true);
      } else {
        setErreur("introuvable");
      }
    } catch {
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function reserver(creneauId: number) {
    if (!naissanceOk || reference.trim() === "" || enCours) return;
    setEnCours(true);
    setErreur(null);
    setRenvoiOk(false);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/reserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.trim(),
          date_naissance: naissance,
          creneau_id: creneauId,
        }),
      });
      const corps = await reponse.json().catch(() => null);
      if (reponse.status === 201 && corps?.reservation) {
        setReservation(corps.reservation);
        setSansRdv(false);
        setPeutModifier(true);
        return;
      }
      if (Array.isArray(corps?.creneaux)) {
        setCreneaux(corps.creneaux);
      }
      setErreur(typeof corps?.code === "string" ? corps.code : "indisponible");
    } catch {
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function renvoyerConvocation() {
    if (!naissanceOk || reference.trim() === "" || enCours || reservation === null) return;
    setEnCours(true);
    setErreur(null);
    setRenvoiOk(false);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/renvoyer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.trim(), date_naissance: naissance }),
      });
      const corps = await reponse.json().catch(() => null);
      if (reponse.ok && corps?.reservation) {
        setReservation(corps.reservation);
        setRenvoiOk(true);
        return;
      }
      setErreur(typeof corps?.code === "string" ? corps.code : "indisponible");
    } catch {
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function annuler() {
    if (!naissanceOk || reference.trim() === "" || enCours) return;
    setEnCours(true);
    setRenvoiOk(false);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/annuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.trim(), date_naissance: naissance }),
      });
      if (reponse.ok) {
        setReservation(null);
        setSansRdv(true);
        await chargerCreneaux();
      }
    } finally {
      setEnCours(false);
    }
  }

  const boutonPrincipal =
    "mt-3 min-h-[44px] w-full rounded-xl bg-accent px-4 text-sm font-semibold text-white disabled:opacity-50";
  const boutonSecondaire =
    "mt-2 min-h-[40px] text-sm text-accent underline-offset-4 hover:underline disabled:opacity-50";

  function blocIdentifiant(principal: boolean) {
    return (
      <>
        <label className={`${principal ? "mt-4" : "mt-2"} block text-sm font-medium`}>
          {t("identifiant")}
          <input className={champ} value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} autoComplete="off" />
        </label>
        <button
          type="button"
          onClick={() => void retrouver()}
          disabled={enCours || !naissanceOk || identifiant.trim() === ""}
          className={principal ? boutonPrincipal : boutonSecondaire}
        >
          {principal ? t("voir") : t("retrouver")}
        </button>
      </>
    );
  }

  function blocReference(principal: boolean) {
    return (
      <>
        <label className={`${principal ? "mt-4" : "mt-2"} block text-sm font-medium`}>
          {t("reference")}
          <input className={champ} value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />
        </label>
        <button
          type="button"
          onClick={() => void consulter()}
          disabled={enCours || !naissanceOk || reference.trim() === ""}
          className={principal ? boutonPrincipal : boutonSecondaire}
        >
          {t("voir")}
        </button>
      </>
    );
  }

  return (
    <>
      {!sansTitre && (
        <>
          <h2 className="text-lg font-semibold tracking-tight">{t("titre")}</h2>
          <p className="mt-1 text-pretty text-sm text-text-secondary">{t("aide")}</p>
        </>
      )}
      {!connu && (
        <>
          {/*
            La date de naissance d'abord : les deux chemins la demandent. Puis
            celui qu'on a le plus de chances d'avoir en main. Une famille qui
            revient sans son e-mail a perdu sa référence, mais pas son numéro
            de téléphone ni son matricule ; celle qui arrive par le lien de la
            convocation a la référence déjà remplie.
          */}
          <p className="mt-5 text-sm font-medium">{t("naissance")}</p>
          <div className="mt-1 grid grid-cols-3 gap-2">
            <input className={champ} inputMode="numeric" aria-label={t("jour")} placeholder={t("jour")} value={jour} onChange={(e) => setJour(e.target.value)} />
            <input className={champ} inputMode="numeric" aria-label={t("mois")} placeholder={t("mois")} value={mois} onChange={(e) => setMois(e.target.value)} />
            <input className={champ} inputMode="numeric" aria-label={t("annee")} placeholder={t("annee")} value={annee} onChange={(e) => setAnnee(e.target.value)} />
          </div>

          {referenceInitiale ? blocReference(true) : blocIdentifiant(true)}

          <p className="mt-5 border-t border-border pt-4 text-xs text-text-muted">
            {referenceInitiale ? t("retrouverAide") : t("parReferenceAide")}
          </p>
          {referenceInitiale ? blocIdentifiant(false) : blocReference(false)}
        </>
      )}

      {erreur !== null && (
        <p className="mt-4 text-sm text-text-secondary">
          {erreur === "introuvable" || erreur === "complet" || erreur === "deja_reserve" || erreur === "trop_tot" || erreur === "ferme"
            ? t(`erreurs.${erreur}`)
            : t("erreurs.indisponible")}
        </p>
      )}

      {reservation !== null && (
        <div className="mt-6 rounded-xl bg-bg-alt p-4">
          <p className="text-sm font-semibold">{t("confirme")}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {formaterDate(reservation.date, locale)} · {formaterHeure(reservation.heure_debut)} – {formaterHeure(reservation.heure_fin)}
          </p>

          {reservation.lieu && (
            <p className="mt-3 flex items-start gap-2 text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>
                <span className="block text-xs text-text-muted">{t("lieu")}</span>
                <span className="font-medium">{reservation.lieu}</span>
              </span>
            </p>
          )}

          {/*
            Le statut décide du message. Afficher « envoyée » pour une
            convocation en échec faisait croire à la famille qu'elle l'avait
            reçue : elle ne pensait plus à la renvoyer.
          */}
          {reservation.convocation?.canal && (reservation.convocation.statut === "envoyee" || reservation.convocation.statut === "en_attente" || reservation.convocation.statut === "echec") && (
            <p className={`mt-2 text-xs ${reservation.convocation.statut === "echec" ? "font-medium text-danger" : "text-text-muted"}`}>
              {t(`convocation.${reservation.convocation.statut}`, {
                canal: t(reservation.convocation.canal === "whatsapp" ? "convocation.canal.whatsapp" : "convocation.canal.email"),
              })}
              {reservation.convocation.destination ? ` · ${reservation.convocation.destination}` : ""}
              {reservation.convocation.fallback_utilise ? ` · ${t("convocation.secours")}` : ""}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {reservation.convocation_url && (
              <a
                href={reservation.convocation_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
              >
                {t("convocation.telecharger")}
              </a>
            )}
            <button
              type="button"
              onClick={() => void renvoyerConvocation()}
              disabled={enCours}
              className="min-h-[40px] rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary disabled:opacity-50"
            >
              {enCours ? t("convocation.envoi") : t("convocation.renvoyer")}
            </button>
          </div>

          {renvoiOk && (
            <p className="mt-2 text-xs text-text-secondary">
              {t("convocation.renvoyee")}
            </p>
          )}

          {peutModifier && (
            <button type="button" onClick={() => void annuler()} className="mt-3 text-sm text-accent underline">
              {t("annuler")}
            </button>
          )}
        </div>
      )}

      {reservation === null && sansRdv && (
        <p className="mt-6 rounded-xl bg-accent-light px-4 py-3 text-sm">{t("aucunRdv")}</p>
      )}

      {/* Les créneaux n'ont de sens qu'une fois le dossier connu : avant, la liste ne fait qu'encombrer. */}
      {reservation === null && sansRdv && (
        <ul className="mt-6 max-h-[min(20rem,45vh)] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {creneaux.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
              <span className="text-sm">
                {formaterDate(c.date, locale)} · {formaterHeure(c.heure_debut)} – {formaterHeure(c.heure_fin)}
              </span>
              {c.etat === "disponible" ? (
                <button
                  type="button"
                  onClick={() => void reserver(c.id)}
                  disabled={enCours || !naissanceOk || reference.trim() === ""}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {t("choisir")}
                </button>
              ) : (
                <span className="text-xs text-text-muted">{t("complet")}</span>
              )}
            </li>
          ))}
          {creneaux.length === 0 && <li className="text-sm text-text-muted">{t("aucun")}</li>}
        </ul>
      )}
    </>
  );
}
