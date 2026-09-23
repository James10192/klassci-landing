/**
 * Ce que le relais transmet à KLASSCI pour vérifier une demande.
 *
 * L'ADAPTATEUR UNIQUE entre le site et les routes de vérification de l'école.
 * Hypothèse retenue tant que KLASSCIv2 n'a pas figé ses routes WhatsApp : le
 * téléphone passe par les MÊMES routes que l'e-mail, `api/portail/email/*`,
 * avec un champ `canal` qui vaut `email` ou `telephone`. Si l'école sépare ses
 * routes (`api/portail/telephone/*`), c'est ici, et nulle part ailleurs, qu'on
 * change le chemin retenu pour `telephone`.
 *
 * Module pur : pas de `server-only`, pas de réseau, pour être vérifié par Node.
 * Le corps est reconstruit champ par champ, comme pour tout ce que le relais
 * signe : un champ ajouté par l'appelant n'entre jamais dans la charge signée.
 */

export type CleChemin = "verificationVerifier" | "verificationRenvoyer";

export type AppelVerification =
  | { cle: CleChemin; corps: Record<string, string> }
  | { erreur: "corps_invalide" | "action_inconnue" };

const JETON = /^[A-Za-z0-9._~-]{16,512}$/;
const DEMANDE = /^[A-Za-z0-9-]{1,64}$/;
const CODE = /^\d{6}$/;

function texte(valeur: unknown): string | null {
  return typeof valeur === "string" ? valeur.trim() : null;
}

export function preparerVerification(action: string, recu: unknown): AppelVerification {
  if (recu === null || typeof recu !== "object") return { erreur: "corps_invalide" };

  const source = recu as Record<string, unknown>;
  const canal = source.canal === "telephone" ? "telephone" : "email";
  const demandeId = texte(source.demande_id);

  if (action === "renvoyer") {
    if (demandeId === null || !DEMANDE.test(demandeId)) return { erreur: "corps_invalide" };

    return { cle: "verificationRenvoyer", corps: { demande_id: demandeId, canal } };
  }

  if (action !== "verifier") return { erreur: "action_inconnue" };

  const jeton = texte(source.jeton);

  if (jeton !== null && jeton !== "") {
    return JETON.test(jeton)
      ? { cle: "verificationVerifier", corps: { jeton, canal } }
      : { erreur: "corps_invalide" };
  }

  const code = texte(source.code);

  if (demandeId === null || !DEMANDE.test(demandeId) || code === null || !CODE.test(code)) {
    return { erreur: "corps_invalide" };
  }

  return { cle: "verificationVerifier", corps: { demande_id: demandeId, code, canal } };
}
