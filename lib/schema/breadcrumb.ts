/**
 * Le fil d'Ariane.
 *
 * C'est l'un des rares resultats enrichis encore vivants et faciles a
 * obtenir : Google remplace l'URL affichee sous le titre par le chemin
 * declare ici. Deux elements minimum sont exiges, ce que la fonction fait
 * respecter en refusant de produire un noeud pour la racine seule.
 *
 * Regle de bon sens que la documentation Google recommande sans l'imposer :
 * n'emettre un fil d'Ariane que la ou le visiteur en voit un, ou la ou la
 * hierarchie est reelle. Ici, les trois pages d'edition descendent bien du
 * portail d'accueil, et la documentation affiche son propre fil (Fumadocs).
 */

import type { Locale } from "@/i18n/routing";

import type { JsonLdNoeud } from "./types";
import { idFilAriane, urlPage } from "./urls";

export interface Segment {
  /** Le libelle affiche. Doit correspondre a ce que le visiteur lit. */
  nom: string;
  /** Le chemin sans prefixe de langue. Absent pour le dernier element. */
  chemin?: string;
}

const RACINE: Record<Locale, string> = { fr: "Accueil", en: "Home" };

/**
 * @param chemin Le chemin de la page courante, pour l'identifiant du noeud.
 * @param segments Les etapes APRES la racine. La racine est ajoutee ici.
 */
export function buildBreadcrumb(
  locale: Locale,
  chemin: string,
  segments: Segment[],
): JsonLdNoeud | undefined {
  if (segments.length === 0) return undefined;

  const etapes: Segment[] = [{ nom: RACINE[locale], chemin: "/" }, ...segments];

  return {
    "@type": "BreadcrumbList",
    "@id": idFilAriane(locale, chemin),
    itemListElement: etapes.map((etape, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: etape.nom,
      // `item` est facultatif sur le dernier element, et le mettre y est
      // meme deconseille : la page ne se pointe pas elle-meme.
      item:
        index === etapes.length - 1 || etape.chemin === undefined
          ? undefined
          : urlPage(locale, etape.chemin),
    })),
  };
}
