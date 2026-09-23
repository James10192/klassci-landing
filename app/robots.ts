import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Les routes d'API n'ont rien a faire dans un index, et les explorer
        // declencherait des appels relayes vers les etablissements.
        //
        // C'est le seul Disallow, et c'est voulu. Un Disallow n'empeche pas
        // l'indexation : il empeche l'exploration. Google ne recupere plus la
        // page, donc ne lit jamais le `noindex` qu'elle porte — et une adresse
        // liee depuis le menu finit indexee nue, sans titre ni description.
        // C'est exactement ce que la Search Console a signale en septembre
        // 2026 (« Indexee malgre le blocage par le fichier robots.txt ») sur
        // le portail d'inscription, qui etait ici en Disallow.
        //
        // Le portail liste, par construction, quels etablissements sont
        // clients et quand leur guichet est ouvert. Il reste hors de l'index,
        // mais par les bons moyens : la balise `noindex` posee par
        // buildUniverseMetadata, doublee d'un en-tete `X-Robots-Tag` dans
        // next.config.mjs, qui couvre aussi les redirections de
        // /reinscription. Pour que Google les lise, il faut le laisser passer.
        //
        // /login n'existe pas sur ce site vitrine (il vit sur les sous-domaines
        // des etablissements) : l'adresse repond 404, ce qui la sort de
        // l'index sans qu'on ait a la bloquer.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // La directive `Host` n'est comprise que par Yandex et n'a jamais rien
    // apporte ici ; elle a en revanche affiche pendant des mois une adresse
    // coupee en deux par un saut de ligne dans la variable d'environnement.
    // Le canonique se declare par les balises `link rel=canonical`, pas la.
  };
}
