import { normaliserWhatsapp } from "@/lib/email/telephone-whatsapp";

import type { Formulaire } from "./candidature-champs";
import { dateNaissanceValide } from "./pieces";

/**
 * Ce qui empêche une candidature de partir, champ par champ.
 *
 * Sorti du parcours, qui passait la limite de taille de ce dépôt : c'est une
 * règle pure, lisible sans rien savoir de l'état d'un composant.
 *
 * Ce qui manque, et non « est-ce complet ». Un booléen ne permettait que de
 * griser le bouton, sans dire lequel des champs requis faisait défaut — et
 * rien, dans la page, ne le disait non plus. Le bouton reste donc actif, et
 * c'est l'appui qui explique.
 *
 * `cle` est une clé de l'espace `inscription`. Un `champ` absent du
 * formulaire (`email_bloque`) bloque l'envoi sans ajouter de message : le
 * champ e-mail affiche déjà le sien, avec la correction proposée.
 */
export type Manquant = { champ: string; cle: string };

export function manquantsCandidature(
  form: Formulaire,
  consentement: boolean,
  emailBloque: boolean,
): Manquant[] {
  return [
    form.nom.trim() === "" ? { champ: "nom", cle: "formulaire.requis" } : null,
    form.prenoms.trim() === "" ? { champ: "prenoms", cle: "formulaire.requis" } : null,
    // Deux états, deux phrases : « nécessaire » sur trois cases remplies
    // laisserait le candidat regarder une saisie complète et réappuyer.
    dateNaissanceValide(form.jour, form.mois, form.annee)
      ? null
      : {
          champ: "date_naissance",
          cle:
            form.jour === "" || form.mois === "" || form.annee === ""
              ? "formulaire.requis"
              : "formulaire.champInvalide",
        },
    ...contact(form, emailBloque),
    // Sous « voeu », et non sous `voeu_libre` : la contrainte porte sur les
    // trois champs ensemble — filière OU niveau OU texte libre.
    form.filiere_id === "" && form.niveau_id === "" && form.voeu_libre.trim() === ""
      ? { champ: "voeu", cle: "formulaire.voeuRequis" }
      : null,
    consentement ? null : { champ: "consentement", cle: "formulaire.requis" },
  ].filter((m): m is Manquant => m !== null);
}

/**
 * Le canal par lequel on vérifiera la candidature doit exister.
 *
 * Avec une adresse e-mail, elle doit être présente et sans faute. Sans adresse
 * e-mail, le téléphone devient le canal : il doit être un mobile ivoirien, le
 * seul qui reçoive un code WhatsApp.
 */
function contact(form: Formulaire, emailBloque: boolean): (Manquant | null)[] {
  if (form.sans_email) {
    if (form.telephone.trim() === "") return [{ champ: "telephone", cle: "formulaire.whatsappRequis" }];

    return normaliserWhatsapp(form.telephone) === null
      ? [{ champ: "telephone", cle: "formulaire.whatsappInvalide" }]
      : [];
  }

  return [
    form.telephone.trim() === "" ? { champ: "telephone", cle: "formulaire.requis" } : null,
    form.email.trim() === "" ? { champ: "email", cle: "formulaire.emailRequis" } : null,
    emailBloque ? { champ: "email_bloque", cle: "formulaire.champInvalide" } : null,
  ];
}
