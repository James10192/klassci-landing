"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import { renvoyer, verifier } from "@/lib/portail/verification";

import { BoutonPrincipal, Carte, RESSORT, entree } from "./pieces";

type Etat =
  | { genre: "chargement" }
  | { genre: "succes"; reinscription: boolean }
  | { genre: "expire"; demandeId: string | null }
  | { genre: "erreur" }
  | { genre: "indisponible" };

/**
 * Le lien reçu par e-mail, consommé.
 *
 * Un jeton ne sert qu'une fois : l'appel part UNE seule fois par affichage,
 * même quand React monte deux fois le composant en développement. Sans ce
 * garde, le second appel lirait « déjà utilisé » et l'écran dirait « ce lien
 * ne fonctionne pas » à quelqu'un dont la candidature vient d'être confirmée.
 */
export function VerificationLien({ ecole, jeton }: { ecole: string | null; jeton: string }) {
  const t = useTranslations("verification.page");
  const [etat, setEtat] = useState<Etat>(
    ecole === null || jeton === "" ? { genre: "erreur" } : { genre: "chargement" },
  );
  const [renvoi, setRenvoi] = useState<"aucun" | "envoye" | "echec">("aucun");
  const lance = useRef(false);

  const consommer = useCallback(async () => {
    if (ecole === null || jeton === "") return;

    setEtat({ genre: "chargement" });
    const resultat = await verifier(ecole, "email", { jeton });

    if (resultat.genre === "verifie") {
      setEtat({ genre: "succes", reinscription: resultat.corps.type === "reinscription" });
    } else if (resultat.genre === "refuse" && resultat.motif === "expire") {
      const demandeId = resultat.corps?.demande_id;
      setEtat({ genre: "expire", demandeId: typeof demandeId === "string" ? demandeId : null });
    } else if (resultat.genre === "refuse") {
      setEtat({ genre: "erreur" });
    } else {
      setEtat({ genre: "indisponible" });
    }
  }, [ecole, jeton]);

  useEffect(() => {
    if (lance.current) return;
    lance.current = true;
    void consommer();
  }, [consommer]);

  const demanderLien = async (demandeId: string) => {
    if (ecole === null) return;
    const resultat = await renvoyer(ecole, "email", demandeId);
    setRenvoi(resultat === "envoye" ? "envoye" : "echec");
  };

  if (etat.genre === "chargement") {
    return (
      <Carte>
        <p role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-6 text-sm text-text-secondary">
          <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {t("chargement")}
        </p>
      </Carte>
    );
  }

  const titre = {
    succes: etat.genre === "succes" && etat.reinscription ? t("succesReinscription") : t("succesTitre"),
    expire: t("expireTitre"),
    erreur: t("erreurTitre"),
    indisponible: t("erreurTitre"),
  }[etat.genre];

  const texte = {
    succes: t("succesTexte"),
    expire: t("expireTexte"),
    erreur: t("erreurTexte"),
    indisponible: t("indisponibleTexte"),
  }[etat.genre];

  return (
    <Carte>
      {etat.genre === "succes" && (
        <m.div
          initial={{ scale: 0.25, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={RESSORT}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"
               strokeLinejoin="round" className="h-7 w-7 text-accent" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </m.div>
      )}
      <div role={etat.genre === "succes" ? "status" : "alert"}>
        <m.h2 {...entree(1)} className="text-balance text-center text-xl font-semibold tracking-tight">{titre}</m.h2>
        <m.p {...entree(2)} className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary">{texte}</m.p>
      </div>

      {etat.genre === "indisponible" && (
        <m.div {...entree(3)} className="mt-5">
          <BoutonPrincipal onClick={() => void consommer()}>{t("reessayer")}</BoutonPrincipal>
        </m.div>
      )}

      {etat.genre === "expire" && etat.demandeId !== null && renvoi !== "envoye" && (
        <m.div {...entree(3)} className="mt-5">
          <BoutonPrincipal onClick={() => void demanderLien(etat.demandeId as string)}>{t("renvoyerLien")}</BoutonPrincipal>
        </m.div>
      )}
      {renvoi !== "aucun" && (
        <p role="status" className={`mt-3 text-center text-sm ${renvoi === "echec" ? "text-[#b91c1c]" : "text-text-secondary"}`}>
          {renvoi === "envoye" ? t("lienRenvoye") : t("indisponibleTexte")}
        </p>
      )}

      <p className="mt-5 text-center">
        <Link href="/" className="inline-flex min-h-[44px] items-center px-3 text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">
          {t("accueil")}
        </Link>
      </p>
    </Carte>
  );
}
