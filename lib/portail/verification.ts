/**
 * La vérification d'une demande avant qu'elle n'atteigne l'école.
 *
 * Une candidature ou une réinscription n'est plus traitée à la réception :
 * KLASSCI répond d'abord qu'il faut confirmer le canal de contact, par un code
 * à six chiffres envoyé à l'adresse e-mail, ou par WhatsApp pour qui n'en a
 * pas. Une adresse mal tapée ne produit plus une candidature qu'aucune
 * convocation ne pourra atteindre.
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

const MOTIFS: readonly MotifRefus[] = ["code_invalide", "expire", "trop_de_tentatives"];

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
  if (corps === null || typeof corps !== "object") return null;

  const motif = (corps as Record<string, unknown>).motif;

  return typeof motif === "string" && (MOTIFS as readonly string[]).includes(motif)
    ? (motif as MotifRefus)
    : null;
}

/** Un code saisi ou collé : seuls les chiffres comptent, six au plus. */
export function nettoyerCode(brut: string): string {
  return brut.replace(/\D/g, "").slice(0, 6);
}

export type ResultatVerification =
  | { genre: "verifie"; corps: Record<string, unknown> }
  | { genre: "refuse"; motif: MotifRefus | null; corps: Record<string, unknown> | null }
  | { genre: "tropDeTentatives" }
  | { genre: "indisponible" };

export type ResultatRenvoi = "envoye" | "tropTot" | "indisponible";

export type CorpsVerification =
  | { jeton: string }
  | { demande_id: string; code: string };

/**
 * L'UNIQUE point de contact avec les routes de vérification.
 *
 * Le navigateur parle au relais de klassci.com, qui signe et transmet à
 * l'instance de l'école. Le canal voyage dans le corps : c'est le relais qui
 * décide du chemin côté KLASSCI (voir `verification-relais.ts`), pour que ce
 * choix ne se fasse qu'à un seul endroit.
 */
export async function appelerVerification(
  ecole: string,
  action: "verifier" | "renvoyer",
  canal: Canal,
  corps: Record<string, string>,
): Promise<Response> {
  return fetch(`/api/verification/${encodeURIComponent(ecole)}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...corps, canal }),
  });
}

async function corpsDe(reponse: Response): Promise<Record<string, unknown> | null> {
  return reponse
    .json()
    .then((c) => (c !== null && typeof c === "object" ? (c as Record<string, unknown>) : null))
    .catch(() => null);
}

export async function verifier(
  ecole: string,
  canal: Canal,
  corps: CorpsVerification,
): Promise<ResultatVerification> {
  try {
    const reponse = await appelerVerification(ecole, "verifier", canal, corps);
    const lu = await corpsDe(reponse);

    if (reponse.ok && lu?.verifie === true) return { genre: "verifie", corps: lu };
    // 400 : le relais a refusé un jeton ou un code malformé, avant même l'école.
    if (reponse.status === 422 || reponse.status === 400) {
      return { genre: "refuse", motif: lireMotif(lu), corps: lu };
    }
    if (reponse.status === 429) return { genre: "tropDeTentatives" };

    return { genre: "indisponible" };
  } catch {
    return { genre: "indisponible" };
  }
}

export async function renvoyer(ecole: string, canal: Canal, demandeId: string): Promise<ResultatRenvoi> {
  try {
    const reponse = await appelerVerification(ecole, "renvoyer", canal, { demande_id: demandeId });

    if (reponse.status === 202 || reponse.ok) return "envoye";
    if (reponse.status === 429) return "tropTot";

    return "indisponible";
  } catch {
    return "indisponible";
  }
}
