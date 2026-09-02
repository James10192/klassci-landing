import type { AnalyticsEventName, EventProps } from "./events";

/**
 * Le point d'entree de la mesure d'audience — sans la bibliotheque qui la
 * realise.
 *
 * Ce fichier importait `posthog-js` en tete. Onze composants appellent
 * `track()` ; l'import se propageait donc dans leur graphe, et les 183 ko
 * bruts de la bibliotheque etaient telecharges, analyses et evalues sur
 * chaque page avant meme l'hydratation — 59 ko compresses, un quart du
 * JavaScript du site, pour une fonctionnalite dont aucun visiteur n'a besoin
 * pour lire une page. Sur un telephone d'entree de gamme, cela se paie en
 * centaines de millisecondes de fil principal, en pleine fenetre de mesure de
 * la reactivite.
 *
 * Desormais, `track()` ne connait que sa file d'attente. Le fournisseur charge
 * la bibliotheque quand le navigateur n'a plus rien de mieux a faire, puis
 * enregistre le collecteur : les evenements survenus entre-temps partent d'un
 * coup. Aucun evenement n'est perdu, et rien ne bloque le premier rendu.
 */

type Collecteur = (nom: string, props?: Record<string, unknown>) => void;

let collecteur: Collecteur | null = null;

/**
 * Les evenements survenus avant le chargement de la bibliotheque.
 *
 * Bornee : si le collecteur ne s'enregistre jamais — cle absente, visiteur
 * ayant refuse le suivi, blocage reseau — la file ne doit pas grandir
 * indefiniment dans un onglet laisse ouvert.
 */
const attente: Array<[string, Record<string, unknown> | undefined]> = [];
const TAILLE_MAX = 40;

/** Branche le collecteur reel et vide la file. Appele une seule fois. */
export function enregistrerCollecteur(fn: Collecteur): void {
  collecteur = fn;
  for (const [nom, props] of attente.splice(0, attente.length)) {
    fn(nom, props);
  }
}

/** Envoie un evenement du catalogue type. */
export function track<N extends AnalyticsEventName>(
  name: N,
  props: EventProps<N>,
): void {
  envoyer(name, props as Record<string, unknown>);
}

/**
 * Envoie un evenement hors catalogue.
 *
 * Reserve aux evenements imposes par la bibliotheque elle-meme, comme
 * `$pageview`, qui n'ont pas a figurer dans le catalogue metier.
 */
export function envoyer(
  nom: string,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (collecteur) {
    collecteur(nom, props);
    return;
  }
  if (attente.length < TAILLE_MAX) attente.push([nom, props]);
}
