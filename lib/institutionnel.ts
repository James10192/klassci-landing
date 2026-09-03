import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";
import {
  cheminInstitutionnel,
  PAGES_INSTITUTIONNELLES,
  type SlugInstitutionnel,
} from "@/lib/institutionnel-pages";
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

// Réexportés depuis le module pur, pour que les appelants n'aient pas à savoir
// lequel des deux modules les porte — et que ceux qui n'ont besoin que de la
// liste puissent l'importer sans embarquer la lecture de fichiers.
export { PAGES_INSTITUTIONNELLES, cheminInstitutionnel };
export type { SlugInstitutionnel };

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

/**
 * La page est-elle encore un brouillon ?
 *
 * Ces quatre pages ont été servies en ligne pendant plusieurs jours avec, à
 * l'écran, un encadré adressé à la direction : « les éléments suivants doivent
 * être fournis avant la mise en ligne ». Le mécanisme de cette fonction avait
 * bien fait son travail — la page était `noindex` et hors du plan du site,
 * donc invisible des moteurs — mais elle restait lisible par n'importe quel
 * visiteur, et un visiteur est précisément qui lit une page de mentions
 * légales. Protéger le référencement d'un brouillon ne le rend pas moins
 * publié.
 *
 * Le marqueur est donc devenu explicite : `brouillon: true` en tête du
 * fichier. On ne décrète plus le brouillon en lisant la présence d'un encadré
 * publiable, parce qu'un brouillon publiable finit publié. Ce qui manque à une
 * page se dit hors du site, et `scripts/verifier-notes-internes.mjs` refuse la
 * construction si une note interne réapparaît dans un fichier servi.
 */
export function estBrouillon(slug: SlugInstitutionnel, locale: Locale): boolean {
  const suffixe = locale === routing.defaultLocale ? "" : `.${locale}`;
  const chemin = join(
    process.cwd(),
    "content/institutionnel",
    `${slug}${suffixe}.mdx`,
  );

  try {
    const source = readFileSync(chemin, "utf8");
    const entete = source.split(/^---$/m)[1] ?? "";

    return /^\s*brouillon\s*:\s*true\s*$/m.test(entete);
  } catch {
    // Fichier illisible : on ne publie pas ce qu'on ne peut pas relire.
    return true;
  }
}

/** Les pages complètes, dans une langue donnée. */
export function pagesPubliables(locale: Locale): SlugInstitutionnel[] {
  return PAGES_INSTITUTIONNELLES.filter((slug) => !estBrouillon(slug, locale));
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
    // Une page qui porte encore un encadré « à compléter » ne doit pas être
    // proposée comme la référence légale de l'éditeur.
    noindex: estBrouillon(slug, locale),
  });
}
