import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PagePays } from "@/components/pays/page-pays";
import { estPays, LANGUE_PAYS, metadonneesPays, PAYS, pagePays } from "@/lib/pays";

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

// Seuls les pays déclarés dans `lib/pays.ts` existent : tout autre segment
// répond 404 au lieu d'être rendu à la demande.
export const dynamicParams = false;

export function generateStaticParams() {
  return PAYS.map((slug) => ({ locale: LANGUE_PAYS, slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== LANGUE_PAYS || !estPays(slug)) return {};

  return metadonneesPays(slug);
}

export default async function PagePaysRoute({ params }: Params) {
  const { locale, slug } = await params;
  if (locale !== LANGUE_PAYS || !estPays(slug)) notFound();
  setRequestLocale(locale);

  const donnees = pagePays(slug);
  if (!donnees) notFound();

  return <PagePays slug={slug} donnees={donnees} />;
}
