import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CollegeLanding } from "@/components/college/college-landing";
import { StructuredData } from "@/components/seo/structured-data";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "college.meta" });

  return buildUniverseMetadata({
    locale: safeLocale,
    key: "college",
    title: t("title"),
    description: t("description"),
    path: "/college",
    image: "/img/og/college.png",
  });
}

export default async function CollegePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "college.meta" });

  return (
    <>
      <StructuredData description={t("description")} />
      <CollegeLanding />
    </>
  );
}
