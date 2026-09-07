import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RendezVousFlow } from "@/components/portail/rendez-vous-flow";
import { routing, type Locale } from "@/i18n/routing";
import { etablissementsOuverts } from "@/lib/portail/tenants";
import { buildUniverseMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

function trouver(code: string) {
  return etablissementsOuverts().find((etablissement) => etablissement.code === code.toLowerCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; ecole: string }>;
}): Promise<Metadata> {
  const { locale, ecole } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "inscription.rdv" });
  const etablissement = trouver(ecole);

  return buildUniverseMetadata({
    locale: safeLocale,
    noindex: true,
    title: etablissement ? `${t("titre")} — ${etablissement.libelle}` : t("titre"),
    description: t("aide"),
    path: `/inscription/universite/${ecole}/rendez-vous`,
  });
}

export default async function RendezVousPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; ecole: string }>;
  searchParams: { ref?: string };
}) {
  const { locale, ecole } = await params;
  const ref = searchParams.ref;
  setRequestLocale(locale);

  const etablissement = trouver(ecole);
  if (!etablissement) {
    notFound();
  }

  return <RendezVousFlow etablissement={etablissement} referenceInitiale={ref} />;
}
