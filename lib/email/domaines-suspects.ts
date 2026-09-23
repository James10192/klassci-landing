import donnees from "./domaines-suspects.json" with { type: "json" };

/**
 * Les domaines d'adresse e-mail qu'on sait faux, lus depuis UN fichier de données.
 *
 * `domaines-suspects.json` est copié tel quel côté KLASSCIv2. Les deux dépôts
 * vérifient la même empreinte : SHA-256 du JSON compact (`JSON.stringify` du
 * contenu lu, clés dans l'ordre du fichier, sans espaces). Modifier la liste
 * ici sans la reporter là-bas fait échouer le test de parité des deux côtés.
 *
 * Le fichier reste en ASCII : ainsi `JSON.stringify` en JavaScript et
 * `json_encode` en PHP produisent les mêmes octets, donc la même empreinte.
 */

export const CORRECTIONS_CONNUES: Readonly<Record<string, string>> = donnees.corrections_connues;

/** Extensions fautives, et elles seules : on ne remplace jamais un pays valide par un autre. */
export const CORRECTIONS_TLD: Readonly<Record<string, string>> = donnees.corrections_tld;

/** Messageries de référence : une faute se mesure contre elles. */
export const DOMAINES_REFERENCE: readonly string[] = donnees.domaines_reference;

/**
 * Noms réels, voisins d'une référence, qu'on ne corrige jamais.
 *
 * `ymail` est à une lettre de `gmail` et appartient à Yahoo ; `mail`, `email`
 * et `gmx` existent aussi.
 */
export const NOMS_REELS_VOISINS: ReadonlySet<string> = new Set(donnees.noms_reels_voisins);

/** Domaines qui ne reçoivent aucun courrier ; leurs sous-domaines non plus. */
export const DOMAINES_FACTICES: readonly string[] = donnees.domaines_factices;

/**
 * Extensions réservées (RFC 2606 et 6761) : aucune adresse sous `.local`,
 * `.test`, `.invalid`, `.example` ou `.localhost` ne reçoit de courrier.
 */
export const EXTENSIONS_RESERVEES: ReadonlySet<string> = new Set(donnees.extensions_reservees);

export const DISTANCE_MAXIMALE: number = donnees.distance_maximale;
