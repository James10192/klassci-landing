import { NextRequest } from "next/server";

import { relayer } from "@/lib/reinscription/relais";

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

  return relayer(
    params.ecole,
    "submit",
    { matricule, dateNaissance, consentement: consentement === true },
    requete.headers,
  );
}
