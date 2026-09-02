import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReinscriptionPage } from "@/components/portail/reinscription-page";
import { routing, type Locale } from "@/i18n/routing";
import { etablissementsOuverts } from "@/lib/portail/tenants";
import { identitesParCode } from "@/lib/vitrine/etablissements";
import { buildUniverseMetadata } from "@/lib/seo";

// La liste des etablissements servis vient des variables d'environnement :
// elle change sans redeploiement, donc la page ne se met pas en cache.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "inscription.meta" });

  return buildUniverseMetadata({
    locale: safeLocale,
    // Retire des moteurs : la liste des ecoles servies, et le calendrier de
    // leurs fenetres de reinscription, n'ont pas a se retrouver dans un index.
    noindex: true,
    title: t("title"),
    description: t("description"),
    path: "/inscription/universite",
  });
}

export default async function PortailUniversite({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const etablissements = etablissementsOuverts();

  // Une seule ecole servie : lui demander de la choisir dans une liste d'un
  // element serait une etape pour rien.
  if (etablissements.length === 1) {
    redirect(`/${locale}/inscription/universite/${etablissements[0].code}`);
  }

  // Les logos viennent des ecoles elles-memes. Une instance injoignable laisse
  // simplement sa ligne sans logo : le choix reste possible, ce qui est la
  // seule chose qui compte ici.
  const identites = await identitesParCode(etablissements.map((ecole) => ecole.code));

  return (
    <ReinscriptionPage locale={locale} etablissements={etablissements} identites={identites} />
  );
}
