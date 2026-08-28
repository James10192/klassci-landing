/**
 * Ce que le parcours de candidature manipule SANS React.
 *
 * Le fichier du parcours passait la limite que ce dépôt s'impose. Ce qui en
 * sort ici n'est pas un découpage arbitraire : ce sont les trois choses qu'on
 * peut lire, comprendre et changer sans savoir ce qu'est un état de composant
 * — la forme des dates d'ouverture, le cache de ce que l'école publie, et la
 * mise en forme du corps envoyé.
 *
 * Le cache reste une variable de module, comme avant : il doit survivre au
 * démontage du formulaire, puisque c'est précisément l'aller-retour entre les
 * deux portes du portail qu'il évite de facturer au seau de débit.
 */

import type { ChoixPublies, Formulaire } from "./candidature-champs";
import type { CleEtat } from "./candidature-ecrans";

/**
 * Quand l'école reçoit sur place, tel que le serveur le dit.
 *
 * `debut` est une date ISO ou null quand l'école n'en a pas renseigné ;
 * `ouvertes` dit si ce jour est arrivé — le calcul se fait côté serveur,
 * où l'on connaît le fuseau de l'école, pas celui du visiteur.
 */
export type Physiques = { debut: string | null; ouvertes: boolean };

/**
 * Ce que l'école a déjà publié, gardé pour la durée de la page.
 *
 * Le choix « nouveau / ancien » démonte le formulaire quand on revient en
 * arrière : sans ce cache, chaque aller-retour redemande /choix, qui passe par
 * le garde et consomme un jeton de débit. Le seau du catalogue vaut trente par
 * minute et par ADRESSE — sous le NAT d'un opérateur, très répandu en Côte
 * d'Ivoire, c'est un compteur partagé par tout un quartier en pleine rentrée.
 * Une famille qui hésite entre les deux portes en brûlerait pour ses voisins.
 */
export type ReponseChoix = { publie: ChoixPublies } | { refus: CleEtat };

export const DEJA_PUBLIE = new Map<string, ReponseChoix>();

/**
 * Un refus se retient-il pour la durée de la page ?
 *
 * Le canal fermé et l'année non configurée sont des propriétés du paramétrage
 * de l'école : elles ne changeront pas pendant la visite, et les mémoriser est
 * ce pour quoi le cache existe — la famille qui hésite entre les deux portes
 * ne brûle pas un jeton du seau partagé à chaque passage.
 *
 * Une panne, elle, ne se retient pas : ce serait figer un message qui invite à
 * réessayer dans une page où réessayer ne peut plus rien produire, et laisser
 * le formulaire sans nationalités ni filières — donc laisser partir une
 * candidature sans elles.
 */
export function refusStable(etat: CleEtat): boolean {
  return etat === "ferme" || etat === "nonConfigure";
}

/**
 * Le formulaire, tel qu'il part à l'école.
 *
 * Deux transformations, et deux seulement : les trois cases de date
 * s'assemblent en une date ISO, et un champ laissé vide n'est pas envoyé du
 * tout — le serveur distingue « non renseigné » de « renseigné vide ».
 *
 * Le reste passe tel quel, par recopie de l'objet. L'écrire champ par champ,
 * comme c'était le cas, faisait vingt-deux lignes identiques où un champ
 * ajouté au formulaire pouvait être oublié à l'envoi sans que rien ne le
 * signale. Le filtrage, lui, reste explicite côté BFF : c'est une frontière
 * de sécurité, et elle doit continuer à nommer ce qu'elle laisse passer.
 */
export function corpsAEnvoyer(form: Formulaire, consentement: boolean): Record<string, unknown> {
  const { jour, mois, annee, ...reste } = form;

  const corps: Record<string, unknown> = {
    date_naissance: `${annee}-${mois.padStart(2, "0")}-${jour.padStart(2, "0")}`,
    // La VRAIE réponse de la case, et non `true` en dur. Écrit en dur, le
    // contrôle du BFF — annoté « obligation de la loi ivoirienne 2013-450 » —
    // ne pouvait plus jamais se déclencher depuis le portail : la donnée
    // légale ne voyageait plus, c'était une constante. Le blocage local suffit
    // aujourd'hui ; il suffirait de changer sa forme pour que la garantie
    // disparaisse sans qu'une ligne du BFF ne bouge.
    consentement,
  };

  for (const [cle, valeur] of Object.entries(reste)) {
    if (valeur !== "") corps[cle] = valeur;
  }

  return corps;
}
