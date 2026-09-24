import type { Metadata } from "next";

import { buildUniverseMetadata } from "@/lib/seo";
import { LANGUE_BLOG, sourcePays } from "@/lib/source";

/**
 * Les pages pays, vues depuis les routes.
 *
 * La liste est fermée, comme celle des pages institutionnelles : une page pays
 * engage l'éditeur sur ce qu'il sait faire dans ce pays. Un fichier MDX posé
 * dans `content/pays` sans être déclaré ici n'est servi nulle part, et c'est
 * voulu — on ne publie pas un pays par accident.
 *
 * L'ordre est celui de l'affichage : le marché principal d'abord.
 */
export const PAYS = ["cote-divoire", "benin"] as const;

export type SlugPays = (typeof PAYS)[number];

/** La seule langue dans laquelle ces pages existent. */
export const LANGUE_PAYS = LANGUE_BLOG;

export interface DonneesPagePays {
  title: string;
  description?: string;
  nomPays: string;
  /** Date de dernière mise à jour, au format `AAAA-MM-JJ`. */
  dateMaj: string;
  resume?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: React.ComponentType<{ components?: any }>;
}

export function estPays(valeur: string): valeur is SlugPays {
  return (PAYS as readonly string[]).includes(valeur);
}

/** Le chemin de la page, sans préfixe de langue. */
export function cheminPays(slug: SlugPays): string {
  return `/pays/${slug}`;
}

/** Même correction que pour le blog : YAML rend parfois un objet `Date`. */
function normaliserDate(valeur: unknown): string {
  if (valeur instanceof Date) return valeur.toISOString().slice(0, 10);
  if (typeof valeur === "string") return valeur.slice(0, 10);
  return "";
}

export function pagePays(slug: SlugPays): DonneesPagePays | undefined {
  const page = sourcePays.getPage([slug]);
  if (!page) return undefined;

  const donnees = page.data as unknown as DonneesPagePays;
  return { ...donnees, dateMaj: normaliserDate(donnees.dateMaj) };
}

export function metadonneesPays(slug: SlugPays): Metadata {
  const page = pagePays(slug);
  if (!page) return {};

  return buildUniverseMetadata({
    locale: LANGUE_PAYS,
    title: page.title,
    description: page.description ?? page.resume ?? "",
    path: cheminPays(slug),
    // Aucune version anglaise : déclarer un alternate vers une page absente
    // ferait écarter la grappe hreflang entière.
    languesDisponibles: [LANGUE_PAYS],
  });
}
