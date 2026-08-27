import "server-only";

import { NextResponse } from "next/server";

import { preparerAppel } from "./signature";
import { etablissementAvecSecret } from "./tenants";

/**
 * Le relais entre le navigateur du visiteur et l'instance KLASSCI de son école.
 *
 * Il existe pour une seule raison : le secret partagé ne doit jamais atteindre
 * le navigateur. Le visiteur parle à klassci.com, klassci.com signe et parle à
 * l'école. Personne d'autre ne peut appeler l'export.
 *
 * Deux disciplines s'ajoutent, et ce sont elles qui font tout le travail :
 *
 * 1. On ne relaie que ce que KLASSCI attend. Le corps envoyé est reconstruit
 *    champ par champ à partir de ce que le visiteur a saisi — jamais son objet
 *    tel quel. Sans cela, un champ ajouté par l'appelant traverserait le relais
 *    et entrerait dans la charge signée, avec notre secret pour l'authentifier.
 * 2. L'adresse transmise est celle que Vercel a constatée, pas celle que
 *    l'appelant déclare. C'est cette adresse qui borne la limitation de débit
 *    côté KLASSCI ; la laisser au choix de l'appelant reviendrait à supprimer
 *    la limitation tout en la croyant en place.
 */

const CHEMIN_LOOKUP = "api/public/reinscription/lookup";
const CHEMIN_SUBMIT = "api/public/reinscription/submit";

/** Au-delà, l'instance est considérée injoignable. */
const DELAI_MAX_MS = 12_000;

export type ChampsVisiteur = {
  matricule: string;
  dateNaissance: string;
  consentement?: boolean;
};

type Point = "lookup" | "submit";

/**
 * Réponse rendue quand le relais lui-même échoue.
 *
 * Volontairement distincte de « aucun dossier ne correspond » : dire
 * « introuvable » alors que l'école est injoignable enverrait la famille
 * vérifier un matricule qui est correct.
 */
function indisponible(): NextResponse {
  return NextResponse.json(
    { erreur: "indisponible" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * L'adresse du visiteur, telle que la plateforme l'a constatée.
 *
 * `x-forwarded-for` peut porter une chaîne de mandataires ; le premier élément
 * est le client d'origine. On ne fait confiance à cet en-tête que parce que
 * Vercel le réécrit à l'entrée — il n'est pas modifiable par l'appelant.
 */
function adresseVisiteur(entetes: Headers): string | null {
  const brute =
    entetes.get("x-real-ip") ?? entetes.get("x-forwarded-for")?.split(",")[0] ?? "";

  const adresse = brute.trim();

  // KLASSCI valide `ip_client` en `ip` : une valeur vide ou fantaisiste ferait
  // échouer la requête en 422, après signature, sans que le visiteur comprenne.
  return adresse === "" ? null : adresse;
}

function corpsPourKlassci(champs: ChampsVisiteur, adresse: string, point: Point) {
  const commun = {
    matricule: champs.matricule.trim(),
    date_naissance: champs.dateNaissance.trim(),
    ip_client: adresse,
  };

  return point === "submit" ? { ...commun, consentement: true } : commun;
}

/**
 * Relaie un appel vers l'instance de l'école, signé.
 *
 * Rend telle quelle la réponse de KLASSCI — corps et code de statut — parce que
 * c'est KLASSCI qui décide de ce que le visiteur a le droit de savoir. Le
 * relais n'interprète ni n'enrichit : réécrire ici « aucun dossier » en un
 * message plus précis reviendrait à défaire, depuis le site vitrine, la
 * discipline de réponse uniforme qui protège de l'énumération.
 */
export async function relayer(
  code: string,
  point: Point,
  champs: ChampsVisiteur,
  entetes: Headers,
): Promise<NextResponse> {
  const etablissement = etablissementAvecSecret(code);

  if (etablissement === null) {
    return NextResponse.json(
      { erreur: "etablissement_inconnu" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (point === "submit" && champs.consentement !== true) {
    return NextResponse.json(
      { erreur: "consentement_requis" },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }

  const adresse = adresseVisiteur(entetes);

  if (adresse === null) {
    console.error("[reinscription] Adresse du visiteur introuvable dans les en-tetes");

    return indisponible();
  }

  const chemin = point === "lookup" ? CHEMIN_LOOKUP : CHEMIN_SUBMIT;
  const appel = preparerAppel(
    corpsPourKlassci(champs, adresse, point),
    "POST",
    chemin,
    etablissement.secret,
  );

  try {
    const reponse = await fetch(`${etablissement.base}/${chemin}`, {
      method: "POST",
      headers: appel.entetes,
      // Le corps envoyé est EXACTEMENT celui qui a été signé. Re-sérialiser ici
      // produirait peut-être les mêmes octets, mais rien ne le garantirait.
      body: appel.corps,
      cache: "no-store",
      signal: AbortSignal.timeout(DELAI_MAX_MS),
    });

    const texte = await reponse.text();

    return new NextResponse(texte, {
      status: reponse.status,
      headers: {
        "Content-Type": reponse.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (erreur) {
    // On journalise le code de l'établissement, jamais le matricule ni la date
    // de naissance : ce sont les deux moitiés d'un identifiant.
    console.error(`[reinscription] Instance ${etablissement.code} injoignable`, erreur);

    return indisponible();
  }
}
