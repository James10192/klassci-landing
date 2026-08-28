import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * L'ancien chemin d'une école, conservé en redirection.
 *
 * C'est celui-ci qui compte le plus, davantage que /reinscription tout court :
 * quand le site ne sert qu'une école, /reinscription redirige déjà vers
 * /reinscription/{ecole}. L'adresse que les familles ont dans leur historique,
 * dans un SMS ou sur une affiche est donc celle qui porte le code école — et
 * c'est exactement celle que le rangement de ce dossier aurait cassée.
 */
export default async function AncienCheminEcole({
  params,
}: {
  params: Promise<{ locale: string; ecole: string }>;
}) {
  const { locale, ecole } = await params;

  redirect(`/${locale}/inscription/universite/${ecole}`);
}
