import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/seo/json-ld";
import { UniverseHub } from "@/components/universe/universe-hub";
import { LogosEtablissements } from "@/components/vitrine/logos-etablissements";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";
import { buildHomeGraph } from "@/lib/schema/pages";
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

  const safeLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;

  // Les ecoles sont interrogees ici, pas dans le hub : le hub est un composant
  // client, et ce chargement doit rester sur le serveur — c'est lui qui detient
  // les adresses des instances.
  const etablissements = await etablissementsVitrine();

  // Le graphe cite les etablissements que la page affiche reellement : la
  // preuve sociale la plus forte du site n'etait jusqu'ici declaree nulle part.
  const graphe = await buildHomeGraph(
    safeLocale,
    etablissements.map((e) => ({ nom: e.nom, ville: e.ville, logo: e.logo })),
  );

  return (
    <>
      <JsonLd graph={graphe} />
      <UniverseHub
        bandeauEtablissements={
          <LogosEtablissements etablissements={etablissements} locale={locale} />
        }
      />
    </>
  );
}
