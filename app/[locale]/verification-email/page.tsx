import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PortailHabillage } from "@/components/portail/portail-habillage";
import { ReinscriptionChrome } from "@/components/portail/reinscription-chrome";
import { VerificationLien } from "@/components/portail/verification-lien";
import { Footer } from "@/components/sections/footer";
import { routing, type Locale } from "@/i18n/routing";
import { etablissementsOuverts } from "@/lib/portail/tenants";
import { buildUniverseMetadata } from "@/lib/seo";
import { identiteEtablissement } from "@/lib/vitrine/etablissements";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "verification.page" });

  return {
    ...buildUniverseMetadata({
      locale: safeLocale,
      noindex: true,
      title: t("titre"),
      description: t("description"),
      path: "/verification-email",
    }),
    // Défense en profondeur : même un ancien lien en `?jeton=` ne part jamais
    // dans l'en-tête Referer d'une ressource tierce.
    referrer: "no-referrer",
  };
}

/**
 * La page du lien envoyé par e-mail : `/verification-email?ecole=<code>#jeton=<jeton>`.
 *
 * Le jeton est dans le FRAGMENT : le serveur ne le reçoit jamais, c'est le
 * navigateur qui le lit puis l'efface (`VerificationLien`). `ecole` désigne
 * l'instance à qui le relayer, parce que klassci.com sert plusieurs écoles.
 * Sans elle, ou pour une école inconnue, la page affiche « lien incomplet »
 * plutôt qu'un 404 : la personne a cliqué un lien reçu, elle doit savoir quoi
 * faire ensuite. Cette page n'est pas mesurée (voir `confidentialite.ts`).
 */
export default async function VerificationEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: { ecole?: string | string[] };
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const code = typeof searchParams.ecole === "string" ? searchParams.ecole.trim().toLowerCase() : "";
  const etablissement = etablissementsOuverts().find((e) => e.code === code) ?? null;
  const contenu = <VerificationLien ecole={etablissement?.code ?? null} />;

  if (etablissement === null) {
    return (
      <>
        <ReinscriptionChrome />
        <main className="min-h-screen bg-bg pt-[57px] text-text">
          <div className="container py-14 sm:py-20">
            <div className="mx-auto max-w-xl">{contenu}</div>
          </div>
          <Footer />
        </main>
      </>
    );
  }

  const identite = await identiteEtablissement(etablissement.code);

  return (
    <PortailHabillage locale={locale} etablissement={etablissement} identite={identite} dense>
      {contenu}
    </PortailHabillage>
  );
}
