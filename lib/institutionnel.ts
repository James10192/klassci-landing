import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";
import { sourceInstitutionnel } from "@/lib/source";

/**
 * Les pages institutionnelles, vues depuis les routes.
 *
 * Fumadocs sait charger et compiler les fichiers ; ce module ajoute les deux
 * choses qui manquent : une liste FERMÉE des pages qui existent, et une date de
 * mise à jour ramenée à une forme sûre.
 *
 * La liste est fermée à dessein. Ces quatre pages ne se multiplient pas au fil
 * des semaines comme des articles : chacune a sa route déclarée dans `app/`, et
 * un fichier MDX ajouté dans `content/institutionnel` sans route
 * correspondante ne serait servi nulle part. Mieux vaut que ce soit une
 * constante qu'on lit que du contenu qu'on croit publié.
 */

export const PAGES_INSTITUTIONNELLES = [
  "a-propos",
  "securite",
  "mentions-legales",
  "confidentialite",
] as const;

export type SlugInstitutionnel = (typeof PAGES_INSTITUTIONNELLES)[number];

export interface DonneesPageInstitutionnelle {
  title: string;
  description?: string;
  /** Date de dernière mise à jour, au format `AAAA-MM-JJ`. */
  dateMaj: string;
  /** Le chapeau affiché sous le titre. */
  resume?: string;
  toc?: import("fumadocs-core/server").TableOfContents;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: React.ComponentType<{ components?: any }>;
}

/**
 * Ramène une date de frontmatter à `AAAA-MM-JJ`.
 *
 * YAML transforme `2026-09-02` sans guillemets en objet `Date`, et la
 * transformation déclarée dans le schéma n'atteint pas toujours la valeur que
 * lit le rendu — le blog rencontre exactement le même écueil et le corrige au
 * même endroit, à la lecture.
 */
function normaliserDate(valeur: unknown): string {
  if (valeur instanceof Date) return valeur.toISOString().slice(0, 10);
  if (typeof valeur === "string") return valeur.slice(0, 10);
  return "";
}

/** Le chemin de la page, sans préfixe de langue. */
export function cheminInstitutionnel(slug: SlugInstitutionnel): string {
  return `/${slug}`;
}

/**
 * Le contenu d'une page, dans la langue demandée.
 *
 * Rend `undefined` si le fichier n'existe pas, pour que l'appelant décide —
 * une page absente est un 404, pas une page vide.
 */
export function pageInstitutionnelle(
  slug: SlugInstitutionnel,
  locale: Locale,
): DonneesPageInstitutionnelle | undefined {
  const page = sourceInstitutionnel.getPage([slug], locale);
  if (!page) return undefined;

  const donnees = page.data as unknown as DonneesPageInstitutionnelle;

  return { ...donnees, dateMaj: normaliserDate(donnees.dateMaj) };
}

/**
 * La date, écrite en toutes lettres dans la langue de la page.
 *
 * `timeZone: "UTC"` n'est pas un détail : sans lui, une date écrite
 * `2026-09-02` est interprétée à minuit UTC puis affichée dans le fuseau du
 * serveur, et recule d'un jour dès que celui-ci est à l'ouest de Greenwich.
 * Une politique de confidentialité datée de la veille sur la moitié des
 * déploiements est le genre d'incohérence que personne ne remarque et que tout
 * le monde constate.
 */
export function dateLisible(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** La langue demandée si le site la sert, la langue par défaut sinon. */
export function langueSure(brute: string): Locale {
  return routing.locales.includes(brute as Locale)
    ? (brute as Locale)
    : routing.defaultLocale;
}

/**
 * Les métadonnées d'une page institutionnelle.
 *
 * Titre et description viennent du frontmatter, donc du fichier traduit : la
 * version anglaise porte son propre titre, sans qu'aucune table de
 * correspondance n'ait à être tenue à jour en parallèle du contenu.
 *
 * On passe par `buildUniverseMetadata` plutôt que d'écrire l'objet à la main —
 * c'est lui qui pose l'adresse canonique, les balises hreflang réciproques et
 * l'image de partage. Une page légale qui se déclare canonique de la page
 * d'accueil est exactement la faute que la documentation a déjà payée une fois.
 */
export function metadonneesInstitutionnelles(
  slug: SlugInstitutionnel,
  locale: Locale,
): Metadata {
  const page = pageInstitutionnelle(slug, locale);
  if (!page) return {};

  return buildUniverseMetadata({
    locale,
    title: page.title,
    description: page.description ?? page.resume ?? "",
    path: cheminInstitutionnel(slug),
  });
}
