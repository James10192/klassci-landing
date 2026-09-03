/**
 * La règle de recherche du sélecteur d'établissement.
 *
 * Dans son propre module, séparé du composant, pour une raison simple : c'est
 * la seule partie du sélecteur qui décide quelque chose, et c'était la seule
 * qu'on ne pouvait vérifier qu'en pilotant un navigateur à la main. Elle est
 * pure — des chaînes en entrée, des chaînes en sortie — donc Node suffit à la
 * mettre à l'épreuve, comme pour l'amortisseur du relais.
 *
 * Deux principes la gouvernent, et ils viennent tous les deux d'un défaut
 * constaté :
 *
 * 1. **On ne cherche que dans ce qui est affiché.** Le code technique de
 *    l'établissement était indexé au départ, pour que « yakro » trouve
 *    `esbtp-yakro`. Mais ce code n'apparaît nulle part à l'écran : chercher
 *    « universite » ramenait une école nommée « AZERTY », qui correspondait
 *    par son code `universite-san-pedro`. Un résultat qu'on ne peut pas
 *    expliquer en le regardant apprend à se méfier de tous les autres.
 *
 * 2. **L'acronyme se calcule, il ne se lit pas.** Un étudiant tape « esbtp »,
 *    pas « Ecole Spéciale du Bâtiment et des Travaux Publics ». Le sigle servi
 *    par les instances vaudrait, mais il porte « ESBTP » sur quatre écoles
 *    dont deux ne sont pas l'ESBTP — reste d'un clonage. Dériver l'acronyme du
 *    nom affiché le rend juste ET explicable : ce sont les initiales du nom
 *    qu'on a sous les yeux.
 */

/** Ce que la recherche a besoin de connaître d'un établissement. */
export interface EntreeCherchable {
  nom: string;
  ville: string;
}

/**
 * Ramène un texte à sa forme comparable : sans accent, sans casse.
 *
 * `NFD` sépare la lettre de son accent, et la classe `\p{Diacritic}` retire
 * l'accent devenu autonome. C'est la seule méthode qui traite correctement
 * l'ensemble des langues, plutôt qu'une table de correspondance qui oublie
 * toujours un caractère.
 */
export function comparable(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Les mots qui ne portent pas d'initiale dans un acronyme français.
 *
 * Sans eux, « Ecole Spéciale du Bâtiment et des Travaux Publics » donnerait
 * « ESDBETP » plutôt que « ESBTP ».
 */
const MOTS_VIDES = new Set([
  "de", "du", "des", "d", "la", "le", "les", "l",
  "et", "en", "a", "au", "aux", "pour", "sur",
  "the", "of", "and", "for",
]);

/**
 * L'acronyme d'un nom : les initiales de ses mots pleins.
 *
 * Rend une chaîne vide en dessous de deux lettres : l'« acronyme » d'un nom
 * d'un seul mot n'est qu'une lettre, et n'apprend rien que le nom ne dise
 * déjà.
 */
export function acronyme(nom: string): string {
  const initiales = comparable(nom)
    .split(/[^a-z0-9]+/)
    .filter((mot) => mot !== "" && !MOTS_VIDES.has(mot))
    .map((mot) => mot[0])
    .join("");

  return initiales.length >= 2 ? initiales : "";
}

/** Le texte contre lequel une entrée est comparée. Calculé une fois. */
export function indexer(entree: EntreeCherchable): string {
  return `${comparable(`${entree.nom} ${entree.ville}`)} ${acronyme(entree.nom)}`;
}

/**
 * L'entrée indexée répond-elle à la requête ?
 *
 * Tous les mots doivent correspondre, pas un seul : « esbtp abidjan » ne doit
 * pas ramener l'ESBTP de Yamoussoukro. Ils peuvent être dans n'importe quel
 * ordre, parce que personne ne connaît l'ordre des mots d'un nom officiel.
 */
export function correspond(indexe: string, requete: string): boolean {
  const mots = comparable(requete).split(/\s+/).filter(Boolean);

  return mots.every((mot) => indexe.includes(mot));
}

/** Les entrées retenues, dans leur ordre d'origine. Requête vide = tout. */
export function filtrer<T extends EntreeCherchable>(entrees: T[], requete: string): T[] {
  const mots = comparable(requete).split(/\s+/).filter(Boolean);
  if (mots.length === 0) return entrees;

  return entrees.filter((entree) => correspond(indexer(entree), requete));
}
