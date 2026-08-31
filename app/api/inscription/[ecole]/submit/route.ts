import { NextRequest } from "next/server";

import { CHEMINS, relayer } from "@/lib/portail/relais";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Les champs qu'une candidature transporte, et eux seuls. */
const TEXTES = [
  "nom", "prenoms", "date_naissance", "lieu_naissance", "sexe", "nationalite",
  "telephone", "email", "ville", "commune",
  "voeu_libre", "serie_bac", "etablissement_origine", "affectation_status", "message",
  "tuteur_nom", "tuteur_telephone", "tuteur_lien", "tuteur_profession",
  "etablissement_sup_origine", "formation_origine", "niveau_atteint_origine", "motif_transfert",
] as const;

const ENTIERS = ["filiere_id", "niveau_id", "annee_bac", "annee_derniere_inscription"] as const;

/**
 * Les drapeaux, transportés tels quels.
 *
 * `est_transfert` ne peut passer ni par TEXTES — qui n'accepte que des chaînes
 * non vides, et « false » n'en est pas une — ni par ENTIERS, qui exige un
 * entier strictement positif : les deux jettent silencieusement la valeur
 * `false`. Or c'est justement celle qui doit voyager, puisque KLASSCI efface
 * le bloc de transfert quand le drapeau est baissé. Sans elle, un candidat
 * qui coche puis se ravise verrait sa déclaration partir quand même.
 */
const BOOLEENS = ["est_transfert"] as const;

export async function POST(
  requete: NextRequest,
  { params }: { params: { ecole: string } },
) {
  const recu = await requete.json().catch(() => null);

  if (recu === null || typeof recu !== "object") {
    return Response.json({ erreur: "corps_invalide" }, { status: 400 });
  }

  const source = recu as Record<string, unknown>;

  // Obligation de la loi ivoirienne 2013-450 sur les donnees personnelles.
  if (source.consentement !== true) {
    return Response.json({ erreur: "consentement_requis" }, { status: 422 });
  }

  // Corps reconstruit champ par champ. Reprendre l'objet recu ferait entrer
  // n'importe quel champ ajoute par l'appelant dans la charge signee, avec
  // notre secret pour l'authentifier.
  const corps: Record<string, unknown> = { consentement: true };

  for (const champ of TEXTES) {
    const valeur = source[champ];

    if (typeof valeur === "string" && valeur.trim() !== "") {
      corps[champ] = valeur.trim();
    }
  }

  for (const champ of BOOLEENS) {
    if (typeof source[champ] === "boolean") {
      corps[champ] = source[champ];
    }
  }

  for (const champ of ENTIERS) {
    const valeur = source[champ];
    const entier = typeof valeur === "number" ? valeur : Number.parseInt(String(valeur ?? ""), 10);

    if (Number.isInteger(entier) && entier > 0) {
      corps[champ] = entier;
    }
  }

  // La validation de fond appartient a KLASSCI, qui connait ses filieres et
  // ses regles. On ne verifie ici que la presence du minimum, pour eviter un
  // aller-retour signe sur un formulaire manifestement vide.
  if (typeof corps.nom !== "string" || typeof corps.telephone !== "string") {
    return Response.json({ erreur: "champs_manquants" }, { status: 422 });
  }

  return relayer(params.ecole, CHEMINS.inscriptionSubmit, corps, requete);
}
