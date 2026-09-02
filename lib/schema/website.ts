/**
 * Le site, et les pages qui le composent.
 *
 * Un seul noeud `WebSite` pour les deux langues : c'est un site bilingue, pas
 * deux sites. La langue de la page se declare sur le `WebPage`, ou elle est
 * exacte ; la declarer sur le site n'y mettrait qu'un tableau des deux.
 *
 * Aucune `potentialAction` / `SearchAction` n'est emise : la « sitelinks
 * searchbox » a ete retiree de Google Search le 29 novembre 2024, et le site
 * n'expose de toute facon pas d'URL de recherche publique (la recherche de la
 * documentation est un appel a `/api/search`, pas une page de resultats).
 */

import type { Locale } from "@/i18n/routing";

import { LANGUE_BCP47, ORGANISATION_ID, SITE_ID, SITE_URL } from "./constantes";
import type { JsonLdNoeud } from "./types";
import { ref } from "./types";
import { baliseLangue, idFilAriane, idPage, urlActif, urlPage } from "./urls";

export function buildWebSite(locale: Locale): JsonLdNoeud {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: "KLASSCI",
    publisher: ref(ORGANISATION_ID),
    inLanguage: [LANGUE_BCP47.fr, LANGUE_BCP47.en],
    // `locale` sert au seul appelant qui voudrait un nom localise : le nom de
    // marque ne se traduit pas, donc il n'est pas utilise ici.
    alternateName: locale === "fr" ? "KLASSCI, gestion scolaire" : "KLASSCI school management",
  };
}

export interface EntreePage {
  locale: Locale;
  /** Le chemin sans prefixe de langue. `/universite`, `/docs/concepts`, `/`. */
  chemin: string;
  nom: string;
  description: string;
  /** Le chemin de l'image d'ouverture, si la page en declare une. */
  image?: { chemin: string; largeur: number; hauteur: number };
  /** `CollectionPage` pour une page qui liste (accueil-portail, index docs). */
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  /** L'entite dont la page parle. Par defaut, l'organisation. */
  aPropos?: string;
  /** Les entites que la page cite sans en etre le sujet (etablissements clients). */
  mentions?: JsonLdNoeud[];
  /** ISO 8601. Absent plutot qu'invente. */
  datePublication?: string;
  dateModification?: string;
  /** Emis seulement si un fil d'Ariane accompagne la page. */
  avecFilAriane?: boolean;
}

export function buildWebPage({
  locale,
  chemin,
  nom,
  description,
  image,
  type = "WebPage",
  aPropos = ORGANISATION_ID,
  mentions,
  datePublication,
  dateModification,
  avecFilAriane = false,
}: EntreePage): JsonLdNoeud {
  return {
    "@type": type,
    "@id": idPage(locale, chemin),
    url: urlPage(locale, chemin),
    name: nom,
    description,
    isPartOf: ref(SITE_ID),
    about: ref(aPropos),
    mentions,
    inLanguage: baliseLangue(locale),
    datePublished: datePublication,
    dateModified: dateModification,
    breadcrumb: avecFilAriane ? ref(idFilAriane(locale, chemin)) : undefined,
    primaryImageOfPage: image
      ? {
          "@type": "ImageObject",
          url: urlActif(image.chemin),
          contentUrl: urlActif(image.chemin),
          width: image.largeur,
          height: image.hauteur,
        }
      : undefined,
  };
}
