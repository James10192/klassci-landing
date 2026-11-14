import { NextRequest } from "next/server";

import { CHEMINS } from "@/lib/portail/chemins";
import { relayer } from "@/lib/portail/relais";
import { compacter } from "@/lib/portail/matricule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  requete: NextRequest,
  { params }: { params: Promise<{ ecole: string }> },
) {
  const routeParams = await params;
  const corps = await requete.json().catch(() => null);

  if (corps === null || typeof corps !== "object") {
    return Response.json({ erreur: "corps_invalide" }, { status: 400 });
  }

  const { matricule, dateNaissance, consentement, email, canal } = corps as Record<string, unknown>;

  if (typeof matricule !== "string" || typeof dateNaissance !== "string") {
    return Response.json({ erreur: "champs_manquants" }, { status: 422 });
  }

  // Obligation de la loi ivoirienne 2013-450 : le consentement se verifie ici,
  // ou le 422 a du sens pour l'appelant.
  if (consentement !== true) {
    return Response.json({ erreur: "consentement_requis" }, { status: 422 });
  }

  const relaye: Record<string, unknown> = {
    matricule: compacter(matricule),
    date_naissance: dateNaissance.trim(),
    consentement: true,
  };

  // Facultatifs : l'adresse que la famille lit vraiment, et le canal du code.
  // L'école valide l'adresse ; ici on écarte seulement ce qui n'en est pas une.
  if (typeof email === "string" && email.trim() !== "" && email.trim().length <= 254) {
    relaye.email = email.trim();
  }
  if (canal === "email" || canal === "telephone") {
    relaye.canal = canal;
  }

  return relayer(routeParams.ecole, CHEMINS.reinscriptionSubmit, relaye, requete);
}
