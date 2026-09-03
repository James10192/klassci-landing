import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PageInstitutionnelle } from "@/components/institutionnel/page-institutionnelle";
import { routing, type Locale } from "@/i18n/routing";
import {
  langueSure,
  metadonneesInstitutionnelles,
  pageInstitutionnelle,
} from "@/lib/institutionnel";

const SLUG = "mentions-legales" as const;

interface Params {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  // La page existe dans les deux langues : un visiteur anglophone doit pouvoir
  // lire ce qui l'engage dans sa langue.
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return metadonneesInstitutionnelles(SLUG, langueSure(locale));
}

export default async function PageMentionsLegales({ params }: Params) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const donnees = pageInstitutionnelle(SLUG, locale as Locale);
  if (!donnees) notFound();

  return (
    <PageInstitutionnelle
      locale={locale as Locale}
      slug={SLUG}
      donnees={donnees}
    />
  );
}
