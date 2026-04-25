import "../globals.css";

import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { MotionConfigProvider } from "@/components/motion-config-provider";
import { routing } from "@/i18n/routing";

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-plex-serif",
  fallback: ["Georgia", "serif"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-sans",
  fallback: ["system-ui", "sans-serif"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
  fallback: ["ui-monospace", "monospace"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://klassci.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: "%s — KLASSCI",
    },
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: "African Digital Consulting" }],
    creator: "African Digital Consulting",
    publisher: "KLASSCI",
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        fr: "/",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: t("ogSiteName"),
      title: t("title"),
      description: t("description"),
      url: locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: "/img/og/default.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/img/og/default.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/img/logo-klassci.png",
      apple: "/img/logo-klassci.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0453cb" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1d23" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Inline script that applies the persisted theme before hydration so the
// page never flashes the wrong palette. Mirror of welcome.blade.php logic.
const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('klassci-theme');
    var h = document.documentElement;
    if (t === 'dark') { h.classList.add('dark'); h.classList.remove('light'); }
    else { h.classList.add('light'); h.classList.remove('dark'); }
  } catch (e) {}
})();
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${plexSerif.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <PostHogProvider>
            <MotionConfigProvider>{children}</MotionConfigProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
