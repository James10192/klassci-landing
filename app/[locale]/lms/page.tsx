import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LmsPage } from "@/components/lms/lms-page";
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
  const t = await getTranslations({ locale: safeLocale, namespace: "lms.meta" });

  return buildUniverseMetadata({
    locale: safeLocale,
    key: "lms",
    title: t("title"),
    description: t("description"),
    path: "/lms",
  });
}

export default async function LearningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "lms.meta" });

  return (
    <>
      <StructuredData description={t("description")} />
      <LmsPage />
    </>
  );
}
