"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { renvoyer, suivre, type DemandeVerification, type ResultatSuivi } from "@/lib/portail/verification";

import { Carte, entree } from "./pieces";

const INTERVALLE_SUIVI_MS = 5000;
const DELAI_NOUVEAU_LIEN_S = 60;

/**
 * « Confirmez votre numéro WhatsApp », dans l'autre sens : la famille envoie le
 * code à l'école au lieu de le recevoir.
 *
 * Un numéro WhatsApp Web qui écrit à des inconnus se fait bloquer ; ici c'est
 * la famille qui ouvre la conversation, depuis un lien `wa.me` dont le message
 * et le code sont déjà écrits. Le numéro d'où part le message prouve qu'il est
 * le sien : il n'y a rien à saisir. Pendant ce temps, la page relit l'état de
 * la demande toutes les cinq secondes, et passe d'elle-même à l'écran suivant
 * dès que l'école a reçu le message.
 *
 * Le suivi s'arrête quand l'onglet est caché (la famille est dans WhatsApp) et
 * reprend dès son retour, tout de suite : c'est le moment où le message vient
 * de partir.
 */
export function VerificationWhatsapp({
  ecole,
  demande,
  onVerifie,
  onModifier,
  onRecommencer,
}: {
  ecole: string;
  demande: DemandeVerification & { lienWhatsapp: string };
  onVerifie: (corps: Record<string, unknown>) => Promise<void>;
  onModifier?: () => void;
  onRecommencer?: () => void;
}) {
  const t = useTranslations("verification");
  const [lien, setLien] = useState(demande.lienWhatsapp);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [attente, setAttente] = useState(DELAI_NOUVEAU_LIEN_S);
  // Une validation ne se rejoue jamais : l'écran suivant remplace celui-ci.
  const abouti = useRef(false);
  const enVol = useRef(false);

  const appliquer = useCallback(
    async (resultat: ResultatSuivi) => {
      if (resultat.genre === "verifie") {
        abouti.current = true;
        await onVerifie(resultat.corps);
        return;
      }
      if (resultat.genre === "enAttente") {
        setErreur(null);
        if (resultat.lien !== null) setLien(resultat.lien);
        return;
      }
      if (resultat.genre === "refuse") {
        // Code périmé ou épuisé : seul un nouveau lien débloque.
        setErreur(t(`motifs.${resultat.motif ?? "inconnu"}`));
        setAttente(0);
        return;
      }
      setErreur(t("inverse.indisponible"));
    },
    [onVerifie, t],
  );

  const relire = useCallback(async () => {
    if (enVol.current || abouti.current) return;
    enVol.current = true;
    try {
      await appliquer(await suivre(ecole, demande.demandeId));
    } finally {
      enVol.current = false;
    }
  }, [appliquer, demande.demandeId, ecole]);

  useEffect(() => {
    const minuteur = window.setInterval(() => {
      if (document.visibilityState === "visible") void relire();
    }, INTERVALLE_SUIVI_MS);
    const auRetour = () => {
      if (document.visibilityState === "visible") void relire();
    };
    document.addEventListener("visibilitychange", auRetour);

    return () => {
      window.clearInterval(minuteur);
      document.removeEventListener("visibilitychange", auRetour);
    };
  }, [relire]);

  useEffect(() => {
    if (attente <= 0) return;
    const minuteur = window.setTimeout(() => setAttente((s) => s - 1), 1000);

    return () => window.clearTimeout(minuteur);
  }, [attente]);

  const nouveauLien = useCallback(async () => {
    if (attente > 0) return;
    setAttente(DELAI_NOUVEAU_LIEN_S);
    setInfo(null);
    const renvoi = await renvoyer(ecole, demande.canal, demande.demandeId);
    if (renvoi !== "envoye") {
      setErreur(t(renvoi === "tropTot" ? "renvoiTropTot" : "renvoiImpossible"));
      return;
    }
    // Le nouveau lien n'est rendu que par le suivi : l'ancien code ne vaut plus.
    const resultat = await suivre(ecole, demande.demandeId);
    await appliquer(resultat);
    if (resultat.genre === "enAttente" && resultat.lien !== null) setInfo(t("inverse.lienRenouvele"));
  }, [appliquer, attente, demande, ecole, t]);

  return (
    <Carte>
      <m.div {...entree(0)}>
        <h2 className="text-balance text-xl font-semibold tracking-tight">{t("inverse.titre")}</h2>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-text-secondary">
          {t("inverse.texte", { destination: demande.destination })}
        </p>
      </m.div>

      <m.div {...entree(1)} className="mt-5">
        <a
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent px-5 text-center text-[15px] font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-accent-hover active:scale-[0.96]"
        >
          {t("inverse.ouvrir")}
        </a>
        <p className="mt-2 text-pretty text-xs leading-relaxed text-text-muted">{t("inverse.etapes")}</p>
      </m.div>

      <m.div {...entree(2)} className="mt-4">
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-text-secondary">
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent" />
          {t("inverse.attente")}
        </p>
        <p role="alert" className="text-xs text-erreur empty:hidden [&:not(:empty)]:mt-2">{erreur}</p>
        <p role="status" aria-live="polite" className="text-xs text-text-secondary empty:hidden [&:not(:empty)]:mt-2">{info}</p>
      </m.div>

      <m.div {...entree(3)} className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={() => void nouveauLien()}
          disabled={attente > 0}
          className="min-h-[44px] font-medium text-accent underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
        >
          {attente > 0 ? t("inverse.nouveauLienDans", { secondes: attente }) : t("inverse.nouveauLien")}
        </button>
        {onModifier && (
          <button type="button" onClick={onModifier} className="min-h-[44px] text-text-secondary underline underline-offset-2 hover:text-text">
            {t("modifierTelephone")}
          </button>
        )}
        {onRecommencer && (
          <button type="button" onClick={onRecommencer} className="min-h-[44px] text-text-secondary underline underline-offset-2 hover:text-text">
            {t("recommencer")}
          </button>
        )}
      </m.div>

      <p className="mt-3 text-pretty text-xs leading-relaxed text-text-muted">
        {t("inverse.autreTelephone", { destination: demande.destination })}
      </p>
    </Carte>
  );
}
