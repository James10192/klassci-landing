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
 *
 * La meme variable portait un second defaut, plus discret : elle designait
 * l'apex `klassci.com`, alors que le site est servi sur `www.klassci.com` et
 * que l'apex y renvoie par une redirection temporaire. Les quarante adresses
 * du plan du site etaient donc syntaxiquement valides et menaient toutes a
 * une redirection, et chaque page se declarait canonique sur un hote qui ne
 * la sert pas. C'est le genre de defaut qu'aucun test ne voit : les adresses
 * sont bien formees, elles fonctionnent dans un navigateur, et seul un moteur
 * de recherche en paie le prix.
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

/** Le domaine enregistrable, c'est-a-dire l'hote prive de son eventuel `www.`. */
function sansWww(hote: string): string {
  return hote.replace(/^www\./, "");
}

/**
 * Tranche entre `klassci.com` et `www.klassci.com`.
 *
 * Vercel expose le domaine de production du projet dans
 * `VERCEL_PROJECT_PRODUCTION_URL`. Quand il designe le MEME domaine
 * enregistrable que la variable saisie a la main, mais avec ou sans `www.`,
 * c'est lui qui a raison : il decrit le domaine que la plateforme sert
 * reellement, tandis que la variable a ete tapee une fois et n'a plus jamais
 * ete relue.
 *
 * L'arbitrage s'arrete la, volontairement. Si les deux valeurs designent des
 * domaines differents — un domaine `.vercel.app`, une preproduction, un autre
 * nom —, la valeur configuree l'emporte. Suivre aveuglement la plateforme
 * ferait pointer toutes les adresses canoniques du site vers un domaine
 * technique le jour ou aucun domaine personnalise n'est attache : bien pire
 * que le defaut qu'on corrige.
 */
function arbitrerWww(configuree: string): string {
  const brut = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!brut) return configuree;

  try {
    const plateforme = new URL(
      brut.trim().startsWith("http") ? brut.trim() : `https://${brut.trim()}`,
    );
    const choisie = new URL(configuree);

    if (sansWww(plateforme.hostname) !== sansWww(choisie.hostname)) {
      return configuree;
    }

    return `${choisie.protocol}//${plateforme.hostname}`;
  } catch {
    return configuree;
  }
}

/** Origine canonique, sans barre oblique finale. Ex. `https://www.klassci.com`. */
export const SITE_URL = arbitrerWww(normaliser(process.env.NEXT_PUBLIC_SITE_URL));

/** Construit une adresse absolue a partir d'un chemin relatif. */
export function absolu(chemin: string): string {
  return new URL(chemin.startsWith("/") ? chemin : `/${chemin}`, SITE_URL).toString();
}
