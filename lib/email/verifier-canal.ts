import { normaliserWhatsapp } from "./telephone-whatsapp.ts";
import { refusServeur } from "./verifier-email.ts";

/**
 * Le canal de vérification d'une candidature tient-il, côté serveur ?
 *
 * Rend les erreurs par champ, au format que le portail sait déjà afficher
 * (`champs` d'un 422), ou `null` si tout va bien. Les phrases sont en
 * français : c'est la langue des messages de validation de KLASSCI, et le
 * portail les traduit déjà en anglais champ par champ.
 *
 * Sans adresse e-mail, le téléphone devient le canal : il doit être un mobile
 * ivoirien. Il est alors réécrit au format `+225…` dans le corps transmis,
 * pour que l'école reçoive un numéro qu'elle peut appeler sur WhatsApp.
 */
const MESSAGES = {
  invalide: "L'adresse e-mail est incomplète.",
  factice: "Ce domaine ne reçoit pas de courrier. Indiquez une adresse que vous consultez.",
  faute_de_frappe: "Cette adresse contient une faute de frappe. Vérifiez le domaine après le @.",
  whatsapp: "Sans adresse e-mail, indiquez un mobile ivoirien joignable sur WhatsApp (01, 05 ou 07).",
} as const;

export function verifierCanal(corps: Record<string, unknown>): Record<string, string[]> | null {
  const email = corps.email;

  if (typeof email === "string") {
    const refus = refusServeur(email);

    return refus === null ? null : { email: [MESSAGES[refus]] };
  }

  const telephone = typeof corps.telephone === "string" ? normaliserWhatsapp(corps.telephone) : null;

  if (telephone === null) return { telephone: [MESSAGES.whatsapp] };

  corps.telephone = telephone;

  return null;
}
