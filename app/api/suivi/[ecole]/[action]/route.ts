import { NextRequest } from "next/server";

import { CHEMINS, type CheminPublic } from "@/lib/portail/chemins";
import { relayer } from "@/lib/portail/relais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: Record<string, CheminPublic> = {
  consulter: CHEMINS.suiviConsulter,
  email: CHEMINS.suiviEmail,
  verifier: CHEMINS.suiviVerifier,
  convocation: CHEMINS.suiviConvocation,
  "reference-oubliee": CHEMINS.suiviReferenceOubliee,
};

function texte(valeur: unknown): string | null {
  return typeof valeur === "string" && valeur.trim() !== "" ? valeur.trim() : null;
}

/** Suivi d'un dossier deja depose. Le corps est reconstruit champ par champ. */
export async function POST(
  requete: NextRequest,
  { params }: { params: { ecole: string; action: string } },
) {
  const chemin = ACTIONS[params.action];

  if (chemin === undefined) {
    return Response.json({ erreur: "inconnu" }, { status: 404 });
  }

  const recu = await requete.json().catch(() => null);

  if (recu === null || typeof recu !== "object") {
    return Response.json({ erreur: "corps_invalide" }, { status: 400 });
  }

  const source = recu as Record<string, unknown>;
  const dateNaissance = texte(source.date_naissance);

  if (params.action === "reference-oubliee") {
    const email = texte(source.email);

    if (email === null || dateNaissance === null) {
      return Response.json({ erreur: "champs_manquants" }, { status: 422 });
    }

    return relayer(params.ecole, chemin, { email: email.toLowerCase(), date_naissance: dateNaissance }, requete);
  }

  const identifiant = texte(source.identifiant);

  if (identifiant === null || dateNaissance === null) {
    return Response.json({ erreur: "champs_manquants" }, { status: 422 });
  }

  const corps: Record<string, unknown> = { identifiant, date_naissance: dateNaissance };

  if (params.action === "email") {
    const email = texte(source.email);

    if (email === null) {
      return Response.json({ erreur: "champs_manquants" }, { status: 422 });
    }

    corps.email = email.toLowerCase();
  }

  return relayer(params.ecole, chemin, corps, requete);
}
