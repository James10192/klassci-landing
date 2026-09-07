import { NextRequest } from "next/server";

import { CHEMINS, relayer, type CheminPublic } from "@/lib/portail/relais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: Record<string, CheminPublic> = {
  creneaux: CHEMINS.rdvCreneaux,
  reserver: CHEMINS.rdvReserver,
  consulter: CHEMINS.rdvConsulter,
  deplacer: CHEMINS.rdvDeplacer,
  annuler: CHEMINS.rdvAnnuler,
  retrouver: CHEMINS.rdvRetrouver,
};

export async function POST(
  requete: NextRequest,
  { params }: { params: { ecole: string; action: string } },
) {
  const chemin = ACTIONS[params.action];

  if (chemin === undefined) {
    return Response.json({ erreur: "inconnu" }, { status: 404 });
  }

  if (params.action === "creneaux") {
    return relayer(params.ecole, chemin, {}, requete);
  }

  const recu = await requete.json().catch(() => null);

  if (recu === null || typeof recu !== "object") {
    return Response.json({ erreur: "corps_invalide" }, { status: 400 });
  }

  const source = recu as Record<string, unknown>;
  const corps: Record<string, unknown> = {};

  if (params.action === "retrouver") {
    if (typeof source.identifiant !== "string" || typeof source.date_naissance !== "string") {
      return Response.json({ erreur: "champs_manquants" }, { status: 422 });
    }

    corps.identifiant = source.identifiant.trim();
    corps.date_naissance = source.date_naissance.trim();

    return relayer(params.ecole, chemin, corps, requete);
  }

  if (typeof source.reference !== "string" || typeof source.date_naissance !== "string") {
    return Response.json({ erreur: "champs_manquants" }, { status: 422 });
  }

  corps.reference = source.reference.trim();
  corps.date_naissance = source.date_naissance.trim();

  if (params.action === "reserver" || params.action === "deplacer") {
    const id = typeof source.creneau_id === "number" ? source.creneau_id : Number.parseInt(String(source.creneau_id ?? ""), 10);

    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ erreur: "champs_manquants" }, { status: 422 });
    }

    corps.creneau_id = id;
  }

  return relayer(params.ecole, chemin, corps, requete);
}
