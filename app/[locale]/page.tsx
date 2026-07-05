import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StructuredData } from "@/components/seo/structured-data";
import { UniverseHub } from "@/components/universe/universe-hub";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "welcome" });

  return buildUniverseMetadata({
    locale: safeLocale,
    key: "home",
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/",
    image: "/img/og/home.png",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "welcome" });

  return (
    <>
      <StructuredData description={t("metaDescription")} />
      <UniverseHub />
    </>
  );
}
