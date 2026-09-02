import { statSync } from "node:fs";
import { join } from "node:path";

import type { MetadataRoute } from "next";

import { source } from "@/lib/source";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

/**
 * Le plan du site.
 *
 * Deux defauts corriges ici, tous deux invisibles depuis le code et visibles
 * seulement dans la sortie reelle :
 *
 * 1. L'adresse de base etait lue directement dans l'environnement. La variable
 *    Vercel se terminait par un saut de ligne, donc chaque `<loc>` valait
 *    `https://klassci.com\n/fr` — les 32 adresses etaient invalides.
 *
 * 2. `page.url` de fumadocs porte deja le prefixe de langue (`/fr/docs/...`).
 *    Le prefixer une seconde fois produisait `/fr/fr/docs/...` et
 *    `/en/fr/docs/...` : les 24 adresses de documentation menaient a des 404,
 *    et les pages anglaises n'etaient jamais declarees.
 *
 * On ajoute aussi les alternates de langue : declarer les correspondances
 * fr/en dans le sitemap dispense d'avoir a recuperer chaque page pour lire ses
 * balises `link rel=alternate`, et c'est la methode que Google recommande
 * quand le nombre de pages augmente.
 */

const RACINE_CONTENU = join(process.cwd(), "content/docs");

/**
 * Date de derniere modification reelle du fichier source.
 *
 * `new Date()` a chaque construction annonce que tout le site a change a
 * chaque deploiement : le signal devient du bruit et un robot finit par
 * l'ignorer. On lit donc la date du fichier, avec repli sur la date de
 * construction si le chemin ne se resout pas.
 */
function derniereModification(candidats: string[]): Date {
  for (const candidat of candidats) {
    try {
      return statSync(join(RACINE_CONTENU, candidat)).mtime;
    } catch {
      // Le fichier n'existe pas sous ce nom : on essaie le suivant.
    }
  }
  return new Date();
}

/** Correspondances fr/en d'un meme chemin, x-default compris. */
function alternates(chemin: string) {
  const languages: Record<string, string> = {};
  for (const langue of routing.locales) {
    languages[langue] = `${SITE_URL}/${langue}${chemin}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${chemin}`;
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();

  const pagesVitrine = ["", "/universite", "/college", "/lms"];

  const vitrine: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    pagesVitrine.map((chemin) => ({
      url: `${SITE_URL}/${locale}${chemin}`,
      lastModified: maintenant,
      changeFrequency: "weekly" as const,
      priority: chemin === "" ? 1 : chemin === "/lms" ? 0.7 : 0.9,
      alternates: alternates(chemin),
    })),
  );

  // `getPages(locale)` renvoie l'arbre de la langue demandee et `page.url`
  // contient deja `/fr` ou `/en`. On ne prefixe donc rien.
  const documentation: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    source.getPages(locale).map((page) => {
      const nom = page.file.flattenedPath || page.file.path;
      const cheminSansLangue = page.url.replace(new RegExp(`^/${locale}`), "");

      return {
        url: `${SITE_URL}${page.url}`,
        lastModified: derniereModification([
          `${nom}.${locale}.mdx`,
          `${nom}.mdx`,
          page.file.path,
        ]),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: alternates(cheminSansLangue),
      };
    }),
  );

  return [...vitrine, ...documentation];
}
