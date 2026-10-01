"use client";

import { useLocale } from "next-intl";
import { useCallback, useRef, useState, type FormEvent, type ReactNode } from "react";

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

const TEXTES = {
  fr: {
    question: "Vous nous écrivez en tant que…",
    etablissement: "Établissement",
    etablissementAide: "Direction, administration : vous voulez équiper votre école.",
    etudiant: "Étudiant ou parent",
    etudiantAide: "Inscription, réinscription, rendez-vous, convocation.",
    orienteTitre: "Vos démarches se font sur le portail de votre école",
    orienteTexte:
      "KLASSCI fournit le logiciel à votre établissement, mais ne traite aucune inscription. Un message envoyé ici ne parviendra pas à votre école. Passez par son portail :",
    inscrire: "M'inscrire (nouvel étudiant)",
    reinscrire: "Me réinscrire",
    rdv: "Retrouver mon rendez-vous ou ma convocation",
    rdvAide: "Choisissez votre école, puis « J'ai déjà fait ma demande ».",
    autreQuestion: "Pour toute autre question (frais, pièces, résultats), contactez directement la scolarité de votre établissement.",
    changer: "Je me suis trompé, je représente un établissement",
    alerteTitre: "Ce message ressemble à une démarche d'étudiant",
    alerteTexte:
      "Si vous cherchez à vous inscrire, vous réinscrire ou retrouver votre convocation, votre école ne recevra pas ce message. Utilisez son portail.",
    alerteAller: "Aller au portail d'inscription",
    alerteEnvoyer: "Je représente un établissement, envoyer",
  },
  en: {
    question: "You are writing to us as…",
    etablissement: "A school",
    etablissementAide: "Management or administration: you want KLASSCI for your school.",
    etudiant: "A student or parent",
    etudiantAide: "Enrolment, re-enrolment, appointment, notice.",
    orienteTitre: "Your steps are done on your school's portal",
    orienteTexte:
      "KLASSCI supplies the software to your school but handles no enrolment. A message sent here will not reach your school. Use its portal:",
    inscrire: "Enrol (new student)",
    reinscrire: "Re-enrol",
    rdv: "Find my appointment or notice",
    rdvAide: "Pick your school, then “I have already applied”.",
    autreQuestion: "For any other question (fees, documents, results), contact your school's registrar directly.",
    changer: "My mistake, I represent a school",
    alerteTitre: "This message looks like a student request",
    alerteTexte:
      "If you are trying to enrol, re-enrol or find your notice, your school will not receive this message. Use its portal.",
    alerteAller: "Go to the enrolment portal",
    alerteEnvoyer: "I represent a school, send",
  },
} as const;

const PORTAIL = "/inscription/universite";

const CHOIX =
  "flex min-h-11 w-full flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors " +
  "hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light";
const CHOIX_ACTIF = "border-accent bg-accent-light ring-1 ring-accent";
const CHOIX_REPOS = "border-border bg-bg-card";

const LIEN_PORTAIL =
  "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-text " +
  "transition-colors hover:border-accent hover:text-accent";

export function AiguillageContact({ children }: { children: ReactNode }) {
  const locale = (useLocale() === "en" ? "en" : "fr") as "fr" | "en";
  const t = TEXTES[locale];
  const [profil, setProfil] = useState<Profil>(null);
  const [alerte, setAlerte] = useState(false);
  const confirme = useRef(false);
  const formulaire = useRef<HTMLFormElement | null>(null);

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
          {t.question}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
          {(["etablissement", "etudiant"] as const).map((valeur) => (
            <button
              key={valeur}
              type="button"
              role="radio"
              aria-checked={profil === valeur}
              onClick={() => choisir(valeur)}
              className={`${CHOIX} ${profil === valeur ? CHOIX_ACTIF : CHOIX_REPOS}`}
            >
              <span className="text-sm font-semibold text-text">{t[valeur]}</span>
              <span className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                {valeur === "etablissement" ? t.etablissementAide : t.etudiantAide}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {profil === "etudiant" && (
        <div role="status" aria-live="polite" className="mt-6 rounded-lg border border-accent/30 bg-accent-light p-5">
          <p className="font-semibold text-text">{t.orienteTitre}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{t.orienteTexte}</p>
          <div className="mt-4 space-y-2">
            <Link href={PORTAIL} className={LIEN_PORTAIL} onClick={() => track("contact_vers_portail", { cible: "inscription", locale })}>
              {t.inscrire}<span aria-hidden>→</span>
            </Link>
            <Link href={PORTAIL} className={LIEN_PORTAIL} onClick={() => track("contact_vers_portail", { cible: "reinscription", locale })}>
              {t.reinscrire}<span aria-hidden>→</span>
            </Link>
            <Link href={PORTAIL} className={LIEN_PORTAIL} onClick={() => track("contact_vers_portail", { cible: "rendez_vous", locale })}>
              <span>
                <span className="block">{t.rdv}</span>
                <span className="block text-xs font-normal text-text-muted">{t.rdvAide}</span>
              </span>
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">{t.autreQuestion}</p>
          <button
            type="button"
            onClick={() => choisir("etablissement")}
            className="mt-3 min-h-11 text-sm text-text-muted underline underline-offset-4 hover:text-text"
          >
            {t.changer}
          </button>
        </div>
      )}

      {profil === "etablissement" && (
        <div className="mt-6" onSubmitCapture={surEnvoi}>
          {alerte && (
            <div role="alert" className="mb-5 rounded-lg border border-warning/40 bg-warning/10 p-4">
              <p className="font-medium text-text">{t.alerteTitre}</p>
              <p className="mt-1 text-sm text-text-secondary">{t.alerteTexte}</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link href={PORTAIL} className="inline-flex min-h-11 w-full items-center justify-center rounded bg-accent px-4 text-sm font-medium text-white">
                  {t.alerteAller}
                </Link>
                <button
                  type="button"
                  onClick={envoyerQuandMeme}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded border border-border bg-bg-card px-4 text-sm text-text"
                >
                  {t.alerteEnvoyer}
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
