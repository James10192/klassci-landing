/**
 * Ce message ressemble-t-il à une démarche d'étudiant plutôt qu'à la demande
 * d'un établissement ?
 *
 * Module pur, testé seul. Il ne bloque rien : il déclenche une confirmation
 * avant l'envoi (voir `AiguillageContact`). Il vise donc le rappel plutôt que
 * la précision — un faux positif coûte un clic à un établissement, un faux
 * négatif coûte un étudiant qui attend une réponse qui ne viendra jamais.
 *
 * Les formulations retenues sont celles des messages reçus à tort en
 * septembre 2026 : « mon inscription », « ma convocation », « mon matricule ».
 */
const SIGNAUX: RegExp[] = [
  // À la première personne seulement. « La gestion des inscriptions » est le
  // vocabulaire d'un directeur qui découvre KLASSCI ; « mon inscription » est
  // celui d'un étudiant qui s'est trompé de page.
  /\b(m'|me |mon |ma |pour )(r?e?inscri\w*)/,
  /\b(mon|ma|mes) (matricule|convocation|rendez[- ]?vous|rdv|dossier d'inscription|classe|notes?|bulletin|resultats?)\b/,
  /\b(mon|ma|notre) (fils|fille|enfant)\b/,
  /\bje (suis|me suis) (un |une |deja )?(etudiant|etudiante|eleve|parent|inscrit|inscrite)\b/,
  /\b(je n'ai pas|je n'arrive pas a|comment) (re[cç]u|recevoir|obtenir|retrouver|avoir) (ma|mon) /,
  /\bmy (enrol\w*|registration|appointment|student id|notice)\b/,
  /\bi am an? (student|parent)\b/,
];

/** Minuscules, sans accents : « Réinscription » et « reinscription » se valent. */
export function normaliserTexte(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019\u02bc]/g, "'")
    .toLowerCase();
}

export function semblePortailEtudiant(texte: string): boolean {
  const propre = normaliserTexte(texte);
  if (propre.trim() === "") return false;

  return SIGNAUX.some((motif) => motif.test(propre));
}
