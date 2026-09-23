import createNextIntlPlugin from "next-intl/plugin";
import { createMDX } from "fumadocs-mdx/next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,

  images: {
    // AVIF est conserve malgre son cout : il pese 20 a 30 % de moins que WebP,
    // et le visiteur vise ici est sur un telephone d'entree de gamme en 4G
    // instable. Ce que coute le format se compte en transformations, ce que
    // gagne l'octet se compte chez le visiteur — et depuis que les adresses de
    // logos portent leur empreinte, la transformation ne se paie plus qu'une
    // fois par version.
    formats: ["image/webp", "image/avif"],

    // Trente et un jours, la duree recommandee par Vercel pour des images qui
    // ne changent pas tous les mois.
    //
    // Cette valeur etait a 60 secondes, mais ce n'est pas elle qui faisait le
    // degat : Next retient la PLUS GRANDE valeur entre celle-ci et l'en-tete
    // `Cache-Control` de l'image amont. Les instances KLASSCI annoncent
    // `max-age=3600` sur leur logo, donc chaque variante expirait toutes les
    // heures et etait refacturee vingt-quatre fois par jour. Le quota mensuel
    // de cinq mille transformations partait en quelques jours.
    //
    // Une duree longue n'est tenable que parce que le cache d'images de Vercel
    // ne sait PAS s'invalider : l'adresse d'un logo porte desormais l'empreinte
    // de son contenu (`?v=`, voir `lib/vitrine/etablissements.ts`). Elle change
    // quand le logo change, jamais autrement. Sans ce suffixe, ce reglage
    // servirait des logos peries pendant un mois.
    minimumCacheTTL: 2_678_400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "klassci.com" },
      { protocol: "https", hostname: "www.klassci.com" },
      // Les logos des etablissements sont servis par leur propre instance
      // (`esbtp-yakro.klassci.com/api/public/etablissement/logo`). Les faire
      // passer par l'optimiseur d'images plutot que de pointer le navigateur
      // du visiteur directement dessus : l'ecole n'est appelee qu'une fois par
      // revalidation au lieu d'une fois par visiteur, et l'adresse des
      // familles ne touche jamais l'instance de l'ecole.
      { protocol: "https", hostname: "*.klassci.com" },
    ],
  },

  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "next-intl"],
    // Les cartes de partage lisent leurs polices et le logo sur le disque
    // (lib/og/carte.tsx). La plupart sont construites au déploiement, mais
    // celles des écoles sont dessinées à la demande : sans cette ligne, la
    // fonction serverless ne contiendrait ni `assets/og` ni `public/`, et
    // chaque carte d'école échouerait en production seulement.
    outputFileTracingIncludes: {
      "/**/opengraph-image*": ["./assets/og/**", "./public/img/logo-klassci-full.png"],
    },
  },

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/img/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Les reponses d'API n'ont rien a faire dans un index. Le `Disallow`
        // du robots.txt empeche de les explorer ; cet en-tete couvre ce qui
        // serait malgre tout recupere — un lien partage, un robot qui ignore
        // le fichier.
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Le portail d'inscription ne doit pas entrer dans l'index : il dit quels
      // etablissements sont clients. Les pages portent deja un `noindex` en
      // balise ; l'en-tete le repete pour les reponses sans HTML — les
      // redirections de /reinscription notamment. Ni l'un ni l'autre ne
      // fonctionne si robots.txt interdit l'exploration : voir app/robots.ts.
      ...["inscription", "reinscription"].flatMap((racine) =>
        [`/:locale/${racine}`, `/:locale/${racine}/:path*`, `/${racine}`, `/${racine}/:path*`].map(
          (source) => ({
            source,
            headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
          }),
        ),
      ),
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },


  async redirects() {
    // Les anciennes adresses de la version Laravel du site, conservees pour
    // les liens entrants.
    //
    // Elles visaient `/docs/...`, sans prefixe de langue — ce qui enchainait
    // deux sauts : un 308 vers `/docs/api-reference`, puis un 307 du
    // middleware vers `/fr/docs/api-reference`. Une chaine de redirections
    // dilue le signal du lien entrant et coute un aller-retour au visiteur.
    // Ces adresses heritees etaient francaises : on vise donc directement la
    // page francaise.
    return [
      {
        source: "/api-reference",
        destination: "/fr/docs/api-reference",
        permanent: true,
      },
      { source: "/changelog", destination: "/fr/docs/changelog", permanent: true },
    ];
  },
};

const configuredNext = withNextIntl(withMDX(nextConfig));

// fumadocs-mdx exposes this Next 15+ option, while this project still runs Next 14.
delete configuredNext.turbopack;

export default configuredNext;
