import { NextRequest } from "next/server";

import { relayer } from "@/lib/portail/relais";
import { preparerVerification } from "@/lib/portail/verification-relais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * La vérification d'une demande (code à six chiffres, lien reçu, renvoi).
 *
 * Même relais signé que la candidature : le secret de l'école ne quitte jamais
 * le serveur, et l'adresse du visiteur borne le débit côté KLASSCI. Le choix du
 * chemin amont selon le canal est fait par `preparerVerification`, seul.
 */
export async function POST(
  requete: NextRequest,
  { params }: { params: { ecole: string; action: string } },
) {
  const recu = await requete.json().catch(() => null);
  const appel = preparerVerification(params.action, recu);

  if ("erreur" in appel) {
    return Response.json(
      { erreur: appel.erreur },
      { status: appel.erreur === "action_inconnue" ? 404 : 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return relayer(params.ecole, appel.chemin, appel.corps, requete);
}
