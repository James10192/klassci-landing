import { CHEMINS, type CheminPublic } from "./chemins.ts";

/**
 * Ce que le relais transmet à KLASSCI pour vérifier une demande.
 *
 * L'ADAPTATEUR UNIQUE entre le site et les routes de vérification de l'école.
 * Hypothèse retenue tant que KLASSCIv2 n'a pas figé ses routes WhatsApp : le
 * téléphone passe par les MÊMES routes que l'e-mail, avec un champ `canal`
 * (`email` ou `telephone`). Si l'école sépare ses routes, c'est `CHEMIN_PAR_CANAL`
 * qui change, et rien d'autre.
 *
 * Module pur (pas de `server-only`, pas de réseau) pour être vérifié par Node.
 * Le corps est reconstruit champ par champ, comme tout ce que le relais signe :
 * un champ ajouté par l'appelant n'entre jamais dans la charge signée.
 */

export type Canal = "email" | "telephone";
type Action = "verifier" | "renvoyer";

const CHEMIN_PAR_CANAL: Record<Canal, Record<Action, CheminPublic>> = {
  email: { verifier: CHEMINS.verificationVerifier, renvoyer: CHEMINS.verificationRenvoyer },
  telephone: { verifier: CHEMINS.verificationVerifier, renvoyer: CHEMINS.verificationRenvoyer },
};

export type AppelVerification =
  | { chemin: CheminPublic; corps: Record<string, string> }
  | { erreur: "corps_invalide" | "action_inconnue" };

const JETON = /^[A-Za-z0-9._~-]{16,512}$/;
const DEMANDE = /^[A-Za-z0-9-]{1,64}$/;
const CODE = /^\d{6}$/;

function texte(valeur: unknown): string | null {
  return typeof valeur === "string" ? valeur.trim() : null;
}

/** Absent vaut `email` ; toute autre valeur hors des deux canaux est refusée, sans repli. */
function lireCanal(valeur: unknown): Canal | null {
  if (valeur === undefined) return "email";

  return valeur === "email" || valeur === "telephone" ? valeur : null;
}

function estAction(action: string): action is Action {
  return action === "verifier" || action === "renvoyer";
}

export function preparerVerification(action: string, recu: unknown): AppelVerification {
  if (!estAction(action)) return { erreur: "action_inconnue" };
  if (recu === null || typeof recu !== "object") return { erreur: "corps_invalide" };

  const source: Record<string, unknown> = { ...recu };
  const canal = lireCanal(source.canal);
  const demandeId = texte(source.demande_id);

  if (canal === null) return { erreur: "corps_invalide" };

  const chemin = CHEMIN_PAR_CANAL[canal][action];

  if (action === "renvoyer") {
    if (demandeId === null || !DEMANDE.test(demandeId)) return { erreur: "corps_invalide" };

    return { chemin, corps: { demande_id: demandeId, canal } };
  }

  const jeton = texte(source.jeton);

  if (jeton !== null && jeton !== "") {
    return JETON.test(jeton) ? { chemin, corps: { jeton, canal } } : { erreur: "corps_invalide" };
  }

  const code = texte(source.code);

  if (demandeId === null || !DEMANDE.test(demandeId) || code === null || !CODE.test(code)) {
    return { erreur: "corps_invalide" };
  }

  return { chemin, corps: { demande_id: demandeId, code, canal } };
}
