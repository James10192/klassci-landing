import { NextRequest } from "next/server";

import { etablissementAvecSecret } from "@/lib/portail/tenants";

export const runtime = "nodejs";

/**
 * Le logo d'un établissement, servi depuis klassci.com.
 *
 * Les logos venaient de l'instance de chaque école, par l'optimiseur d'images.
 * Depuis que klassci.com a quitté Vercel pour son propre serveur, plus aucun
 * ne s'affichait, alors que le relais de l'inscription — même serveur, mêmes
 * instances — passait toujours. Plutôt que de dépendre de ce que l'optimiseur
 * sait atteindre et mettre en cache, le serveur va chercher le logo par le même
 * chemin que le relais, une fois, et le sert lui-même.
 *
 * - Seule l'adresse de logo de l'instance est appelée, jamais une URL reçue.
 * - Seuls les formats matriciels passent : un SVG servi depuis klassci.com
 *   pourrait porter du script sur notre propre origine.
 * - L'URL porte l'empreinte du logo (`?v=`, `lib/vitrine/etablissements.ts`) :
 *   elle change quand le logo change, on peut donc la garder un an.
 * - Une copie reste en mémoire, par école et par version : un serveur qui
 *   tourne en continu ne rappelle pas l'école à chaque visiteur.
 */

const TYPES_ACCEPTES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);
const TAILLE_MAX = 1_000_000;
const DELAI_MAX_MS = 8_000;
const MEMOIRE_MAX = 64;

type Copie = { type: string; octets: ArrayBuffer };

const memoire = new Map<string, Copie>();

function retenir(cle: string, copie: Copie) {
  if (memoire.size >= MEMOIRE_MAX) {
    const plusAncienne = memoire.keys().next().value;
    if (plusAncienne !== undefined) memoire.delete(plusAncienne);
  }
  memoire.set(cle, copie);
}

function servir(copie: Copie): Response {
  return new Response(copie.octets, {
    headers: {
      "Content-Type": copie.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function absent(statut: number): Response {
  // Pas de cache : une école momentanément injoignable ne doit pas rester sans
  // logo un an. La tuile affiche ses initiales en attendant.
  return new Response(null, { status: statut, headers: { "Cache-Control": "no-store" } });
}

export async function GET(
  requete: NextRequest,
  { params }: { params: Promise<{ ecole: string }> },
) {
  const { ecole } = await params;
  const etablissement = etablissementAvecSecret(ecole);

  if (etablissement === null) return absent(404);

  const version = (requete.nextUrl.searchParams.get("v") ?? "").slice(0, 40);
  const cle = `${etablissement.code}:${version}`;
  const enMemoire = memoire.get(cle);

  if (enMemoire !== undefined) return servir(enMemoire);

  try {
    const reponse = await fetch(`${etablissement.base}/api/public/etablissement/logo`, {
      headers: { Accept: "image/avif,image/webp,image/png,image/*;q=0.8", "User-Agent": "KLASSCI-Portail/1.0 (+https://www.klassci.com)" },
      signal: AbortSignal.timeout(DELAI_MAX_MS),
      cache: "no-store",
    });

    if (!reponse.ok) {
      console.warn(`[logo] ${etablissement.code} repond ${reponse.status} pour son logo`);
      return absent(502);
    }

    const type = (reponse.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!TYPES_ACCEPTES.has(type)) return absent(415);

    const octets = await reponse.arrayBuffer();
    if (octets.byteLength === 0 || octets.byteLength > TAILLE_MAX) return absent(502);

    const copie = { type, octets };
    retenir(cle, copie);

    return servir(copie);
  } catch (erreur) {
    console.warn(`[logo] ${etablissement.code} injoignable pour son logo`, erreur);
    return absent(504);
  }
}
