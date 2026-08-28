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
        //
        // The enrolment portal lists, by design, exactly which schools are
        // customers and when their window is open. The per-school page answers
        // 404 for anything else precisely so that stays private; indexing the
        // index page would hand the same list to anyone via a site: query.
        //
        // It moved from /reinscription to /inscription when it started serving
        // new applicants too, and it gained a link in the site-wide nav — so it
        // is now reachable by crawling, which it wasn't before. The old paths
        // stay listed: they are 307 redirects, and a crawler that already knows
        // them should not follow them in.
        //
        // This file is the outer lock, and the two work in sequence, not in
        // parallel: a crawler that honours a Disallow never fetches the page,
        // so it never reads the `noindex` inside it. The `robots: { index:
        // false }` that buildUniverseMetadata puts on every portal page
        // therefore covers what is still fetched — a direct link someone
        // shared, a crawler that ignores this file — not what is listed here.
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
    host: SITE_URL,
  };
}
