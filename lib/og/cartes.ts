import "server-only";

import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";
import { etablissementsOuverts } from "@/lib/portail/tenants";
import { identiteEtablissement } from "@/lib/vitrine/etablissements";

import { carteEcole, carteKlassci, texteDesMetadonnees, type Rubrique } from "./carte";

export { TAILLE_CARTE as size, TYPE_CARTE as contentType } from "./carte";

/** La langue d'une adresse, ou le français si elle n'en est pas une. */
export function langueCarte(brute: string): Locale {
  return (routing.locales as readonly string[]).includes(brute) ? (brute as Locale) : routing.defaultLocale;
}

/**
 * La carte d'une page, dessinée depuis ses propres métadonnées.
 *
 * Chaque `opengraph-image.tsx` passe ici la fonction `generateMetadata` de sa
 * page : le titre de la carte est celui de l'onglet, mot pour mot.
 */
export async function carteDePage(
  // `never` : chaque page type ses paramètres à sa façon (`Locale`, `string`,
  // slug facultatif). La carte ne fait que les lui rendre tels qu'elle les a reçus.
  generateMetadata: (props: { params: Promise<never> }) => Promise<Metadata> | Metadata,
  params: { locale: string },
  rubrique: Rubrique,
) {
  const locale = langueCarte(params.locale);
  const meta = await generateMetadata({ params: Promise.resolve(params) as Promise<never> });

  return carteKlassci({ locale, rubrique, ...texteDesMetadonnees(meta) });
}

/**
 * La carte d'une école du portail d'inscription.
 *
 * Une école que le portail ne sert pas reçoit la carte générique de
 * l'inscription en ligne, sans son nom : la page, elle, répond 404, et
 * l'image ne doit pas confirmer davantage qu'une école est cliente.
 *
 * Une école servie dont l'instance ne répond pas garde sa carte, avec son
 * libellé de registre et les couleurs de KLASSCI.
 */
export async function carteDEcole(
  params: { locale: string; ecole: string },
  rubrique: "inscription" | "rendezVous",
) {
  const locale = langueCarte(params.locale);
  const servie = etablissementsOuverts().find((ecole) => ecole.code === params.ecole.toLowerCase());

  if (!servie) {
    const t = await getTranslations({ locale, namespace: "inscription.meta" });

    return carteKlassci({ locale, rubrique: "inscription", titre: t("title"), description: t("description") });
  }

  const identite = await identiteEtablissement(servie.code);

  return carteEcole({
    locale,
    rubrique,
    ecole: identite ?? {
      code: servie.code,
      nom: servie.libelle,
      sigle: "",
      ville: "",
      logo: null,
      identite: { couleurPrincipale: "#0453cb", bandeauFond: "#0453cb", bandeauTexte: "#ffffff", entete: "" },
    },
  });
}


/**
 * Les langues du site, pour les cartes des pages qui n'en déclarent pas.
 *
 * Une carte sous `[locale]` est, sans cela, dessinée à la demande en
 * production — dans une fonction qui ne contient pas les fichiers que sa page
 * lit sur le disque. C'est ainsi que les cartes des pages institutionnelles et
 * des articles ont répondu 500 en production, et 200 en local. Construites au
 * déploiement, elles ne dépendent plus de ce que la fonction embarque.
 */
export function parLangue() {
  return routing.locales.map((locale) => ({ locale }));
}
