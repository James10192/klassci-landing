import type { MetadataRoute } from "next";

import { source } from "@/lib/source";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://klassci.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localePath = (locale: string) =>
    locale === routing.defaultLocale ? "" : `/${locale}`;

  const homepages: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  }));

  const docs: MetadataRoute.Sitemap = source.getPages().flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale)}${page.url}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [...homepages, ...docs];
}
