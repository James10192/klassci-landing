import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReinscriptionPage } from "@/components/portail/reinscription-page";
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
  const t = await getTranslations({ locale: safeLocale, namespace: "inscription.meta" });
  const etablissement = trouver(ecole);

  return buildUniverseMetadata({
    locale: safeLocale,
    // Retire des moteurs : la liste des ecoles servies, et le calendrier de
    // leurs fenetres de reinscription, n'ont pas a se retrouver dans un index.
    noindex: true,
    title: etablissement ? `${t("title")} — ${etablissement.libelle}` : t("title"),
    description: t("description"),
    path: `/inscription/universite/${ecole}`,
  });
}

export default async function PortailEcolePage({
  params,
}: {
  params: Promise<{ locale: string; ecole: string }>;
}) {
  const { locale, ecole } = await params;
  setRequestLocale(locale);

  const etablissement = trouver(ecole);

  // Une ecole qui n'a pas ouvert le canal n'existe pas pour ce portail. Un 404
  // plutot qu'un message : rien ne justifie de confirmer qu'un etablissement
  // est client de KLASSCI a qui devine des codes dans l'URL.
  if (!etablissement) {
    notFound();
  }

  return <ReinscriptionPage locale={locale} etablissement={etablissement} />;
}
