import { estObjet } from "./aboutissement.ts";

/**
 * La vérification du contact d'une demande, quand l'école l'a activée.
 *
 * C'est un réglage de chaque école (`inscriptions.portail.verification_contact`),
 * désactivé par défaut. Activé, la demande est transmise à l'école comme
 * d'habitude, marquée « contact non vérifié », et KLASSCI demande de confirmer
 * le canal : un code à six chiffres envoyé à l'adresse e-mail, ou par WhatsApp
 * pour qui n'en a pas. L'école sait alors qu'une convocation atteindra bien la
 * famille. La détection des fautes de frappe, elle, s'applique toujours.
 *
 * Module sans React : le parcours, la page `/verification-email` et leurs
 * tests en lisent les mêmes fonctions.
 */

export type Canal = "email" | "telephone";

export type DemandeVerification = {
  canal: Canal;
  demandeId: string;
  /** Adresse ou numéro masqués par l'école (`k***@gmail.com`), jamais en clair. */
  destination: string;
};

export type MotifRefus = "code_invalide" | "expire" | "trop_de_tentatives";

const MOTIFS: readonly string[] = ["code_invalide", "expire", "trop_de_tentatives"] satisfies MotifRefus[];

export function estMotif(valeur: unknown): valeur is MotifRefus {
  return typeof valeur === "string" && MOTIFS.includes(valeur);
}

/**
 * La réponse de création demande-t-elle une vérification ?
 *
 * `null` si le corps ne porte pas l'un des deux statuts attendus, ou s'il est
 * incomplet : mieux vaut alors retomber sur l'écran de confirmation habituel
 * que présenter un champ de code sans rien derrière.
 */
export function lireDemandeVerification(corps: Record<string, unknown>): DemandeVerification | null {
  const demandeId = corps.demande_id;

  if (typeof demandeId !== "string" || demandeId === "") return null;

  if (corps.statut === "verification_email_requise" && typeof corps.email_masque === "string") {
    return { canal: "email", demandeId, destination: corps.email_masque };
  }

  if (corps.statut === "verification_telephone_requise" && typeof corps.telephone_masque === "string") {
    return { canal: "telephone", demandeId, destination: corps.telephone_masque };
  }

  return null;
}

/** Un motif de refus connu, ou `null` pour un motif que ce site ne sait pas nommer. */
export function lireMotif(corps: unknown): MotifRefus | null {
  return estObjet(corps) && estMotif(corps.motif) ? corps.motif : null;
}

/** Un code saisi ou collé : seuls les chiffres comptent, six au plus. */
export function nettoyerCode(brut: string): string {
  return brut.replace(/\D/g, "").slice(0, 6);
}

export type ResultatVerification =
  | { genre: "verifie"; corps: Record<string, unknown> }
  /** `demandeId` : rendu avec un lien expiré, il permet d'en demander un autre. */
  | { genre: "refuse"; motif: MotifRefus | null; demandeId: string | null }
  | { genre: "tropDeTentatives" }
  | { genre: "indisponible" };

export type ResultatRenvoi = "envoye" | "tropTot" | "indisponible";

export type CorpsVerification = { jeton: string } | { demande_id: string; code: string };

/**
 * L'UNIQUE point de contact du navigateur avec la vérification.
 *
 * Le navigateur parle au relais de klassci.com, qui signe et transmet à
 * l'instance de l'école. Le canal voyage dans le corps : c'est le relais qui
 * choisit le chemin côté KLASSCI (`verification-relais.ts`).
 */
async function appeler(ecole: string, action: "verifier" | "renvoyer", corps: Record<string, string>): Promise<Response> {
  return fetch(`/api/verification/${encodeURIComponent(ecole)}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
}

async function corpsDe(reponse: Response): Promise<Record<string, unknown> | null> {
  const lu: unknown = await reponse.json().catch(() => null);

  return estObjet(lu) ? lu : null;
}

export async function verifier(ecole: string, canal: Canal, corps: CorpsVerification): Promise<ResultatVerification> {
  try {
    const reponse = await appeler(ecole, "verifier", { ...corps, canal });
    const lu = await corpsDe(reponse);

    if (reponse.ok && lu !== null && lu.verifie === true) return { genre: "verifie", corps: lu };

    // 400 : le relais a refusé un jeton ou un code malformé, avant même l'école.
    if (reponse.status === 422 || reponse.status === 400) {
      const demandeId = lu?.demande_id;

      return {
        genre: "refuse",
        motif: lireMotif(lu),
        demandeId: typeof demandeId === "string" && demandeId !== "" ? demandeId : null,
      };
    }

    if (reponse.status === 429) return { genre: "tropDeTentatives" };

    return { genre: "indisponible" };
  } catch {
    return { genre: "indisponible" };
  }
}

export async function renvoyer(ecole: string, canal: Canal, demandeId: string): Promise<ResultatRenvoi> {
  try {
    const reponse = await appeler(ecole, "renvoyer", { demande_id: demandeId, canal });

    if (reponse.ok) return "envoye";
    if (reponse.status === 429) return "tropTot";

    return "indisponible";
  } catch {
    return "indisponible";
  }
}

export type SuiteReponse =
  | { genre: "verification"; demande: DemandeVerification }
  | { genre: "abouti" }
  | { genre: "nonTraitee" };

/**
 * Ce qu'on fait d'une réponse d'envoi acceptée (2xx).
 *
 * La vérification du contact est un réglage de chaque école, désactivé par
 * défaut. Le chemin ordinaire est donc l'écran de réussite habituel : l'écran
 * de code n'apparaît QUE si la réponse porte `verification_*_requise` avec son
 * `demande_id`. Même dans ce cas, la demande est déjà chez l'école ; le code
 * confirme seulement le contact.
 *
 * `enregistre` : la réponse dit-elle que la demande est enregistrée ? Toujours
 * vrai pour une candidature acceptée ; la réinscription le lit dans le corps.
 */
export function suiteReponse(corps: Record<string, unknown>, enregistre: boolean): SuiteReponse {
  const demande = lireDemandeVerification(corps);

  if (demande !== null) return { genre: "verification", demande };

  return enregistre ? { genre: "abouti" } : { genre: "nonTraitee" };
}
