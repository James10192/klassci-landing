/**
 * Les instances de démonstration, jamais offertes au public.
 *
 * Une seule notion, deux surfaces. Le mur de la page d'accueil l'écartait déjà
 * — c'était le sens de `VITRINE_EXCLUS`. Mais la **liste d'inscription en
 * ligne**, elle, ne l'écartait pas : l'instance de démonstration s'y proposait
 * aux familles sous le nom que la dernière démonstration y avait laissé,
 * « AZERTY », entre des écoles réelles. Un parent pouvait choisir cette école
 * et y déposer l'état civil de son enfant.
 *
 * Ce n'est pas un défaut d'affichage : c'est de l'état civil qui part dans un
 * bac à sable, chez une école qui n'existe pas. D'où un module partagé plutôt
 * qu'un réglage recopié — deux endroits qui décident séparément de la même
 * chose finissent par en décider différemment, et c'est arrivé ici.
 *
 * L'instance reste **adressable** par son URL directe : une démonstration du
 * parcours d'inscription doit rester possible. Elle n'est simplement plus
 * proposée à quelqu'un qui n'est pas venu la chercher.
 */

/**
 * `presentation` n'est pas un nom deviné : c'est celui que tout le produit
 * donne à cette instance — sa branche Git, son sous-domaine, sa configuration
 * de déploiement.
 *
 * Un réglage dont l'oubli publie quelque chose de faux est un réglage mal
 * choisi. Le défaut protège donc, et la variable reste le mécanisme : la poser
 * remplace cette liste, et la poser VIDE n'écarte plus personne — c'est ainsi
 * qu'on inclurait délibérément la démonstration.
 */
const DEFAUT = ["presentation"];

/**
 * `VITRINE_EXCLUS` est lue en second, pour ne pas casser un déploiement qui
 * l'aurait déjà posée. Le nouveau nom dit ce dont il s'agit : ce ne sont pas
 * des écoles qu'on cache, ce sont des instances qui ne sont pas des écoles.
 */
export function codesDemonstration(): string[] {
  const declare =
    process.env.INSTANCES_DEMONSTRATION ?? process.env.VITRINE_EXCLUS;

  if (declare === undefined) {
    return DEFAUT;
  }

  return declare
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter((code) => code !== "");
}

export function estDemonstration(code: string): boolean {
  return codesDemonstration().includes(code.trim().toLowerCase());
}
