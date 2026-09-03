/**
 * Les identifiants et les faits de l'entite KLASSCI, en un seul endroit.
 *
 * Deux regles gouvernent ce fichier.
 *
 * 1. **Un `@id` est une cle primaire, pas une adresse de page.** Il identifie
 *    une chose — l'organisation, le site, une edition du produit — et reste
 *    identique sur toutes les pages et dans les deux langues. C'est ce qui
 *    permet a un moteur de comprendre que les trente pages de ce site parlent
 *    de la meme organisation, au lieu d'en deduire trente organisations.
 * 2. **Rien n'est invente.** Chaque valeur est verifiable sur le site ou dans
 *    le depot. Les champs qu'on ne sait pas remplir sont absents, et signales
 *    « A CONFIRMER » : un balisage faux coute plus cher qu'un balisage
 *    incomplet.
 */

import { SITE_URL } from "@/lib/site-url";

export { SITE_URL };

/** L'organisation KLASSCI. Un seul noeud pour tout le site, toutes langues. */
export const ORGANISATION_ID = `${SITE_URL}/#organization`;

/** African Digital Consulting, l'editeur. Voir le pied de page du site. */
export const EDITEUR_ID = `${SITE_URL}/#publisher`;

/** Le site lui-meme, dans ses deux versions linguistiques. */
export const SITE_ID = `${SITE_URL}/#website`;

/** Les editions du produit. Une entite chacune, pas une entite globale floue. */
export const EDITIONS = ["universite", "college", "lms"] as const;
export type Edition = (typeof EDITIONS)[number];

export const APPLICATION_ID: Record<Edition, string> = {
  universite: `${SITE_URL}/#app-universite`,
  college: `${SITE_URL}/#app-college`,
  lms: `${SITE_URL}/#app-lms`,
};

/** Le chemin de la page vitrine de chaque edition, sans prefixe de langue. */
export const CHEMIN_EDITION: Record<Edition, string> = {
  universite: "/universite",
  college: "/college",
  lms: "/lms",
};

/**
 * Les etiquettes BCP-47. On reprend celles que `lib/seo.ts` pose deja dans
 * `openGraph.locale` : deux vocabulaires qui se contredisent sur la meme page
 * valent moins qu'un seul, meme imparfait.
 */
export const LANGUE_BCP47 = { fr: "fr-FR", en: "en-US" } as const;

/**
 * Annee de creation. Le site ecrit « les etablissements que nous accompagnons
 * depuis 2023 » (`features.intro`) ; l'ancien balisage annoncait 2024. On
 * retient l'annee que le site montre a ses visiteurs — c'est la seule des deux
 * qu'un moteur peut recouper, et une contradiction entre le balisage et le
 * texte visible est exactement ce que les consignes sanctionnent.
 *
 * A CONFIRMER par le fondateur.
 */
export const ANNEE_CREATION = "2023";

/** Comptes officiels, tels que le pied de page les publie. */
export const PROFILS_OFFICIELS = [
  "https://www.linkedin.com/company/klassci/",
];

/** L'adresse de contact, telle que la section Contact et le pied de page l'affichent. */
export const COURRIEL_CONTACT = "contact@klassci.com";

/**
 * Les huit Etats de l'UEMOA. `areaServed` decrit le marche adresse par un
 * logiciel servi par navigateur, pas la liste des clients signes.
 *
 * A CONFIRMER : si la commercialisation reste ivoirienne pour l'instant,
 * reduire au seul « CI ». Une zone declaree trop large n'est pas sanctionnee,
 * mais elle dilue le signal.
 */
export const PAYS_DESSERVIS = ["CI", "SN", "BF", "ML", "BJ", "TG", "NE", "GW"];

/**
 * Le logo, aux dimensions reelles du fichier (`public/img/logo-klassci.png`).
 * Google exige au moins 112 pixels de cote et une adresse explorable.
 */
export const LOGO = {
  chemin: "/img/logo-klassci.png",
  largeur: 1080,
  hauteur: 1080,
} as const;

/**
 * Les navigateurs reellement supportes, repris du `browserslist` de
 * `package.json`. Une donnee vraie, verifiable, et que personne d'autre ne
 * publie : c'est ce qui fait la valeur d'un `browserRequirements`.
 */
export const NAVIGATEURS_REQUIS =
  "Chrome 100+, Safari 15+, Firefox 100+, Edge 100+";
