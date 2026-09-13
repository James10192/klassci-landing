import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReinscriptionPage } from "@/components/portail/reinscription-page";
import { routing, type Locale } from "@/i18n/routing";
import { etablissementServi } from "@/lib/portail/tenants";
import { identiteEtablissement } from "@/lib/vitrine/etablissements";
import { buildUniverseMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * La page d'une école se fonde sur les écoles SERVIES, pas sur celles que le
 * sélecteur propose.
 *
 * Elle lisait la liste du sélecteur, qui écarte l'instance de démonstration —
 * dont le module promet pourtant qu'elle « reste adressable par son URL
 * directe ». Son lien rendait donc 404. Le même piège frapperait chaque école
 * servie mais volontairement non proposée : ne plus offrir quelque chose n'est
 * pas le retirer à qui vient le chercher.
 */
function trouver(code: string) {
  return etablissementServi(code) ?? undefined;
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

  // L'identite est demandee APRES le 404 : une ecole que ce portail ne sert pas
  // ne doit pas etre interrogee, meme sur un point d'entree public.
  const identite = await identiteEtablissement(etablissement.code);

  return (
    <ReinscriptionPage locale={locale} etablissement={etablissement} identite={identite} />
  );
}
