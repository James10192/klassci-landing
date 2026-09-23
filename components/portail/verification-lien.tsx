"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import { renvoyer, verifier } from "@/lib/portail/verification";

import { BoutonPrincipal, Carte, PastilleSucces, entree } from "./pieces";

type Etat =
  | { genre: "chargement" }
  | { genre: "succes"; reinscription: boolean }
  | { genre: "expire"; demandeId: string | null }
  | { genre: "erreur" }
  | { genre: "indisponible" };

/**
 * Lit le jeton puis l'efface de la barre d'adresse, avant tout autre chose.
 *
 * Le lien envoyé porte le jeton dans le FRAGMENT (`#jeton=…`) : un fragment ne
 * part jamais au serveur, ni dans les journaux d'accès, ni dans l'en-tête
 * `Referer`. Les anciens liens le portaient en paramètre (`?jeton=…`) : on le
 * lit encore, et on l'efface pareillement. Une fois l'adresse nettoyée, ni
 * l'historique, ni une capture d'écran, ni la mesure d'audience ne le voient.
 */
function prendreJeton(): string {
  const url = new URL(window.location.href);
  const jeton =
    new URLSearchParams(url.hash.slice(1)).get("jeton") ?? url.searchParams.get("jeton") ?? "";

  url.hash = "";
  url.searchParams.delete("jeton");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);

  return jeton.trim();
}

/**
 * Le lien reçu par e-mail, consommé.
 *
 * Un jeton ne sert qu'une fois : l'appel part UNE seule fois par affichage,
 * même quand React monte deux fois le composant en développement. Sans ce
 * garde, le second appel lirait « déjà utilisé » et l'écran dirait « ce lien
 * ne fonctionne pas » à quelqu'un dont la candidature vient d'être confirmée.
 */
export function VerificationLien({ ecole }: { ecole: string | null }) {
  const t = useTranslations("verification.page");
  const [etat, setEtat] = useState<Etat>({ genre: "chargement" });
  const [renvoi, setRenvoi] = useState<"aucun" | "envoye" | "echec">("aucun");
  const jeton = useRef<string | null>(null);

  const consommer = useCallback(async () => {
    const lu = jeton.current;

    if (ecole === null || lu === null || lu === "") {
      setEtat({ genre: "erreur" });
      return;
    }

    setEtat({ genre: "chargement" });
    const resultat = await verifier(ecole, "email", { jeton: lu });

    if (resultat.genre === "verifie") {
      setEtat({ genre: "succes", reinscription: resultat.corps.type === "reinscription" });
    } else if (resultat.genre === "refuse" && resultat.motif === "expire") {
      setEtat({ genre: "expire", demandeId: resultat.demandeId });
    } else if (resultat.genre === "refuse") {
      setEtat({ genre: "erreur" });
    } else {
      setEtat({ genre: "indisponible" });
    }
  }, [ecole]);

  useEffect(() => {
    if (jeton.current !== null) return;
    jeton.current = prendreJeton();
    void consommer();
  }, [consommer]);

  const demanderLien = async (demandeId: string) => {
    if (ecole === null) return;
    setRenvoi((await renvoyer(ecole, "email", demandeId)) === "envoye" ? "envoye" : "echec");
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

  const textes = {
    succes: {
      titre: etat.genre === "succes" && etat.reinscription ? t("succesReinscription") : t("succesTitre"),
      texte: t("succesTexte"),
    },
    expire: { titre: t("expireTitre"), texte: t("expireTexte") },
    erreur: { titre: t("erreurTitre"), texte: t("erreurTexte") },
    indisponible: { titre: t("erreurTitre"), texte: t("indisponibleTexte") },
  }[etat.genre];

  return (
    <Carte>
      {etat.genre === "succes" && <PastilleSucces className="mb-5" />}
      <div role={etat.genre === "succes" ? "status" : "alert"}>
        <m.h2 {...entree(1)} className="text-balance text-center text-xl font-semibold tracking-tight">{textes.titre}</m.h2>
        <m.p {...entree(2)} className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary">{textes.texte}</m.p>
      </div>

      {/* « Réessayer » renvoie le MÊME jeton, à usage unique. C'est sans risque :
          si le premier appel n'a pas atteint l'école, le jeton est intact ; s'il
          l'a atteinte et consommé, l'école répond « déjà utilisé » et l'écran
          invite à saisir le code sur la page de la demande. */}
      {etat.genre === "indisponible" && (
        <m.div {...entree(3)} className="mt-5">
          <BoutonPrincipal onClick={() => void consommer()}>{t("reessayer")}</BoutonPrincipal>
        </m.div>
      )}

      {etat.genre === "expire" && etat.demandeId !== null && renvoi !== "envoye" && (
        <m.div {...entree(3)} className="mt-5">
          <BoutonPrincipal onClick={() => void demanderLien(etat.demandeId ?? "")}>{t("renvoyerLien")}</BoutonPrincipal>
        </m.div>
      )}
      <p role="status" className={`text-center text-sm empty:hidden [&:not(:empty)]:mt-3 ${renvoi === "echec" ? "text-erreur" : "text-text-secondary"}`}>
        {renvoi === "envoye" ? t("lienRenvoye") : renvoi === "echec" ? t("indisponibleTexte") : null}
      </p>

      <p className="mt-5 text-center">
        <Link href="/" className="inline-flex min-h-[44px] items-center px-3 text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">
          {t("accueil")}
        </Link>
      </p>
    </Carte>
  );
}
