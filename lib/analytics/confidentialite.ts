/**
 * Ce que la mesure d'audience ne doit jamais voir.
 *
 * La page `/verification-email` reçoit un jeton de vérification à usage
 * unique. Il vit dans le fragment et la page l'efface aussitôt, mais la mesure
 * ne compte pas sur cet ordre des choses : cette page n'est pas mesurée du
 * tout, et toute adresse envoyée ailleurs est nettoyée de ses paramètres
 * sensibles. Module pur, vérifié par Node.
 */

const PAGES_NON_MESUREES = /^(?:\/[a-z]{2})?\/verification-email\/?$/;

/** Paramètres qui ne sortent jamais du navigateur vers la mesure. */
const PARAMETRES_SENSIBLES = ["jeton", "code", "token"];

/** Propriétés d'évènement PostHog qui portent une adresse. */
const PROPRIETES_URL = ["$current_url", "$referrer", "$initial_referrer", "$prev_pageview_pathname", "$pathname"];

export function pageNonMesuree(chemin: string): boolean {
  return PAGES_NON_MESUREES.test(chemin);
}

/** L'adresse sans fragment ni paramètre sensible. Rend l'entrée telle quelle si ce n'est pas une URL. */
export function nettoyerUrl(adresse: string): string {
  let url: URL;

  try {
    url = new URL(adresse, "https://www.klassci.com");
  } catch {
    return adresse;
  }

  url.hash = "";
  for (const nom of PARAMETRES_SENSIBLES) url.searchParams.delete(nom);

  const relative = !/^[a-z][a-z0-9+.-]*:/i.test(adresse);

  return relative ? `${url.pathname}${url.search}` : url.toString();
}

type Evenement = { properties: Record<string, unknown> };

/**
 * Filtre `before_send` : jette tout évènement d'une page non mesurée (y compris
 * le `$pageleave` automatique) et nettoie les adresses des autres.
 */
export function filtrerEvenement<E extends Evenement>(evenement: E | null): E | null {
  if (evenement === null) return null;

  const proprietes = evenement.properties;
  const chemin = typeof proprietes.$pathname === "string" ? proprietes.$pathname : "";
  const courante = typeof proprietes.$current_url === "string" ? nettoyerUrl(proprietes.$current_url) : "";

  if (pageNonMesuree(chemin) || pageNonMesuree(new URL(courante || "/", "https://www.klassci.com").pathname)) {
    return null;
  }

  for (const cle of PROPRIETES_URL) {
    const valeur = proprietes[cle];

    if (typeof valeur === "string") proprietes[cle] = nettoyerUrl(valeur);
  }

  return evenement;
}
