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

  const { matricule, dateNaissance, consentement } = corps as Record<string, unknown>;

  if (typeof matricule !== "string" || typeof dateNaissance !== "string") {
    return Response.json({ erreur: "champs_manquants" }, { status: 422 });
  }

  // Obligation de la loi ivoirienne 2013-450 : le consentement se verifie ici,
  // ou le 422 a du sens pour l'appelant.
  if (consentement !== true) {
    return Response.json({ erreur: "consentement_requis" }, { status: 422 });
  }

  return relayer(
    params.ecole,
    CHEMINS.reinscriptionSubmit,
    { matricule: matricule.trim(), date_naissance: dateNaissance.trim(), consentement: true },
    requete,
  );
}
