import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Les routes d'API n'ont rien a faire dans un index.
        // /login vit sur les sous-domaines des etablissements
        // (esbtp-yakro.klassci.com/login), pas sur ce site vitrine.
        //
        // Le portail d'inscription liste, par construction, quels
        // etablissements sont clients et quand leur guichet est ouvert. La
        // page par etablissement repond 404 pour tout le reste precisement
        // pour que cela reste prive ; indexer la page d'index rendrait la
        // meme liste accessible par une simple requete `site:`.
        //
        // Ce fichier est le verrou exterieur, et les deux protections
        // agissent en serie, pas en parallele : un robot qui respecte un
        // Disallow ne recupere jamais la page, donc ne lit jamais le
        // `noindex` qu'elle contient. Le `robots: { index: false }` pose par
        // buildUniverseMetadata couvre ce qui est malgre tout recupere — un
        // lien partage, un robot qui ignore ce fichier — pas ce qui est
        // liste ici.
        disallow: [
          "/api/",
          "/login",
          "/inscription",
          "/*/inscription",
          "/reinscription",
          "/*/reinscription",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // La directive `Host` n'est comprise que par Yandex et n'a jamais rien
    // apporte ici ; elle a en revanche affiche pendant des mois une adresse
    // coupee en deux par un saut de ligne dans la variable d'environnement.
    // Le canonique se declare par les balises `link rel=canonical`, pas la.
  };
}
