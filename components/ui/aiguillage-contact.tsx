"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics/track";
import { semblePortailEtudiant } from "@/lib/contact-aiguillage";

/**
 * Le tri avant le formulaire de contact.
 *
 * Ce formulaire sert aux établissements qui veulent KLASSCI. Il recevait
 * surtout des étudiants : ils cherchaient à s'inscrire, à retrouver leur
 * convocation, et tapaient le nom de leur école dans « Établissement ». Leur
 * message arrivait chez nous, qui ne gérons aucune inscription, pendant qu'ils
 * attendaient une réponse qui ne viendrait pas.
 *
 * Deux barrières, et aucune ne bloque un établissement :
 * 1. Une question d'abord, « vous êtes ? ». L'étudiant est envoyé au portail
 *    de son école, où ses démarches se font vraiment. Le formulaire n'apparaît
 *    que pour un établissement.
 * 2. À l'envoi, si le message parle d'inscription, de matricule ou de
 *    convocation, on demande confirmation avant de partir. Un vrai
 *    établissement passe en un clic.
 */

type Profil = "etablissement" | "etudiant" | null;

const PORTAIL = "/inscription/universite";

const CHOIX =
  "flex min-h-11 w-full flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors " +
  "hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light";
const CHOIX_ACTIF = "border-accent bg-accent-light ring-1 ring-accent";
const CHOIX_REPOS = "border-border bg-bg-card";

const LIEN_PORTAIL =
  "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-text " +
  "transition-colors hover:border-accent hover:text-accent";

export function AiguillageContact({
  children,
  profilInitial = null,
}: {
  children: ReactNode;
  /**
   * Le devis tarifé du collège n'est atteint que depuis la grille des prix :
   * on y sait déjà qu'on parle à un établissement, et la question n'y ajouterait
   * qu'une étape. Seule l'alerte à l'envoi y reste.
   */
  profilInitial?: Profil;
}) {
  const locale = (useLocale() === "en" ? "en" : "fr") as "fr" | "en";
  const t = useTranslations("contact.aiguillage");
  const [profil, setProfil] = useState<Profil>(profilInitial);
  const [alerte, setAlerte] = useState(false);
  const confirme = useRef(false);
  const formulaire = useRef<HTMLFormElement | null>(null);
  const refAlerte = useRef<HTMLDivElement | null>(null);

  // Le bouton d'envoi est en bas du formulaire, l'alerte en haut : sur un
  // téléphone, elle s'affichait hors de l'écran et « Envoyer » semblait ne rien
  // faire. On l'amène sous les yeux, et le focus avec.
  useEffect(() => {
    if (!alerte || refAlerte.current === null) return;
    refAlerte.current.scrollIntoView({ block: "center", behavior: "smooth" });
    refAlerte.current.focus({ preventScroll: true });
  }, [alerte]);

  const choisir = useCallback((valeur: Exclude<Profil, null>) => {
    setProfil(valeur);
    track("contact_profil", { profil: valeur, locale });
  }, [locale]);

  // Capture : on passe AVANT le onSubmit du formulaire, et on l'arrête si le
  // message ressemble à une démarche d'étudiant non encore confirmée.
  const surEnvoi = useCallback((event: FormEvent<HTMLDivElement>) => {
    const form = event.target as HTMLFormElement;
    if (!(form instanceof HTMLFormElement) || confirme.current) return;

    const donnees = new FormData(form);
    const texte = ["school", "message", "name"].map((cle) => String(donnees.get(cle) ?? "")).join(" ");
    if (!semblePortailEtudiant(texte)) return;

    event.preventDefault();
    event.stopPropagation();
    formulaire.current = form;
    setAlerte(true);
    track("contact_alerte_etudiant", { locale });
  }, [locale]);

  const envoyerQuandMeme = useCallback(() => {
    confirme.current = true;
    setAlerte(false);
    formulaire.current?.requestSubmit();
  }, []);

  return (
    <div>
      <fieldset>
        <legend className="mb-3 block text-[0.72rem] font-mono uppercase tracking-[0.08em] text-text-muted">
          {t("question")}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["etablissement", "etudiant"] as const).map((valeur) => (
            <button
              key={valeur}
              type="button"
              aria-pressed={profil === valeur}
              onClick={() => choisir(valeur)}
              className={`${CHOIX} ${profil === valeur ? CHOIX_ACTIF : CHOIX_REPOS}`}
            >
              <span className="text-sm font-semibold text-text">{t(valeur)}</span>
              <span className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                {valeur === "etablissement" ? t("etablissementAide") : t("etudiantAide")}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {profil === "etudiant" && (
        <div role="status" aria-live="polite" className="mt-6 rounded-lg border border-accent bg-accent-light p-5">
          <p className="font-semibold text-text">{t("orienteTitre")}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{t("orienteTexte")}</p>
          <div className="mt-4 space-y-2">
            <Link href={PORTAIL} className={LIEN_PORTAIL} onClick={() => track("contact_vers_portail", { cible: "inscription", locale })}>
              {t("inscrire")}<span aria-hidden>→</span>
            </Link>
            <Link href={PORTAIL} className={LIEN_PORTAIL} onClick={() => track("contact_vers_portail", { cible: "reinscription", locale })}>
              {t("reinscrire")}<span aria-hidden>→</span>
            </Link>
            <Link href={PORTAIL} className={LIEN_PORTAIL} onClick={() => track("contact_vers_portail", { cible: "rendez_vous", locale })}>
              <span>
                <span className="block">{t("rdv")}</span>
                <span className="block text-xs font-normal text-text-muted">{t("rdvAide")}</span>
              </span>
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">{t("autreQuestion")}</p>
          <button
            type="button"
            onClick={() => choisir("etablissement")}
            className="mt-3 min-h-11 text-sm text-text-muted underline underline-offset-4 hover:text-text"
          >
            {t("changer")}
          </button>
        </div>
      )}

      {profil === "etablissement" && (
        <div className="mt-6" onSubmitCapture={surEnvoi}>
          {alerte && (
            <div ref={refAlerte} tabIndex={-1} role="alert" className="mb-5 scroll-mt-24 rounded-lg border border-warning bg-warning/10 p-4 outline-none">
              <p className="font-medium text-text">{t("alerteTitre")}</p>
              <p className="mt-1 text-sm text-text-secondary">{t("alerteTexte")}</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link href={PORTAIL} className="inline-flex min-h-11 w-full items-center justify-center rounded bg-accent px-4 text-sm font-medium text-white">
                  {t("alerteAller")}
                </Link>
                <button
                  type="button"
                  onClick={envoyerQuandMeme}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded border border-border bg-bg-card px-4 text-sm text-text"
                >
                  {t("alerteEnvoyer")}
                </button>
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
