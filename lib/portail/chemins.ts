/**
 * Les points d'entrée publics de KLASSCI, côté instance.
 *
 * Module pur, sans `server-only` : le relais les signe, et l'adaptateur de
 * vérification (lu aussi par les tests Node) choisit parmi eux.
 *
 * Deux canaux : la réinscription identifie un dossier existant, la candidature
 * n'identifie personne. Ils partagent le relais, la signature et le registre,
 * mais pas leur protection, qui diffère par nature.
 */
export const CHEMINS = {
  reinscriptionLookup: "api/public/reinscription/lookup",
  reinscriptionSubmit: "api/public/reinscription/submit",
  inscriptionChoix: "api/public/inscription/choix",
  inscriptionSubmit: "api/public/inscription/submit",
  rdvCreneaux: "api/public/rendez-vous/creneaux",
  rdvReserver: "api/public/rendez-vous/reserver",
  rdvConsulter: "api/public/rendez-vous/consulter",
  rdvDeplacer: "api/public/rendez-vous/deplacer",
  rdvAnnuler: "api/public/rendez-vous/annuler",
  rdvRetrouver: "api/public/rendez-vous/retrouver",
  // Vérification d'une demande (e-mail ou WhatsApp). Chemins fixés par le
  // contrat convenu avec KLASSCIv2 pour l'e-mail ; pour WhatsApp, HYPOTHÈSE :
  // mêmes chemins, avec un champ `canal`. Le choix se fait dans
  // `verification-relais.ts`, et nulle part ailleurs.
  verificationVerifier: "api/portail/email/verifier",
  verificationRenvoyer: "api/portail/email/renvoyer",
  // Suivi d'un dossier deja depose : situation, adresse, convocation,
  // reference oubliee (envoyee par e-mail, jamais affichee).
  suiviConsulter: "api/public/suivi/consulter",
  suiviEmail: "api/public/suivi/email",
  suiviVerifier: "api/public/suivi/verifier",
  suiviConvocation: "api/public/suivi/convocation",
  suiviReferenceOubliee: "api/public/suivi/reference-oubliee",
} as const;

export type CheminPublic = (typeof CHEMINS)[keyof typeof CHEMINS];
