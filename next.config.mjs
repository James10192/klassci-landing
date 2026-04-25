import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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

  async rewrites() {
    // The Laravel app at klassci.com today serves a real /docs hierarchy,
    // /api-reference and /changelog pages. After the apex moves to Vercel,
    // those pages must keep working at the same URLs (SEO + indexed content).
    //
    // Strategy: cpanel exposes a new CNAME `app.klassci.com` pointing to the
    // existing Laravel host (91.234.194.113), and Vercel proxies the three
    // doc/changelog/api-reference path trees back to it. The visitor URL
    // stays `klassci.com/docs/...` — only the origin changes.
    //
    // Set LARAVEL_DOCS_HOST in env (default falls back to docs.klassci.com).
    const docsHost =
      process.env.LARAVEL_DOCS_HOST || "https://docs.klassci.com";

    return [
      { source: "/docs", destination: `${docsHost}/docs` },
      { source: "/docs/:path*", destination: `${docsHost}/docs/:path*` },
      { source: "/api-reference", destination: `${docsHost}/api-reference` },
      { source: "/api-reference/:path*", destination: `${docsHost}/api-reference/:path*` },
      { source: "/changelog", destination: `${docsHost}/changelog` },
      { source: "/changelog/:path*", destination: `${docsHost}/changelog/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);
