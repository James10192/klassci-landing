import type { MDXComponents } from "mdx/types";

import { composantsBlog } from "@/components/blog/mdx";

/**
 * Les composants MDX des pages institutionnelles.
 *
 * Ce sont ceux du blog, repris tels quels : même colonne de lecture, même
 * typographie serif, mêmes tableaux qui défilent dans leur cadre. Écrire un
 * second jeu aurait produit deux typographies pour un seul site, et la
 * divergence serait arrivée à la première retouche.
 *
 * Il n'y a rien de plus. Un bloc `ACompleter` a existé ici : un encadré visible
 * qui listait, à l'écran, ce qu'une page légale ne pouvait pas encore dire —
 * immatriculation, forme juridique, nom du directeur de la publication. Il
 * était censé être vu et retiré avant la mise en ligne. Il ne l'a pas été, et
 * quatre pages sont restées en ligne avec une liste de courses adressée à la
 * direction, lisible par n'importe quel visiteur et par les moteurs.
 *
 * La leçon n'est pas qu'il était mal écrit : c'est qu'un brouillon publiable
 * finit publié. Ce qui manque se dit désormais hors du site, dans la revue de
 * la modification, et `scripts/verifier-notes-internes.mjs` refuse la
 * construction si une note interne réapparaît dans une page.
 */
export const composantsInstitutionnels: MDXComponents = {
  ...composantsBlog,
};
