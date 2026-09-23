import {
  CORRECTIONS_CONNUES,
  DISTANCE_MAXIMALE,
  DOMAINES_FACTICES,
  DOMAINES_REELS_VOISINS,
  DOMAINES_REFERENCE,
} from "./domaines-suspects.ts";

/**
 * Ce qu'on peut dire d'une adresse e-mail AVANT de l'envoyer.
 *
 * Module pur, sans React ni `server-only` : la même fonction tourne sous le
 * champ du formulaire et dans la route qui relaie à l'école. Deux règles
 * écrites séparément finiraient par diverger, et un domaine refusé d'un côté
 * passerait de l'autre.
 *
 * Deux degrés de certitude, et ils ne se traitent pas pareil :
 *
 * - `certaine` : le domaine est dans la liste des fautes connues. `gmail.con`
 *   n'existe pas, on bloque l'envoi jusqu'à correction, côté navigateur comme
 *   côté serveur.
 * - `probable` : le domaine est à deux lettres au plus d'une messagerie
 *   courante. C'est probablement une faute, mais pas sûrement : on le dit, et
 *   on laisse la personne confirmer que son adresse est bien celle-là.
 */

export type AnalyseEmail =
  | { statut: "vide" }
  | { statut: "invalide" }
  | { statut: "factice"; domaine: string }
  | {
      statut: "faute";
      domaine: string;
      /** L'adresse complète corrigée, prête à remplacer la saisie. */
      suggestion: string;
      certitude: "certaine" | "probable";
    }
  | { statut: "valide" };

/** Assez strict pour refuser l'évidence, assez lâche pour ne jamais refuser une vraie adresse. */
const FORME_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Distance de Levenshtein, bornée : au-delà de `plafond`, on renvoie `plafond + 1`. */
export function distanceEdition(a: string, b: string, plafond = Number.POSITIVE_INFINITY): number {
  if (Math.abs(a.length - b.length) > plafond) return plafond + 1;

  let precedente = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i += 1) {
    const courante = [i];
    let minimumLigne = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      const valeur = Math.min(precedente[j] + 1, courante[j - 1] + 1, precedente[j - 1] + cout);

      courante.push(valeur);
      minimumLigne = Math.min(minimumLigne, valeur);
    }

    if (minimumLigne > plafond) return plafond + 1;
    precedente = courante;
  }

  return precedente[b.length];
}

function estFactice(domaine: string): boolean {
  return DOMAINES_FACTICES.some((f) => domaine === f || domaine.endsWith(`.${f}`));
}

/** La messagerie de référence la plus proche, si elle est assez proche. */
function referenceVoisine(domaine: string): string | null {
  if (DOMAINES_REFERENCE.includes(domaine) || DOMAINES_REELS_VOISINS.has(domaine)) return null;

  let meilleure: string | null = null;
  let meilleureDistance = DISTANCE_MAXIMALE + 1;

  for (const reference of DOMAINES_REFERENCE) {
    const distance = distanceEdition(domaine, reference, DISTANCE_MAXIMALE);

    if (distance < meilleureDistance) {
      meilleure = reference;
      meilleureDistance = distance;
    }
  }

  return meilleureDistance <= DISTANCE_MAXIMALE ? meilleure : null;
}

export function analyserEmail(brut: string): AnalyseEmail {
  const email = brut.trim();

  if (email === "") return { statut: "vide" };
  if (!FORME_EMAIL.test(email)) return { statut: "invalide" };

  const arobase = email.lastIndexOf("@");
  const local = email.slice(0, arobase);
  const domaine = email.slice(arobase + 1).toLowerCase();

  if (estFactice(domaine)) return { statut: "factice", domaine };

  const connue = CORRECTIONS_CONNUES[domaine];

  if (connue !== undefined) {
    return { statut: "faute", domaine, suggestion: `${local}@${connue}`, certitude: "certaine" };
  }

  const voisine = referenceVoisine(domaine);

  if (voisine !== null) {
    return { statut: "faute", domaine, suggestion: `${local}@${voisine}`, certitude: "probable" };
  }

  return { statut: "valide" };
}

/** L'adresse corrigée à proposer, ou `null` s'il n'y a rien à proposer. */
export function suggererEmail(brut: string): string | null {
  const analyse = analyserEmail(brut);

  return analyse.statut === "faute" ? analyse.suggestion : null;
}

/**
 * Le serveur refuse-t-il cette adresse ?
 *
 * Uniquement ce qui est CERTAIN : forme cassée, domaine factice, faute connue.
 * Une faute « probable » passe, puisque la personne a pu la confirmer.
 */
export function refusServeur(brut: string): "invalide" | "factice" | "faute_de_frappe" | null {
  const analyse = analyserEmail(brut);

  if (analyse.statut === "invalide") return "invalide";
  if (analyse.statut === "factice") return "factice";
  if (analyse.statut === "faute" && analyse.certitude === "certaine") return "faute_de_frappe";

  return null;
}
