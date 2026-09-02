import { sourceBlog } from "@/lib/source";

/**
 * Le blog, vu depuis les pages.
 *
 * Fumadocs sait charger et compiler les fichiers ; ce module ajoute ce qui
 * manque a un blog et qu'une documentation n'a pas : un ordre chronologique,
 * des rubriques, et un temps de lecture.
 */

/**
 * Ramene une date de frontmatter a `AAAA-MM-JJ`.
 *
 * YAML transforme `2026-09-02` sans guillemets en objet Date, et la
 * transformation declaree dans le schema n'atteint pas toujours la valeur que
 * lit le rendu. Plutot que d'imposer aux auteurs de penser aux guillemets, on
 * normalise ici, au seul endroit ou le blog lit ses donnees.
 */
function normaliserDate(valeur: unknown): string {
  if (valeur instanceof Date) return valeur.toISOString().slice(0, 10);
  if (typeof valeur === "string") return valeur.slice(0, 10);
  return "";
}

export interface DonneesArticle {
  title: string;
  description?: string;
  date: string;
  dateRevision?: string;
  auteur: string;
  theme: Theme;
  motCle?: string;
  resume?: string;
  sources: string[];
  toc?: import("fumadocs-core/server").TableOfContents;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: React.ComponentType<{ components?: any }>;
  structuredData?: { contents?: Array<{ content: string }> };
}

export const THEMES = [
  "lmd",
  "finance",
  "reglementation",
  "operations",
  "achat",
] as const;
export type Theme = (typeof THEMES)[number];

export const LIBELLE_THEME: Record<Theme, string> = {
  lmd: "LMD et enseignement supérieur",
  finance: "Frais et comptabilité",
  reglementation: "Réglementation",
  operations: "Opérations quotidiennes",
  achat: "Choisir un outil",
};

export interface Article {
  slug: string;
  chemin: string;
  donnees: DonneesArticle;
}

/** Tous les articles, du plus récent au plus ancien. */
export function articles(): Article[] {
  return sourceBlog
    .getPages()
    .map((page) => {
      const donnees = normaliser(page.data as unknown as DonneesArticle);
      const slug = page.slugs.join("/");
      return { slug, chemin: `/blog/${slug}`, donnees };
    })
    .sort((a, b) => b.donnees.date.localeCompare(a.donnees.date));
}

export function article(slug: string[]): Article | undefined {
  const page = sourceBlog.getPage(slug);
  if (!page) return undefined;
  return {
    slug: page.slugs.join("/"),
    chemin: `/blog/${page.slugs.join("/")}`,
    donnees: normaliser(page.data as unknown as DonneesArticle),
  };
}

/** Les champs dont la forme depend de l'ecriture du frontmatter. */
function normaliser(donnees: DonneesArticle): DonneesArticle {
  return {
    ...donnees,
    date: normaliserDate(donnees.date),
    dateRevision: donnees.dateRevision
      ? normaliserDate(donnees.dateRevision)
      : undefined,
    sources: donnees.sources ?? [],
    auteur: donnees.auteur ?? "Équipe KLASSCI",
  };
}

/**
 * Le temps de lecture, en minutes.
 *
 * Deux cents mots par minute est la valeur retenue pour un texte technique en
 * francais — plus lent que les 250 souvent cites pour de la prose courante. Ce
 * n'est pas un ornement : sur un article de quatre mille mots, savoir qu'il
 * faut vingt minutes evite d'ouvrir la page pour la refermer aussitot.
 */
export function tempsDeLecture(donnees: DonneesArticle): number {
  const contenu = donnees.structuredData?.contents ?? [];
  const mots = contenu.reduce(
    (total, bloc) => total + bloc.content.split(/\s+/).length,
    0,
  );
  return Math.max(1, Math.round(mots / 200));
}

/** La date, ecrite en toutes lettres dans la langue du site. */
export function dateLisible(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Separe le libelle d'une source de son adresse.
 *
 * Les sources sont ecrites « Libelle - https://... » dans le frontmatter :
 * une seule chaine, facile a relire dans un fichier texte, plutot qu'un objet
 * a deux champs que personne ne remplit correctement.
 */
export function decouperSource(brut: string): { libelle: string; url?: string } {
  const trouve = brut.match(/^(.*?)\s*[—–-]\s*(https?:\/\/\S+)$/);
  if (!trouve) return { libelle: brut };
  return { libelle: trouve[1].trim(), url: trouve[2] };
}
