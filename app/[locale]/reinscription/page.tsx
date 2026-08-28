import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * L'ancien chemin, conserve en redirection.
 *
 * Le portail ne servait que la reinscription quand il a ete ouvert ; il sert
 * maintenant les deux. Des liens vers /reinscription ont pu etre diffuses — un
 * message a des familles, une affiche — et les casser pour une raison de
 * rangement interne serait leur faire payer notre changement d'avis.
 */
export default async function AncienChemin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect(`/${locale}/inscription/universite`);
}
