/**
 * Un matricule tel qu'on le relaie à l'école.
 *
 * Copié depuis une carte ou un message, il arrive avec des espaces en trop,
 * parfois insécables, ou un retour à la ligne collé avec. On les ramène à un
 * seul espace et on retire ceux des bords ; rien d'autre. Le rapprochement
 * réel (espaces, tirets, casse) se fait chez l'école, sur la même règle pour
 * le matricule saisi et pour ceux de la base : c'est elle seule qui sait ce
 * qu'un séparateur veut dire dans ses matricules.
 */
export function compacter(matricule: string): string {
  return matricule.replace(/[\s  ]+/g, " ").trim();
}
