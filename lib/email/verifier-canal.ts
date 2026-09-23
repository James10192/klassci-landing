import { normaliserWhatsapp } from "./telephone-whatsapp.ts";
import { analyserEmail, emailBloque } from "./verifier-email.ts";

/**
 * Le canal de vérification d'une candidature tient-il, côté serveur ?
 *
 * Deux issues, nommées : `{ erreurs }` au format que le portail sait déjà
 * afficher (`champs` d'un 422), ou `{ telephone }`, le numéro à transmettre à
 * l'école. Rien n'est modifié en place.
 *
 * Avec une adresse e-mail, elle doit passer la règle commune ; le téléphone
 * part alors tel que saisi. Sans adresse, le téléphone devient le canal : il
 * doit être un mobile ivoirien, et part au format `+225…` pour que l'école
 * puisse l'appeler sur WhatsApp.
 *
 * Les phrases sont en français, la langue des messages de validation de
 * KLASSCI ; le portail les traduit déjà champ par champ.
 */
const MESSAGES = {
  invalide: "L’adresse e-mail est incomplète.",
  factice: "Ce domaine ne reçoit pas de courrier. Indiquez une adresse que vous consultez.",
  faute_de_frappe: "Cette adresse contient probablement une faute de frappe. Vérifiez le domaine après le @.",
  whatsapp: "Sans adresse e-mail, indiquez un mobile ivoirien joignable sur WhatsApp (01, 05 ou 07).",
} as const;

export type VerdictCanal = { erreurs: Record<string, string[]> } | { telephone: string };

export function verifierCanal(saisie: {
  email?: string;
  telephone: string;
  /** La personne a-t-elle confirmé son adresse malgré une faute seulement probable ? */
  emailConfirme: boolean;
}): VerdictCanal {
  const email = saisie.email === undefined ? "" : saisie.email.trim();

  if (email !== "") {
    const refus = emailBloque(analyserEmail(email), saisie.emailConfirme);

    return refus === null ? { telephone: saisie.telephone } : { erreurs: { email: [MESSAGES[refus]] } };
  }

  const telephone = normaliserWhatsapp(saisie.telephone);

  return telephone === null ? { erreurs: { telephone: [MESSAGES.whatsapp] } } : { telephone };
}
