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
  /**
   * Les langues dans lesquelles cette page existe reellement.
   *
   * Par defaut, les deux : la vitrine et la documentation sont traduites. Le
   * blog, lui, est publie en francais seulement. Declarer une version anglaise
   * qui n'existe pas romprait la reciprocite qu'exige hreflang — et une grappe
   * dont un maillon ne repond pas est ecartee en entier.
   */
  languesDisponibles?: readonly Locale[];
  /**
   * Un flux a annoncer dans l'en-tete, en chemin relatif.
   *
   * C'est par cette balise qu'un navigateur, un agregateur ou un robot
   * decouvrent le flux du blog sans avoir a en deviner l'adresse.
   */
  flux?: string;
}

export function buildUniverseMetadata({
  locale,
  key,
  title,
  description,
  path,
  image = key ? UNIVERSE_IMAGES[key] : "/img/og/default.png",
  noindex = false,
  languesDisponibles = routing.locales,
  flux,
}: SeoInput): Metadata {
  const normalizedPath = path === "/" ? "" : path;
  const localizedPath = `/${locale}${normalizedPath}`;
  const url = new URL(localizedPath, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();
  const langues: Record<string, string> = {};
  for (const langue of languesDisponibles) {
    langues[langue] = `/${langue}${normalizedPath}`;
  }
  // x-default vise le francais : c'est la langue du marche principal, et
  // c'est la seule version disponible quand une page n'est pas traduite.
  langues["x-default"] = langues.fr ?? `/${languesDisponibles[0]}${normalizedPath}`;

  return {
    metadataBase: new URL(SITE_URL),
    // Le gabarit du layout ajoute « · KLASSCI ». Une page qui porte deja la
    // marque dans son titre produirait « À propos de KLASSCI · KLASSCI » : dix
    // caracteres perdus sur les soixante que Google affiche, au profit d'une
    // repetition. On coupe alors le gabarit — `absolute` est la forme prevue
    // par Next pour cela.
    title: /\bKLASSCI\b/i.test(title) ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: langues,
      ...(flux ? { types: { "application/rss+xml": flux } } : {}),
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
