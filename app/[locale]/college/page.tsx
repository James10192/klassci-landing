import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CollegeLanding } from "@/components/college/college-landing";
import { JsonLd } from "@/components/seo/json-ld";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";
import { buildEditionGraph } from "@/lib/schema/pages";

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

  const safeLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  // Aucune FAQ n'est passee ici : cette page n'en affiche pas.
  const graphe = await buildEditionGraph("college", safeLocale);

  return (
    <>
      <JsonLd graph={graphe} />
      <CollegeLanding />
    </>
  );
}
