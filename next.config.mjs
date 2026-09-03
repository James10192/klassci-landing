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
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
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
