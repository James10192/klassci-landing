import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StructuredData } from "@/components/seo/structured-data";
import { UniverseHub } from "@/components/universe/universe-hub";
import { LogosEtablissements } from "@/components/vitrine/logos-etablissements";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";
import { etablissementsVitrine } from "@/lib/vitrine/etablissements";

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

  // Les ecoles sont interrogees ici, pas dans le hub : le hub est un composant
  // client, et ce chargement doit rester sur le serveur — c'est lui qui detient
  // les adresses des instances.
  const etablissements = await etablissementsVitrine();

  return (
    <>
      <StructuredData description={t("metaDescription")} />
      <UniverseHub
        bandeauEtablissements={
          <LogosEtablissements etablissements={etablissements} locale={locale} />
        }
      />
    </>
  );
}
