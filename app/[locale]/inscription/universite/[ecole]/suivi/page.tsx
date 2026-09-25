import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PortailHabillage } from "@/components/portail/portail-habillage";
import { SuiviDossierPage } from "@/components/portail/suivi-dossier-page";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { etablissementsOuverts } from "@/lib/portail/tenants";
import { identiteEtablissement } from "@/lib/vitrine/etablissements";
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
  const t = await getTranslations({ locale: safeLocale, namespace: "inscription" });
  const etablissement = trouver(ecole);

  return buildUniverseMetadata({
    locale: safeLocale,
    noindex: true,
    title: etablissement ? `${t("suivi.titre")} — ${etablissement.libelle}` : t("suivi.titre"),
    description: t("suivi.aide"),
    path: `/inscription/universite/${ecole}/suivi`,
  });
}

export default async function SuiviDossierRoute({
  params,
}: {
  params: Promise<{ locale: string; ecole: string }>;
}) {
  const { locale, ecole } = await params;
  setRequestLocale(locale);

  const etablissement = trouver(ecole);
  if (!etablissement) {
    notFound();
  }

  const identite = await identiteEtablissement(etablissement.code);
  const t = await getTranslations({ locale, namespace: "inscription.suivi" });
  const tRdv = await getTranslations({ locale, namespace: "inscription.rdv" });

  return (
    <PortailHabillage
      locale={locale}
      etablissement={etablissement}
      identite={identite}
      eyebrow={tRdv("eyebrow")}
      titre={t("titre")}
      sousTitre={t("aide")}
      pied={
        <p className="mt-4 text-center">
          <Link
            href={`/inscription/universite/${etablissement.code}`}
            className="inline-flex min-h-[40px] items-center px-3 text-sm text-text-muted underline-offset-4 transition-colors duration-200 hover:text-text hover:underline"
          >
            {tRdv("retour")}
          </Link>
        </p>
      }
    >
      <SuiviDossierPage etablissement={etablissement} />
    </PortailHabillage>
  );
}
