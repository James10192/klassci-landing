"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { changerCanal, type DemandeVerification } from "@/lib/portail/verification";

import { champ } from "./pieces";

/**
 * « Je ne reçois rien sur WhatsApp » : recevoir le code par e-mail.
 *
 * Le code d'une réinscription part au contact du dossier, et un WhatsApp qui
 * ne passe pas laissait la famille sans aucune issue, sinon refaire une
 * demande qui repartait au même numéro. Ici, elle bascule sur l'e-mail du
 * dossier, ou donne l'adresse qu'elle lit vraiment ; sur l'e-mail, elle peut
 * corriger une adresse périmée. La vérification repart sous le même
 * identifiant, et l'écran de code se met à jour sur le nouveau canal.
 *
 * Une instance qui ne connaît pas encore ce geste répond 404 : le lien
 * disparaît et il reste le conseil de contacter l'école.
 */
export function ChangerCanal({
  ecole,
  demande,
  onChange,
}: {
  ecole: string;
  demande: DemandeVerification;
  onChange: (demande: DemandeVerification) => void;
}) {
  const t = useTranslations("verification.canalAlternatif");
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [email, setEmail] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [hors, setHors] = useState(false);
  const depuisWhatsapp = demande.canal === "telephone";

  if (hors) {
    return <p role="status" className="mt-3 text-pretty text-xs leading-relaxed text-text-muted">{t("indisponible")}</p>;
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mt-3 min-h-[44px] text-left text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        {depuisWhatsapp ? t("ouvrirDepuisWhatsapp") : t("ouvrirAutreAdresse")}
      </button>
    );
  }

  async function envoyer() {
    if (enCours) return;
    // Sur l'e-mail, changer de canal n'a de sens qu'avec une nouvelle adresse.
    if (!depuisWhatsapp && email.trim() === "") {
      setErreur(t("adresseRequise"));
      return;
    }

    setEnCours(true);
    setErreur(null);
    const resultat = await changerCanal(ecole, demande.demandeId, "email", email);
    setEnCours(false);

    if (resultat.genre === "envoye") {
      onChange(resultat.demande);
      return;
    }
    if (resultat.genre === "indisponible") {
      setHors(true);
      return;
    }

    setErreur(t(`erreurs.${resultat.genre}`));
  }

  return (
    <div className="mt-4 rounded-xl border border-border p-3">
      <label htmlFor={`${id}-email`} className="block text-sm font-medium">
        {depuisWhatsapp ? t("libelleDepuisWhatsapp") : t("libelleAutreAdresse")}
      </label>
      <input
        id={`${id}-email`}
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void envoyer();
        }}
        placeholder="prenom.nom@gmail.com"
        aria-invalid={erreur !== null || undefined}
        aria-describedby={`${id}-aide ${id}-erreur`}
        className={champ}
      />
      <p id={`${id}-aide`} className="mt-1 text-pretty text-xs text-text-muted">
        {depuisWhatsapp ? t("aideDepuisWhatsapp") : t("aideAutreAdresse")}
      </p>
      <p id={`${id}-erreur`} role="alert" className="text-xs text-erreur empty:hidden [&:not(:empty)]:mt-1">
        {erreur}
      </p>
      <button
        type="button"
        onClick={() => void envoyer()}
        disabled={enCours}
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-accent px-4 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-accent-light disabled:opacity-50"
      >
        {enCours ? t("envoi") : t("envoyer")}
      </button>
    </div>
  );
}
