"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { champ } from "./pieces";

export type ContactsDossier = { email_masque: string | null; telephone_masque: string | null };

export type ChoixContact = {
  canal: "email" | "telephone" | null;
  /** Vide : l'adresse du dossier. */
  email: string;
  autreAdresse: boolean;
};

/**
 * Où partira le code de confirmation, avant d'envoyer la demande.
 *
 * Le code partait en silence au contact du dossier : un e-mail ancien, ou un
 * WhatsApp qui ne passe pas, et la famille restait bloquée sans savoir
 * pourquoi. Ici elle voit l'adresse et le numéro masqués, choisit, ou donne
 * l'adresse qu'elle lit vraiment. Cette adresse est transmise avec la demande ;
 * elle ne remplace pas celle du dossier sans l'école.
 *
 * Rien ne s'affiche si l'école n'envoie pas de code, ou si son instance ne dit
 * pas encore où il partirait.
 */
export function ContactDeConfirmation({
  contacts,
  choix,
  onChange,
}: {
  contacts: ContactsDossier;
  choix: ChoixContact;
  onChange: (choix: ChoixContact) => void;
}) {
  const t = useTranslations("reinscription.contact");
  const id = useId();
  const { email_masque: email, telephone_masque: telephone } = contacts;
  const deux = email !== null && telephone !== null;
  const canal = choix.canal ?? (email !== null ? "email" : telephone !== null ? "telephone" : "email");
  // Sans adresse au dossier, le champ est ouvert d'office : c'est le seul
  // moyen de recevoir le code ailleurs que sur WhatsApp.
  const champOuvert = choix.autreAdresse || email === null;

  return (
    <fieldset className="mt-5 min-w-0 rounded-xl bg-bg-alt p-4">
      <legend className="sr-only">{t("titre")}</legend>
      <p className="text-sm font-medium text-text">{t("titre")}</p>

      {deux ? (
        <div className="mt-2 space-y-1">
          {(["email", "telephone"] as const).map((option) => (
            <label key={option} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2">
              <input
                type="radio"
                name={`${id}-canal`}
                checked={canal === option}
                onChange={() => onChange({ ...choix, canal: option })}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span className="min-w-0 break-words text-sm text-text-secondary">
                {option === "email" ? t("parEmail", { destination: email }) : t("parWhatsapp", { destination: telephone })}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-1 break-words text-sm text-text-secondary">
          {email !== null
            ? t("parEmail", { destination: email })
            : telephone !== null
              ? t("parWhatsapp", { destination: telephone })
              : t("aucun")}
        </p>
      )}

      {champOuvert ? (
        <div className="mt-3">
          <label htmlFor={`${id}-email`} className="block text-sm font-medium text-text">
            {email === null ? t("emailSansDossier") : t("emailAutre")}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={choix.email}
            onChange={(e) => onChange({ ...choix, email: e.target.value, canal: e.target.value.trim() !== "" ? "email" : choix.canal })}
            placeholder="prenom.nom@gmail.com"
            className={champ}
          />
          <p className="mt-1 text-pretty text-xs text-text-muted">{t("emailAide")}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange({ ...choix, autreAdresse: true })}
          className="mt-2 min-h-[44px] text-left text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          {t("ouvrirAutre")}
        </button>
      )}
    </fieldset>
  );
}
