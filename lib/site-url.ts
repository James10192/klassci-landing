/**
 * L'adresse canonique du site, en un seul endroit.
 *
 * Pourquoi un module dediee plutot qu'un `process.env.NEXT_PUBLIC_SITE_URL`
 * lu a six endroits : en production, la variable Vercel contenait un saut de
 * ligne final. Le constructeur `URL` l'ignore silencieusement, donc les
 * balises canonical restaient correctes — mais `robots.ts` et `sitemap.ts`
 * construisent leurs adresses par concatenation de chaines. Resultat :
 *
 *     <loc>https://klassci.com
 *     /fr</loc>
 *
 * Les 32 adresses du sitemap etaient invalides, et la directive `Sitemap:`
 * du robots.txt coupee en deux. Google n'avait donc aucun plan du site.
 *
 * Une faute de frappe dans une variable d'environnement ne doit pas pouvoir
 * detruire l'indexation en silence : on nettoie, on valide, et on retombe sur
 * une valeur sure si la variable est inutilisable.
 */

const SECOURS = "https://www.klassci.com";

function normaliser(brut: string | undefined): string {
  if (!brut) return SECOURS;

  // `trim()` retire l'espace, la tabulation, le \r et le \n — exactement le
  // genre de residu qu'un copier-coller depose dans une console d'hebergeur.
  const nettoye = brut.trim().replace(/\/+$/, "");
  if (!nettoye) return SECOURS;

  try {
    const url = new URL(nettoye);
    if (url.protocol !== "https:" && url.protocol !== "http:") return SECOURS;
    // `origin` reconstruit l'adresse a partir des composants analyses : tout
    // caractere parasite qui aurait survecu au trim disparait ici.
    return url.origin;
  } catch {
    return SECOURS;
  }
}

/** Origine canonique, sans barre oblique finale. Ex. `https://www.klassci.com`. */
export const SITE_URL = normaliser(process.env.NEXT_PUBLIC_SITE_URL);

/** Construit une adresse absolue a partir d'un chemin relatif. */
export function absolu(chemin: string): string {
  return new URL(chemin.startsWith("/") ? chemin : `/${chemin}`, SITE_URL).toString();
}
