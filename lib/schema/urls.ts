/**
 * Les adresses du graphe, construites une seule fois et de la meme maniere.
 *
 * Le prefixe de langue est systematique sur ce site (`localePrefix: "always"`),
 * donc toute adresse de page en porte un. Les `@id` d'entites, eux, n'en
 * portent jamais : l'organisation KLASSCI ne change pas selon la langue de la
 * page qui la decrit.
 */

import type { Locale } from "@/i18n/routing";

import { LANGUE_BCP47, SITE_URL } from "./constantes";

/** L'adresse absolue d'une page, prefixe de langue compris. */
export function urlPage(locale: Locale, chemin: string): string {
  const normalise =
    chemin === "/" ? "" : chemin.startsWith("/") ? chemin : `/${chemin}`;
  return `${SITE_URL}/${locale}${normalise}`;
}

/** L'adresse absolue d'une ressource statique. Sans prefixe de langue. */
export function urlActif(chemin: string): string {
  return `${SITE_URL}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}

/** L'etiquette BCP-47 de la langue courante. */
export function baliseLangue(locale: Locale): string {
  return LANGUE_BCP47[locale];
}

/** Le `@id` du noeud `WebPage` d'une page. */
export function idPage(locale: Locale, chemin: string): string {
  return `${urlPage(locale, chemin)}#webpage`;
}

/** Le `@id` du fil d'Ariane d'une page. */
export function idFilAriane(locale: Locale, chemin: string): string {
  return `${urlPage(locale, chemin)}#breadcrumb`;
}

/** Le `@id` du bloc FAQ d'une page. */
export function idFaq(locale: Locale, chemin: string): string {
  return `${urlPage(locale, chemin)}#faq`;
}

/** Le `@id` de l'article d'une page de documentation ou de blog. */
export function idArticle(locale: Locale, chemin: string): string {
  return `${urlPage(locale, chemin)}#article`;
}
