import type { MDXComponents } from "mdx/types";

import { composantsBlog } from "@/components/blog/mdx";
import { ACompleter } from "@/components/institutionnel/a-completer";

/**
 * Les composants MDX des pages institutionnelles.
 *
 * Ce sont ceux du blog, repris tels quels : même colonne de lecture, même
 * typographie serif, mêmes tableaux qui défilent dans leur cadre. Écrire un
 * second jeu aurait produit deux typographies pour un seul site, et la
 * divergence serait arrivée à la première retouche.
 *
 * S'y ajoute un seul bloc, `ACompleter`, qui n'a de sens que sur ces pages :
 * un article de blog n'a pas de rubrique légale qu'on saurait obligatoire et
 * qu'on ne saurait pas remplir.
 */
export const composantsInstitutionnels: MDXComponents = {
  ...composantsBlog,
  ACompleter,
};
