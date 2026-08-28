import { NextRequest } from "next/server";

import { CHEMINS, relayer } from "@/lib/portail/relais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  requete: NextRequest,
  { params }: { params: { ecole: string } },
) {
  const corps = await requete.json().catch(() => null);

  if (corps === null || typeof corps !== "object") {
    return Response.json({ erreur: "corps_invalide" }, { status: 400 });
  }

  const { matricule, dateNaissance } = corps as Record<string, unknown>;

  if (typeof matricule !== "string" || typeof dateNaissance !== "string") {
    return Response.json({ erreur: "champs_manquants" }, { status: 422 });
  }

  // Corps reconstruit champ par champ : un champ ajoute par l'appelant
  // n'atteint jamais l'ecole, et n'entre donc jamais dans la charge signee.
  return relayer(
    params.ecole,
    CHEMINS.reinscriptionLookup,
    { matricule: matricule.trim(), date_naissance: dateNaissance.trim() },
    requete,
  );
}
