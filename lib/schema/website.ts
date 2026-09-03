/**
 * Le site, et les pages qui le composent.
 *
 * Un seul noeud `WebSite` pour les deux langues : c'est un site bilingue, pas
 * deux sites. La langue exacte se declare sur le `WebPage` ; la declarer sur le
 * site n'y mettrait qu'un tableau des deux.
 *
 * Aucune `potentialAction` / `SearchAction` n'est emise : la « sitelinks
 * searchbox » a ete retiree de Google le 29 novembre 2024, et le site n'expose
 * de toute facon pas d'adresse de recherche publique — la recherche de la
 * documentation est un appel a `/api/search`, pas une page de resultats.
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
    alternateName:
      locale === "fr" ? "KLASSCI, gestion scolaire" : "KLASSCI school management",
  };
}

export interface EntreePage {
  locale: Locale;
  /** Le chemin sans prefixe de langue : `/universite`, `/docs/concepts`, `/`. */
  chemin: string;
  nom: string;
  description: string;
  image?: { chemin: string; largeur: number; hauteur: number };
  /** `CollectionPage` pour une page qui liste — accueil-portail, index du blog. */
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  /** L'entite dont la page parle. Par defaut, l'organisation. */
  aPropos?: string;
  /** Les entites que la page cite sans en etre le sujet. */
  mentions?: JsonLdNoeud[];
  /** ISO 8601. Absent plutot qu'invente. */
  datePublication?: string;
  dateModification?: string;
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
