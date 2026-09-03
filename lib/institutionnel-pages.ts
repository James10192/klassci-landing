/**
 * Ce que les quatre pages institutionnelles sont, sans rien lire du disque.
 *
 * Séparé de `lib/institutionnel.ts` pour une raison mécanique : ce dernier lit
 * des fichiers MDX et importe le chargeur Fumadocs, donc du code qui ne peut
 * pas partir dans un navigateur. La barre de navigation, elle, est un composant
 * client, et elle a besoin de savoir quelles pages existent et où elles mènent.
 *
 * Sans cette séparation, il fallait choisir entre recopier la liste dans le
 * menu — où elle aurait divergé du registre à la première page ajoutée — et
 * embarquer `node:fs` dans le paquet servi au visiteur. La construction a
 * d'ailleurs refusé le second, ce qui est le bon comportement.
 *
 * La liste est fermée à dessein. Ces quatre pages ne se multiplient pas au fil
 * des semaines comme des articles : chacune a sa route déclarée dans `app/`, et
 * un fichier MDX ajouté sans route correspondante ne serait servi nulle part.
 */

export const PAGES_INSTITUTIONNELLES = [
  "a-propos",
  "securite",
  "mentions-legales",
  "confidentialite",
] as const;

export type SlugInstitutionnel = (typeof PAGES_INSTITUTIONNELLES)[number];

/** Le chemin de la page, sans préfixe de langue. */
export function cheminInstitutionnel(slug: SlugInstitutionnel): string {
  return `/${slug}`;
}
