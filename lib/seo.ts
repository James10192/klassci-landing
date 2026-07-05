import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klassci.com";

type UniverseKey = "home" | "universite" | "college" | "lms";

const UNIVERSE_IMAGES: Record<UniverseKey, string> = {
  home: "/img/og/home.png",
  universite: "/img/og/universite.png",
  college: "/img/og/college.png",
  lms: "/img/og/default.png",
};

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
  image = UNIVERSE_IMAGES[key],
}: SeoInput): Metadata {
  const normalizedPath = path === "/" ? "" : path;
  const localizedPath = `/${locale}${normalizedPath}`;
  const url = new URL(localizedPath, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();
  const frenchPath = `/fr${normalizedPath}`;
  const englishPath = `/en${normalizedPath}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: {
        fr: frenchPath,
        en: englishPath,
        "x-default": frenchPath,
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
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "og:whatsapp:title": title,
      "og:whatsapp:description": description,
      "og:image:secure_url": imageUrl,
      "og:image:type": "image/png",
      "twitter:image:alt": title,
      "klassci:universe": key,
    },
  };
}
