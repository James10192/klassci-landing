/**
 * Ce qu'une demande ABOUTIE rapporte, lu sans transtypage.
 *
 * Candidature et réinscription reçoivent la même chose au moment où l'école
 * accepte le dossier, directement ou après vérification du contact : une
 * référence publique, et les dates d'accueil sur place. Un seul lecteur pour
 * les deux, qui vérifie chaque champ au lieu de le croire sur parole.
 */

/**
 * Quand l'école reçoit sur place, tel que le serveur le dit.
 *
 * `debut` est une date ISO ou null quand l'école n'en a pas renseigné ;
 * `ouvertes` dit si ce jour est arrivé, calculé côté serveur, où l'on connaît
 * le fuseau de l'école.
 */
export type Physiques = { debut: string | null; ouvertes: boolean };

export type Aboutissement = { reference: string | null; physiques: Physiques | null };

export function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return valeur !== null && typeof valeur === "object" && !Array.isArray(valeur);
}

/** Une date ISO courte : c'est ce que l'écran met en forme, rien d'autre ne passe. */
const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function lirePhysiques(valeur: unknown): Physiques | null {
  if (!estObjet(valeur) || typeof valeur.ouvertes !== "boolean") return null;

  const debut = valeur.debut;

  if (debut !== null && (typeof debut !== "string" || !DATE_ISO.test(debut))) return null;

  return { debut, ouvertes: valeur.ouvertes };
}

export function lireAboutissement(corps: Record<string, unknown>): Aboutissement {
  const reference = corps.reference_publique;

  return {
    reference: typeof reference === "string" && reference !== "" ? reference : null,
    physiques: lirePhysiques(corps.inscriptions_physiques),
  };
}

/**
 * Laquelle des trois phrases de suite s'applique : l'école n'a pas annoncé de
 * date, elle en a annoncé une à venir, ou le guichet est ouvert. `date` est
 * déjà mise en forme dans la langue du visiteur.
 */
export function suiteSurPlace(
  physiques: Physiques | null,
  locale: string,
): { cle: "surPlace" | "surPlaceOuvert" | "surPlaceDate"; date: string } {
  if (physiques === null || physiques.debut === null) return { cle: "surPlace", date: "" };
  if (physiques.ouvertes) return { cle: "surPlaceOuvert", date: "" };

  return { cle: "surPlaceDate", date: dateLisible(physiques.debut, locale) };
}

export function dateLisible(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${iso}T00:00:00`),
  );
}
