import { NextRequest } from "next/server";

import { CHEMINS, relayer } from "@/lib/portail/relais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Les filieres et niveaux que l'ecole publie.
 *
 * En POST malgre la nature de lecture : la charge signee couvre le corps, et
 * un GET n'en a pas. Signer une URL demanderait un second schema de signature
 * pour un seul point d'entree — l'uniformite vaut mieux que la purete verbale.
 */
export async function POST(
  requete: NextRequest,
  { params }: { params: { ecole: string } },
) {
  return relayer(params.ecole, CHEMINS.inscriptionChoix, {}, requete);
}
