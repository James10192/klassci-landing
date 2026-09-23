import {
  CORRECTIONS_CONNUES,
  CORRECTIONS_TLD,
  DISTANCE_MAXIMALE,
  DOMAINES_FACTICES,
  DOMAINES_REFERENCE,
  EXTENSIONS_RESERVEES,
  NOMS_REELS_VOISINS,
} from "./domaines-suspects.ts";

/**
 * Ce qu'on peut dire d'une adresse e-mail AVANT de l'envoyer.
 *
 * Module pur, sans React ni `server-only` : la même règle tourne sous le champ
 * du formulaire et dans la route qui relaie à l'école. KLASSCIv2 applique la
 * même règle, sur le même fichier de données.
 *
 * Un domaine se lit en deux parties, le nom et l'extension (`gmail` + `com`) :
 *
 * - l'extension ne se corrige QUE par la table explicite (`con` → `com`,
 *   `fe` → `fr`…). `live.ca`, `yahoo.de` ou `orange.cm` (Cameroun) sont de
 *   vraies adresses : on ne remplace jamais un pays valide par un autre ;
 * - le nom se compare aux messageries de référence DE LA MÊME extension, par
 *   distance d'édition (une inversion de deux lettres compte pour une).
 *
 * Deux degrés de certitude :
 *
 * - `certaine` : faute connue, ou extension fautive sur un nom exact. On bloque
 *   l'envoi jusqu'à correction, côté navigateur comme côté serveur.
 * - `probable` : le nom est à deux lettres au plus d'une référence. On le dit,
 *   et la personne peut confirmer que son adresse est bien celle-là.
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

export type RefusEmail = "invalide" | "factice" | "faute_de_frappe";

/** Assez strict pour refuser l'évidence, assez lâche pour ne jamais refuser une vraie adresse. */
const FORME_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Distance d'alignement optimal (Damerau restreinte) : insertion, suppression,
 * substitution, et inversion de deux lettres voisines, chacune pour 1.
 * `gmali` est donc à 1 de `gmail`, pas à 2.
 */
export function distanceEdition(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cout);

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/** `univ-fhb.edu.ci` → nom `univ-fhb.edu`, extension `ci`. */
function decouper(domaine: string): { nom: string; tld: string } {
  const point = domaine.lastIndexOf(".");

  return { nom: domaine.slice(0, point), tld: domaine.slice(point + 1) };
}

/** Domaine généré qui n'existe pas, ou extension réservée qui ne reçoit jamais de courrier. */
function estFactice(domaine: string): boolean {
  return (
    EXTENSIONS_RESERVEES.has(decouper(domaine).tld) ||
    DOMAINES_FACTICES.some((f) => domaine === f || domaine.endsWith(`.${f}`))
  );
}

/** Le domaine voulu et la certitude, ou `null` si rien ne cloche. */
function corriger(domaine: string): { domaine: string; certitude: "certaine" | "probable" } | null {
  const connue = CORRECTIONS_CONNUES[domaine];

  if (connue !== undefined) return { domaine: connue, certitude: "certaine" };

  const { nom, tld } = decouper(domaine);
  const tldCorrige = CORRECTIONS_TLD[tld] ?? tld;
  const extensionFautive = tldCorrige !== tld;

  let meilleur: { nom: string; distance: number } | null = null;

  if (!NOMS_REELS_VOISINS.has(nom)) {
    for (const reference of DOMAINES_REFERENCE) {
      const ref = decouper(reference);

      if (ref.tld !== tldCorrige) continue;

      const distance = distanceEdition(nom, ref.nom);

      if (distance <= DISTANCE_MAXIMALE && (meilleur === null || distance < meilleur.distance)) {
        meilleur = { nom: ref.nom, distance };
      }
    }
  }

  if (meilleur !== null && meilleur.distance > 0) {
    return { domaine: `${meilleur.nom}.${tldCorrige}`, certitude: "probable" };
  }

  // Nom exact (ou nom inconnu) : seule l'extension peut être fautive, et elle
  // ne l'est que si la table le dit.
  return extensionFautive ? { domaine: `${nom}.${tldCorrige}`, certitude: "certaine" } : null;
}

export function analyserEmail(brut: string): AnalyseEmail {
  const email = brut.trim();

  if (email === "") return { statut: "vide" };
  // Un point final (`gmail.com.`) ou double (`gmail..com`) n'est jamais une vraie adresse.
  if (!FORME_EMAIL.test(email) || email.endsWith(".") || email.includes("..")) return { statut: "invalide" };

  const arobase = email.lastIndexOf("@");
  const local = email.slice(0, arobase);
  const domaine = email.slice(arobase + 1).toLowerCase();

  if (estFactice(domaine)) return { statut: "factice", domaine };

  const correction = corriger(domaine);

  return correction === null
    ? { statut: "valide" }
    : { statut: "faute", domaine, suggestion: `${local}@${correction.domaine}`, certitude: correction.certitude };
}

/**
 * Pourquoi cette adresse empêche l'envoi, ou `null` si elle ne l'empêche pas.
 *
 * `vide` n'en fait pas partie : c'est au formulaire de dire si le champ est
 * requis. Une faute `probable` bloque tant que la personne n'a pas confirmé
 * son adresse ; une faute `certaine` bloque toujours.
 */
export function emailBloque(analyse: AnalyseEmail, probableConfirme: boolean): RefusEmail | null {
  if (analyse.statut === "invalide") return "invalide";
  if (analyse.statut === "factice") return "factice";
  if (analyse.statut === "faute" && (analyse.certitude === "certaine" || !probableConfirme)) {
    return "faute_de_frappe";
  }

  return null;
}
