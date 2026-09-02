import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

type UniverseKey = "home" | "universite" | "college" | "lms";

const UNIVERSE_IMAGES: Record<UniverseKey, string> = {
  home: "/img/og/home.png",
  universite: "/img/og/universite.png",
  college: "/img/og/college.png",
  lms: "/img/og/default.png",
};

interface SeoInput {
  locale: Locale;
  /**
   * L'edition du produit. Absente pour les pages qui n'en sont pas une : la
   * reinscription est une fonction, pas une edition, et l'inscrire dans cette
   * enumeration fermee fausserait la segmentation d'audience.
   */
  key?: UniverseKey;
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Retire la page des moteurs. Voir l'usage sur le portail de reinscription. */
  noindex?: boolean;
}

export function buildUniverseMetadata({
  locale,
  key,
  title,
  description,
  path,
  image = key ? UNIVERSE_IMAGES[key] : "/img/og/default.png",
  noindex = false,
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
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    other: {
      "og:whatsapp:title": title,
      "og:whatsapp:description": description,
      "og:image:secure_url": imageUrl,
      "og:image:type": "image/png",
      "twitter:image:alt": title,
      ...(key ? { "klassci:universe": key } : {}),
    },
  };
}
