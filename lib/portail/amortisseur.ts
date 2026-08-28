import "server-only";

/**
 * Ce qui amortit le trafic AVANT qu'il ne devienne un appel signé vers l'école.
 *
 * Le relais est un amplificateur : une requête entrante sur klassci.com = un
 * appel HTTPS signé vers l'instance LWS de l'école. Le point d'entrée du
 * catalogue est le pire des quatre — il n'exige aucun champ, donc aucune
 * validation locale ne le freine, et il est appelé à chaque ouverture du
 * formulaire.
 *
 * KLASSCI borne déjà ces appels par adresse et par établissement. Mais cette
 * borne s'applique APRÈS : PHP a démarré, la signature a été vérifiée, le
 * compteur a été lu. C'est du travail réel, fait avec notre propre secret pour
 * l'authentifier — donc indistinguable du trafic légitime, et non filtrable par
 * l'école. Six écoles en production sur des hébergements mutualisés.
 *
 * Deux amortisseurs, l'un et l'autre volontairement simples :
 *
 * 1. Un seau par adresse, qui refuse avant de signer.
 * 2. Un cache court des lectures, dont la charge utile est identique pour tous
 *    les visiteurs d'une même école et ne bouge que deux fois par an.
 *
 * HONNÊTETÉ SUR LA PORTÉE : les deux vivent dans la mémoire du processus. Sur
 * une plateforme sans serveur, chaque instance a la sienne, et une instance
 * fraîche démarre à zéro. Ce n'est donc PAS une garantie — c'est un facteur.
 * Il divise l'amplification par le nombre de requêtes qu'une même instance
 * absorbe, ce qui est déjà l'essentiel d'une rafale. Une vraie borne demande un
 * magasin partagé, et se posera le jour où une école sera visée pour de bon.
 */

type Fenetre = { jusqua: number; compte: number };

const FENETRE_MS = 60_000;

/** Au-delà, on purge les entrées expirées pour ne pas retenir de mémoire. */
const TAILLE_AVANT_PURGE = 5_000;

/**
 * Deux balayages ne peuvent pas se suivre de plus près que cela.
 *
 * Une purge conditionnée à la seule taille se déclenchait à CHAQUE requête dès
 * le seuil franchi : sous un afflux distribué — le scénario même que ce module
 * absorbe — la table reste au-dessus du seuil, et chaque requête payait alors
 * un parcours complet. L'amortisseur devenait coûteux précisément quand il
 * sert.
 *
 * Une fenêtre suffit : les entrées expirent au bout d'une minute, donc un
 * balayage par demi-minute libère tout ce qui est libérable, et le travail par
 * requête redevient constant.
 */
const INTERVALLE_PURGE_MS = 30_000;

const seaux = new Map<string, Fenetre>();

/** Dernier balayage par table, pour ne pas les lier entre elles. */
const dernierePurge = new WeakMap<Map<string, { jusqua: number }>, number>();

function purger(table: Map<string, { jusqua: number }>, maintenant: number): void {
  if (table.size < TAILLE_AVANT_PURGE) return;
  if (maintenant - (dernierePurge.get(table) ?? 0) < INTERVALLE_PURGE_MS) return;

  dernierePurge.set(table, maintenant);

  for (const [cle, valeur] of table) {
    if (valeur.jusqua <= maintenant) table.delete(cle);
  }
}

/**
 * Cette adresse a-t-elle dépassé son quota sur ce point d'entrée ?
 *
 * Compte AVANT de relayer, contrairement à la borne de KLASSCI qui compte
 * après. Les plafonds reprennent volontairement ceux de l'école — 30 lectures,
 * 10 écritures par minute — pour ne pas inventer une seconde politique qui
 * divergerait de la première sans que personne ne s'en aperçoive.
 */
export function debitDepasse(cle: string, maximum: number, maintenant: number): boolean {
  purger(seaux, maintenant);

  const seau = seaux.get(cle);

  if (seau === undefined || seau.jusqua <= maintenant) {
    seaux.set(cle, { jusqua: maintenant + FENETRE_MS, compte: 1 });

    return false;
  }

  seau.compte += 1;

  return seau.compte > maximum;
}

type Lecture = { jusqua: number; statut: number; corps: string; type: string };

const lectures = new Map<string, Lecture>();

/** Assez court pour qu'une école qui publie une filière la voie le jour même. */
const CACHE_MS = 60_000;

export function lectureEnCache(cle: string, maintenant: number): Lecture | null {
  const trouvee = lectures.get(cle);

  if (trouvee === undefined) return null;

  if (trouvee.jusqua <= maintenant) {
    lectures.delete(cle);

    return null;
  }

  return trouvee;
}

/**
 * Ne retient QUE les succès.
 *
 * Garder un 503 soixante secondes prolongerait une panne passagère de l'école
 * bien après qu'elle soit terminée, et garder un 4xx figerait un refus qui
 * dépend de l'état du dossier.
 */
export function retenirLecture(
  cle: string,
  reponse: { statut: number; corps: string; type: string },
  maintenant: number,
): void {
  if (reponse.statut !== 200) return;

  purger(lectures, maintenant);
  lectures.set(cle, { ...reponse, jusqua: maintenant + CACHE_MS });
}

/**
 * Combien d'entrées les deux tables retiennent.
 *
 * Existe pour `scripts/verifier-amortisseur.mjs`, et cette raison est écrite
 * ici pour qu'on ne la prenne pas pour une mesure d'exploitation : elle ne
 * compte qu'une instance, et il y en a autant que d'exécutions concurrentes.
 *
 * Sans elle, la vérification de la purge ne pouvait qu'observer un temps
 * d'exécution — donc constater qu'un balayage ne se déclenche pas, jamais que
 * la mémoire finit par être rendue. Un intervalle réglé beaucoup trop haut
 * aurait passé le contrôle avec une table qui ne redescend plus.
 */
export function tailleRetenue(): { seaux: number; lectures: number } {
  return { seaux: seaux.size, lectures: lectures.size };
}
