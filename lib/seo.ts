import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klassci.com";

type UniverseKey = "home" | "universite" | "college" | "lms";

interface SeoInput {
  locale: Locale;
  key: UniverseKey;
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function buildUniverseMetadata({
  locale,
  key,
  title,
  description,
  path,
  image = "/img/og/default.png",
}: SeoInput): Metadata {
  const normalizedPath = path === "/" ? "" : path;
  const localizedPath = `/${locale}${normalizedPath}`;
  const url = new URL(localizedPath, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();
  const frenchPath = `/fr${normalizedPath}`;
  const englishPath = `/en${normalizedPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: {
        fr: frenchPath,
        en: englishPath,
      },
    },
    openGraph: {
      type: "website",
      siteName: "KLASSCI",
      title,
      description,
      url,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    other: {
      "og:whatsapp:title": title,
      "og:whatsapp:description": description,
      "klassci:universe": key,
    },
  };
}
