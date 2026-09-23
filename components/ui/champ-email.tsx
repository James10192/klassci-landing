"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { analyserEmail, type AnalyseEmail } from "@/lib/email/verifier-email";

/**
 * La saisie d'adresse e-mail, la même dans tous les formulaires du site.
 *
 * Elle sait trois choses qu'un `<input type="email">` ignore : qu'un domaine
 * comme `gmail.con` n'existe pas, qu'un domaine comme `gmial.com` est sans doute
 * une faute, et qu'un domaine comme `esbtp.edu.ci` ne reçoit aucun courrier.
 * Dans les trois cas, une adresse qui passe ici part vers une boîte que
 * personne ne lit, et la convocation de l'école avec elle.
 *
 * Le message ne s'affiche qu'après la sortie du champ ou une tentative
 * d'envoi : reprocher une faute à quelqu'un qui tape encore est désagréable
 * et faux la moitié du temps.
 *
 * Dans un `<form>` natif, le blocage passe par `setCustomValidity` : le
 * navigateur refuse l'envoi et rend le focus au champ, sans rien exiger du
 * formulaire qui l'accueille. Les formulaires pilotés en React lisent
 * `emailBloque()` avant d'envoyer.
 */

/** L'adresse doit-elle empêcher l'envoi ? `vide` est laissé au formulaire, qui sait si le champ est requis. */
export function emailBloque(analyse: AnalyseEmail, probableConfirme: boolean): boolean {
  if (analyse.statut === "invalide" || analyse.statut === "factice") return true;
  if (analyse.statut === "faute") return analyse.certitude === "certaine" || !probableConfirme;

  return false;
}

type Proprietes = {
  label: string;
  value: string;
  onChange: (valeur: string) => void;
  /** Classe du champ, pour suivre l'habillage du formulaire hôte. */
  classeChamp: string;
  classeLabel?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  aide?: string;
  /** Erreurs venues d'ailleurs (serveur, champ requis) : affichées sous le champ, avec le même lien d'accessibilité. */
  erreurs?: string[];
  /** Force l'affichage des messages, par exemple après un appui sur « Envoyer ». */
  forcerMessages?: boolean;
  /** Prévient le formulaire hôte quand l'adresse devient bloquante ou cesse de l'être. */
  onBlocage?: (bloque: boolean) => void;
};

/**
 * La même saisie pour un `<form>` natif, qui lit ses valeurs par `FormData`.
 * L'état vit ici plutôt que dans le formulaire hôte : il n'a pas à changer de modèle.
 */
export function ChampEmailAutonome(proprietes: Omit<Proprietes, "value" | "onChange">) {
  const [valeur, setValeur] = useState("");

  return <ChampEmail {...proprietes} value={valeur} onChange={setValeur} />;
}

export function ChampEmail({
  label,
  value,
  onChange,
  classeChamp,
  classeLabel = "block text-sm font-medium",
  id,
  name,
  placeholder,
  maxLength = 254,
  required = false,
  aide,
  erreurs,
  forcerMessages = false,
  onBlocage,
}: Proprietes) {
  const t = useTranslations("email");
  const idAuto = useId();
  const idChamp = id ?? `email-${idAuto}`;
  const idAide = `${idChamp}-aide`;
  const idMessage = `${idChamp}-message`;
  const champ = useRef<HTMLInputElement>(null);

  const [touche, setTouche] = useState(false);
  // Confirmé pour UNE adresse précise : si elle change, la confirmation tombe.
  const [confirmee, setConfirmee] = useState<string | null>(null);

  const analyse = analyserEmail(value);
  const probableConfirme = confirmee !== null && confirmee === value.trim();
  const bloque = emailBloque(analyse, probableConfirme);
  const montrer = touche || forcerMessages;

  const message = (() => {
    if (analyse.statut === "invalide") return t("invalide");
    if (analyse.statut === "factice") return t("factice", { domaine: analyse.domaine });

    return null;
  })();

  useEffect(() => {
    champ.current?.setCustomValidity(bloque ? (message ?? t("fauteServeur")) : "");
  }, [bloque, message, t]);

  useEffect(() => {
    onBlocage?.(bloque);
  }, [bloque, onBlocage]);

  const suggestion = analyse.statut === "faute" && !probableConfirme ? analyse : null;
  const externes = erreurs?.length ? erreurs[0] : null;
  const afficheErreur = montrer && (message !== null || externes !== null);
  const decrit = [aide ? idAide : null, montrer ? idMessage : null].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={idChamp} className={classeLabel}>
        {label}
      </label>
      <input
        ref={champ}
        id={idChamp}
        name={name}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        aria-invalid={(montrer && (bloque || externes !== null)) || undefined}
        aria-describedby={decrit || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouche(true)}
        onInvalid={(e) => {
          setTouche(true);
          // Notre message s'affiche sous le champ ; la bulle du navigateur ferait doublon.
          if (bloque) e.preventDefault();
        }}
        className={classeChamp}
      />
      {aide && (
        <p id={idAide} className="mt-1 text-xs text-text-muted">
          {aide}
        </p>
      )}
      <div id={idMessage} aria-live="polite">
        {montrer && suggestion && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-text-secondary">
              {t("suggestion", { suggestion: suggestion.suggestion })}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(suggestion.suggestion);
                champ.current?.focus();
              }}
              aria-label={t("appliquer", { suggestion: suggestion.suggestion })}
              className="min-h-[32px] rounded-md font-semibold text-accent underline underline-offset-2 hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {suggestion.suggestion}
            </button>
            {suggestion.certitude === "probable" && (
              <button
                type="button"
                onClick={() => setConfirmee(value.trim())}
                className="min-h-[32px] rounded-md text-text-muted underline underline-offset-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {t("confirmer")}
              </button>
            )}
          </div>
        )}
        {afficheErreur && (
          <p className="mt-1 text-xs text-[#b91c1c]">{message ?? externes}</p>
        )}
      </div>
    </div>
  );
}
