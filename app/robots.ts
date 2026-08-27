import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://klassci.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Internal API routes don't need to be indexed.
        // /login lives on tenant subdomains (esbtp-yakro.klassci.com/login etc.),
        // not on this marketing site — block it so Search Console stops flagging it.
        // /reinscription lists, by design, exactly which schools are customers
        // and when their enrolment window is open. The per-school page answers
        // 404 for anything else precisely so that stays private; indexing the
        // index page would hand the same list to anyone via a site: query.
        disallow: ["/api/", "/login", "/reinscription", "/*/reinscription"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
