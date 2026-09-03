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

/**
 * L'organisation. Un seul noeud pour tout le site, toutes langues — et c'est
 * **African Digit Consulting**, pas KLASSCI.
 *
 * Le graphe declarait auparavant une organisation nommee KLASSCI, avec sa date
 * de creation, son adresse et son courriel, et rattachait ADC au-dessus comme
 * maison mere. C'etait faux : il n'existe pas de personne morale KLASSCI. La
 * societe qui edite le logiciel, contracte avec les etablissements et repond de
 * ce site est ADC ; KLASSCI est le nom du produit.
 *
 * Un moteur qui lit deux organisations la ou il n'y en a qu'une n'attribue ni
 * l'anteriorite ni la reputation au bon nom, et une entreprise declaree plus
 * grande qu'elle ne l'est se voit un jour demander des comptes la-dessus.
 */
export const ORGANISATION_ID = `${SITE_URL}/#organization`;

/** La marque KLASSCI, portee par l'organisation ci-dessus. */
export const MARQUE_ID = `${SITE_URL}/#marque`;

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
 * Depuis quand des etablissements sont accompagnes. Le site l'ecrit :
 * « les etablissements que nous accompagnons depuis 2023 » (`features.intro`).
 *
 * Ce n'est PAS la date de creation d'African Digit Consulting, qui n'est pas
 * connue de ce depot. Elle n'est donc plus posee en `foundingDate` : dater la
 * naissance d'une societe d'apres l'anciennete d'un de ses produits est une
 * affirmation qu'on ne saurait pas defendre.
 */
export const ANNEE_PREMIERS_ETABLISSEMENTS = "2023";

/**
 * Comptes officiels, tels que le pied de page les publie. Les deux appartiennent
 * a African Digit Consulting : la page LinkedIn a ete renommee au profit du
 * produit, la page Facebook porte encore le nom de la societe.
 */
export const PROFILS_OFFICIELS = [
  "https://www.linkedin.com/company/klassci/",
  "https://web.facebook.com/p/African-Digit-Consulting-100092649035928/",
];

/**
 * Ce que fait la societe, en une phrase. Elle decrit ADC — pas le produit :
 * la description commerciale de KLASSCI vit sur le noeud `Brand`, ou elle est
 * a sa place. Confondre les deux ferait dire au graphe que la societe EST le
 * logiciel.
 */
export const DESCRIPTION_EDITEUR: Record<"fr" | "en", string> = {
  fr: "African Digit Consulting edite KLASSCI, un logiciel de gestion scolaire, depuis Abidjan.",
  en: "African Digit Consulting publishes KLASSCI, a school management platform, from Abidjan.",
};

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
