"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  nettoyerCode,
  renvoyer,
  verifier,
  type DemandeVerification,
  type ResultatRenvoi,
  type ResultatVerification,
} from "@/lib/portail/verification";

import { BoutonPrincipal, Carte, champ, entree } from "./pieces";

const DELAI_RENVOI_S = 60;

/** L'échec d'une vérification, traduit en clé de message. `verifie` n'en a pas besoin. */
function cleEchec(resultat: Exclude<ResultatVerification, { genre: "verifie" }>): string {
  if (resultat.genre === "refuse") return `motifs.${resultat.motif ?? "inconnu"}`;
  if (resultat.genre === "tropDeTentatives") return "motifs.trop_de_tentatives";

  return "motifs.inconnu";
}

const MESSAGE_RENVOI: Record<ResultatRenvoi, { ton: "info" | "erreur"; cle: string }> = {
  envoye: { ton: "info", cle: "renvoye" },
  tropTot: { ton: "erreur", cle: "renvoiTropTot" },
  indisponible: { ton: "erreur", cle: "renvoiImpossible" },
};

/**
 * « Vérifiez votre adresse e-mail », ou votre numéro WhatsApp.
 *
 * La demande est déjà chez l'école, mais elle n'y sera traitée qu'une fois ce
 * code saisi. Le même écran sert les deux canaux et les deux parcours
 * (candidature, réinscription) : seuls le titre, la destination masquée et le
 * conseil de la dernière ligne changent.
 *
 * Le code se colle d'un bloc (`one-time-code` laisse le téléphone le proposer)
 * et part tout seul au sixième chiffre. Deux régions annoncées séparément :
 * l'erreur, en alerte, et l'information (« code renvoyé »), en statut poli.
 */
export function VerificationCode({
  ecole,
  demande,
  onVerifie,
  onModifier,
}: {
  ecole: string;
  demande: DemandeVerification;
  onVerifie: (corps: Record<string, unknown>) => void;
  onModifier?: () => void;
}) {
  const t = useTranslations("verification");
  const id = useId();
  const champCode = useRef<HTMLInputElement>(null);
  // Un appel à la fois : le sixième chiffre, « Entrée » et le bouton partent
  // parfois dans le même instant, avant que l'état « en cours » ne soit rendu.
  const enVol = useRef(false);
  const [code, setCode] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [attente, setAttente] = useState(DELAI_RENVOI_S);
  const email = demande.canal === "email";

  useEffect(() => {
    if (attente <= 0) return;
    const minuteur = window.setTimeout(() => setAttente((s) => s - 1), 1000);

    return () => window.clearTimeout(minuteur);
  }, [attente]);

  const valider = useCallback(
    async (saisi: string) => {
      if (enVol.current) return;
      if (saisi.length !== 6) {
        setErreur(t("codeIncomplet"));
        return;
      }

      enVol.current = true;
      setEnCours(true);
      setErreur(null);
      setInfo(null);
      const resultat = await verifier(ecole, demande.canal, { demande_id: demande.demandeId, code: saisi });
      enVol.current = false;
      setEnCours(false);

      if (resultat.genre === "verifie") {
        onVerifie(resultat.corps);
        return;
      }

      setCode("");
      champCode.current?.focus();
      setErreur(t(cleEchec(resultat)));
      // Un code expiré ou épuisé ne se rattrape qu'avec un nouveau : le renvoi
      // s'ouvre tout de suite au lieu de faire attendre la fin du décompte.
      if (resultat.genre === "refuse" && resultat.motif !== null && resultat.motif !== "code_invalide") {
        setAttente(0);
      }
    },
    [demande, ecole, onVerifie, t],
  );

  const demanderRenvoi = useCallback(async () => {
    if (attente > 0) return;
    setAttente(DELAI_RENVOI_S);
    const message = MESSAGE_RENVOI[await renvoyer(ecole, demande.canal, demande.demandeId)];

    setErreur(message.ton === "erreur" ? t(message.cle) : null);
    setInfo(message.ton === "info" ? t(message.cle) : null);
  }, [attente, demande, ecole, t]);

  const ids = { aide: `${id}-aide`, erreur: `${id}-erreur`, info: `${id}-info` };

  return (
    <Carte>
      <m.div {...entree(0)}>
        <h2 className="text-balance text-xl font-semibold tracking-tight">
          {email ? t("titreEmail") : t("titreTelephone")}
        </h2>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-text-secondary">
          {t(email ? "texteEmail" : "texteTelephone", { destination: demande.destination })}
        </p>
      </m.div>

      <m.div {...entree(1)} className="mt-5">
        <label htmlFor={`${id}-code`} className="block text-sm font-medium">{t("code")}</label>
        <input
          ref={champCode}
          id={`${id}-code`}
          value={code}
          onChange={(e) => {
            const propre = nettoyerCode(e.target.value);
            setCode(propre);
            if (propre.length === 6) void valider(propre);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void valider(code);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="123456"
          aria-invalid={erreur !== null || undefined}
          aria-describedby={`${ids.aide} ${ids.erreur} ${ids.info}`}
          className={`${champ} text-center text-xl tracking-[0.5em] tabular-nums`}
        />
        <p id={ids.aide} className="mt-1 text-xs text-text-muted">{t("codeAide")}</p>
        <p id={ids.erreur} role="alert" className="text-xs text-erreur empty:hidden [&:not(:empty)]:mt-1">
          {erreur}
        </p>
        <p id={ids.info} role="status" aria-live="polite" className="text-xs text-text-secondary empty:hidden [&:not(:empty)]:mt-1">
          {info}
        </p>
      </m.div>

      <m.div {...entree(2)} className="mt-4">
        <BoutonPrincipal onClick={() => void valider(code)} disabled={enCours} occupe={enCours}>
          {enCours ? t("validation") : t("valider")}
        </BoutonPrincipal>
      </m.div>

      <m.div {...entree(3)} className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={() => void demanderRenvoi()}
          disabled={attente > 0}
          className="min-h-[44px] font-medium text-accent underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
        >
          {attente > 0 ? t("renvoyerDans", { secondes: attente }) : t("renvoyer")}
        </button>
        {onModifier && (
          <button
            type="button"
            onClick={onModifier}
            className="min-h-[44px] text-text-secondary underline underline-offset-2 hover:text-text"
          >
            {email ? t("modifierEmail") : t("modifierTelephone")}
          </button>
        )}
      </m.div>

      <p className="mt-3 text-pretty text-xs leading-relaxed text-text-muted">
        {email ? t("spam") : t("spamTelephone")}
      </p>
    </Carte>
  );
}
