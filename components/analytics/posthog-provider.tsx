"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Suspense, useEffect } from "react";

import { enregistrerCollecteur, envoyer } from "@/lib/analytics/track";

/**
 * La mesure d'audience, chargee apres coup.
 *
 * `posthog-js` etait importe statiquement ici et dans `lib/analytics/track`.
 * L'initialisation etait bien differee dans un effet, mais l'import, lui, ne
 * l'etait pas : la bibliotheque partait dans le paquet principal de chaque
 * page, soit 59 ko compresses telecharges et evalues avant l'hydratation.
 *
 * Elle est desormais chargee a la demande, quand le navigateur est libre. Le
 * `PostHogProvider` officiel de la bibliotheque n'est plus utilise : il
 * imposait le meme import statique, et nous n'avions besoin d'aucun de ses
 * contextes — un seul appel a `capture` suffit.
 */

const CLE = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOTE = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const DESACTIVE = process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "true";

function refuseLeSuivi(): boolean {
  if (typeof window === "undefined") return true;
  if (window.navigator.doNotTrack === "1") return true;
  if (new URLSearchParams(window.location.search).has("noanalytics")) return true;
  return false;
}

/**
 * Attend que le navigateur n'ait plus rien d'urgent a faire.
 *
 * `requestIdleCallback` n'existe pas sur Safari avant la version 18 : le repli
 * par minuterie garantit que la mesure finit par demarrer partout, sans jamais
 * disputer le fil principal au premier rendu.
 */
function quandDisponible(action: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // On lit la fonction plutot que de tester sa presence avec `in` : le
  // retrecissement de type que provoque `in` rendrait `window` inutilisable
  // dans la branche de repli.
  const auRepos = window.requestIdleCallback as
    | typeof window.requestIdleCallback
    | undefined;

  if (typeof auRepos === "function") {
    const jeton = auRepos(action, { timeout: 4000 });
    return () => window.cancelIdleCallback?.(jeton);
  }

  const jeton = window.setTimeout(action, 2000);
  return () => window.clearTimeout(jeton);
}

function SuiviDePage() {
  const chemin = usePathname();
  const parametres = useSearchParams();
  const locale = useLocale();

  useEffect(() => {
    if (!chemin) return;
    let adresse = window.location.origin + chemin;
    const requete = parametres?.toString();
    if (requete) adresse += `?${requete}`;

    // L'evenement part meme si la bibliotheque n'est pas encore chargee : il
    // attend dans la file de `track` et sera emis au branchement.
    envoyer("$pageview", { $current_url: adresse, locale, pathname: chemin });
  }, [chemin, parametres, locale]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!CLE || DESACTIVE || refuseLeSuivi()) return;

    return quandDisponible(() => {
      void import("posthog-js").then(({ default: posthog }) => {
        if (!posthog.__loaded) {
          posthog.init(CLE, {
            api_host: HOTE,
            ui_host: "https://us.posthog.com",
            // Les vues de page sont emises par `SuiviDePage`, qui connait la
            // langue et le chemin applicatif.
            capture_pageview: false,
            capture_pageleave: true,
          });
        }
        enregistrerCollecteur((nom, props) => posthog.capture(nom, props));
      });
    });
  }, []);

  if (!CLE || DESACTIVE) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <SuiviDePage />
      </Suspense>
      {children}
    </>
  );
}
