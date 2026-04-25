import "../globals.css";

import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { RootProvider } from "fumadocs-ui/provider";
import { I18nProvider } from "fumadocs-ui/i18n";

import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { MotionConfigProvider } from "@/components/motion-config-provider";
import { routing } from "@/i18n/routing";

// UI strings shown by Fumadocs (search dialog, TOC label, theme toggle, etc.)
// per locale. English values are the library defaults but we set them
// explicitly for clarity. `chooseLanguage` powers the docs sidebar language
// switcher.
const FUMADOCS_TRANSLATIONS = {
  fr: {
    search: "Rechercher",
    searchNoResult: "Aucun résultat",
    toc: "Sur cette page",
    tocNoHeadings: "Aucune section",
    lastUpdate: "Dernière mise à jour",
    chooseLanguage: "Choisir une langue",
    nextPage: "Suivant",
    previousPage: "Précédent",
    chooseTheme: "Thème",
    editOnGithub: "Modifier sur GitHub",
  },
  en: {
    search: "Search",
    searchNoResult: "No results",
    toc: "On this page",
    tocNoHeadings: "No sections",
    lastUpdate: "Last updated",
    chooseLanguage: "Choose a language",
    nextPage: "Next",
    previousPage: "Previous",
    chooseTheme: "Theme",
    editOnGithub: "Edit on GitHub",
  },
} as const;

const FUMADOCS_LOCALES = [
  { name: "Français", locale: "fr" },
  { name: "English", locale: "en" },
];

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

// Theme management is delegated to Fumadocs RootProvider (next-themes under
// the hood). It handles light / dark / system + no-flash bootstrap, so we
// don't need our own inline script anymore.

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
      <body>
        <NextIntlClientProvider>
          {/* Fumadocs RootProvider wires next-themes with light / dark / system.
              The CSS we ship under `:root` (light) and `html.dark` (dark) just
              works because next-themes toggles the `dark` class on <html>. */}
          <RootProvider
            theme={{
              attribute: "class",
              defaultTheme: "system",
              enableSystem: true,
              enableColorScheme: true,
            }}
          >
            {/* Fumadocs UI v14 doesn't expose an `i18n` prop on RootProvider —
                that landed in v15.2.3. We wrap with the dedicated
                <I18nProvider> so docs UI strings (search, TOC label) and the
                language switcher render in the active locale. */}
            <I18nProvider
              locale={locale}
              locales={FUMADOCS_LOCALES}
              translations={
                FUMADOCS_TRANSLATIONS[
                  locale as keyof typeof FUMADOCS_TRANSLATIONS
                ]
              }
            >
              <PostHogProvider>
                <MotionConfigProvider>{children}</MotionConfigProvider>
              </PostHogProvider>
            </I18nProvider>
          </RootProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
