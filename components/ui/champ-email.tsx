"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { analyserEmail, emailBloque } from "@/lib/email/verifier-email";

/**
 * La saisie d'adresse e-mail, la même dans tous les formulaires du site.
 *
 * Elle sait trois choses qu'un `<input type="email">` ignore : qu'un domaine
 * comme `gmail.con` n'existe pas, qu'un domaine comme `gmial.com` est sans doute
 * une faute, et qu'un domaine comme `esbtp.edu.ci` ne reçoit aucun courrier.
 * Dans les trois cas, une adresse qui passe ici part vers une boîte que
 * personne ne lit, et la convocation de l'école avec elle.
 *
 * Composant entièrement contrôlé : l'adresse ET sa confirmation (« mon adresse
 * est correcte », pour une faute seulement probable) vivent chez le parent, qui
 * calcule le blocage avec `emailBloque`, la même règle que le serveur.
 *
 * Les messages n'apparaissent qu'après la sortie du champ ou une tentative
 * d'envoi : reprocher une faute à quelqu'un qui tape encore est faux la moitié
 * du temps.
 */

export type SaisieEmail = { email: string; confirme: boolean };

type Proprietes = {
  valeur: SaisieEmail;
  onChange: (valeur: SaisieEmail) => void;
  textes: { label: string; placeholder?: string; aide?: string };
  attributs?: { id?: string; name?: string; maxLength?: number; required?: boolean; autoFocus?: boolean };
  /** Classes du formulaire hôte, pour suivre son habillage. */
  classes: { champ: string; label?: string };
  /** Erreurs venues d'ailleurs (serveur, champ requis) : affichées quand le champ n'a rien à dire lui-même. */
  erreurs?: string[];
  /** Force l'affichage des messages, par exemple après un appui sur « Envoyer ». */
  forcerMessages?: boolean;
};

const BOUTON_TEXTE =
  "min-h-[44px] rounded-md underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

export function ChampEmail({ valeur, onChange, textes, attributs = {}, classes, erreurs, forcerMessages = false }: Proprietes) {
  const t = useTranslations("email");
  const idAuto = useId();
  const idChamp = attributs.id ?? `email-${idAuto}`;
  const ids = { aide: `${idChamp}-aide`, suggestion: `${idChamp}-suggestion`, erreur: `${idChamp}-erreur` };
  const champ = useRef<HTMLInputElement>(null);
  const [touche, setTouche] = useState(false);

  const analyse = analyserEmail(valeur.email);
  const refus = emailBloque(analyse, valeur.confirme);
  const montrer = touche || forcerMessages;
  const suggestion = analyse.statut === "faute" && refus !== null ? analyse : null;

  const propre =
    analyse.statut === "invalide"
      ? t("invalide")
      : analyse.statut === "factice"
        ? t("factice", { domaine: analyse.domaine })
        : null;
  const erreur = montrer ? (propre ?? (suggestion === null ? (erreurs?.[0] ?? null) : null)) : null;

  // Seul lien avec le DOM : un `<form>` natif (contact, devis) ne lit pas l'état
  // React, c'est la validité du champ qui l'empêche de partir.
  useEffect(() => {
    champ.current?.setCustomValidity(refus === null ? "" : (propre ?? t("aCorriger")));
  }, [refus, propre, t]);

  const decrit = [
    textes.aide ? ids.aide : null,
    montrer && suggestion ? ids.suggestion : null,
    erreur ? ids.erreur : null,
  ].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={idChamp} className={classes.label ?? "block text-sm font-medium"}>
        {textes.label}
      </label>
      <input
        ref={champ}
        id={idChamp}
        name={attributs.name}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoFocus={attributs.autoFocus}
        spellCheck={false}
        value={valeur.email}
        placeholder={textes.placeholder}
        maxLength={attributs.maxLength ?? 254}
        required={attributs.required}
        aria-required={attributs.required || undefined}
        aria-invalid={(montrer && (refus !== null || erreur !== null)) || undefined}
        aria-describedby={decrit || undefined}
        onChange={(e) => onChange({ email: e.target.value, confirme: false })}
        onBlur={() => setTouche(true)}
        onInvalid={(e) => {
          setTouche(true);
          // Notre message s'affiche sous le champ ; la bulle du navigateur ferait doublon.
          if (refus !== null) e.preventDefault();
        }}
        className={classes.champ}
      />
      {textes.aide && (
        <p id={ids.aide} className="mt-1 text-xs text-text-muted">
          {textes.aide}
        </p>
      )}
      <div id={ids.suggestion} role="status" aria-live="polite">
        {montrer && suggestion && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs">
            <span className="text-text-secondary">{t("suggestion", { suggestion: suggestion.suggestion })}</span>
            <button
              type="button"
              onClick={() => {
                onChange({ email: suggestion.suggestion, confirme: false });
                champ.current?.focus();
              }}
              aria-label={t("appliquer", { suggestion: suggestion.suggestion })}
              className={`${BOUTON_TEXTE} font-semibold text-accent hover:text-accent-hover`}
            >
              {suggestion.suggestion}
            </button>
            {suggestion.certitude === "probable" && (
              <button
                type="button"
                onClick={() => {
                  onChange({ email: valeur.email, confirme: true });
                  // Le bouton disparaît avec la suggestion : le focus revient au champ.
                  champ.current?.focus();
                }}
                className={`${BOUTON_TEXTE} text-text-muted hover:text-text`}
              >
                {t("confirmer")}
              </button>
            )}
          </div>
        )}
      </div>
      <p id={ids.erreur} role="alert" className="text-xs text-erreur empty:hidden [&:not(:empty)]:mt-1">
        {erreur}
      </p>
    </div>
  );
}

/**
 * La même saisie pour un `<form>` natif, qui lit ses valeurs par `FormData`.
 * L'état vit ici plutôt que dans le formulaire hôte : il n'a pas à changer de modèle.
 */
export function ChampEmailAutonome(proprietes: Omit<Proprietes, "valeur" | "onChange">) {
  const [valeur, setValeur] = useState<SaisieEmail>({ email: "", confirme: false });

  return <ChampEmail {...proprietes} valeur={valeur} onChange={setValeur} />;
}
