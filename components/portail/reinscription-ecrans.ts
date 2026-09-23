import type { Classement, RegleEcran } from "./reponses";

/**
 * Le vocabulaire d'écrans de la réinscription, sorti du parcours qui passait
 * la limite de taille de ce dépôt. Données et types seulement.
 */

export type Situation = {
  trouve: boolean;
  prenom?: string;
  classe_actuelle?: string | null;
  annee_cible?: string | null;
  eligible?: boolean;
  demande_existante?: boolean;
};

export type Etape = "identification" | "confirmation" | "succes";

export type CleEtat =
  | "dejaDeposee"
  | "nonEligible"
  | "introuvable"
  | "ferme"
  | "tropDeTentatives"
  | "affluence"
  | "identificationBloquee"
  | "indisponible"
  | "champsInvalides"
  | "refus";

/**
 * Ce que chaque genre de réponse donne comme écran, ici.
 *
 * La même table que la candidature, avec le vocabulaire de CE parcours :
 * « année non configurée » et « conflit » n'ont pas de sens pour une
 * réinscription, ils retombent donc sur ce que le visiteur peut comprendre.
 *
 * Elle était écrite en ternaire imbriqué à quatre niveaux, qui ré-implémentait
 * à la main la règle « code inconnu → indisponible ». Deux écritures de la même
 * règle finissent toujours par diverger : celle-ci avait déjà commencé.
 */
export const ECRANS: Partial<Record<Classement["genre"], RegleEcran<CleEtat>>> = {
  ferme: { sansCode: "ferme" },
  invalide: { sansCode: "champsInvalides" },
  tropDeTentatives: {
    // Trois seaux, trois phrases. Celui d'une adresse dit vrai en parlant de
    // tentatives ; le plafond de l'établissement se remplit du trafic de tout
    // le monde ; et le seau du matricule peut avoir été rempli par un TIERS,
    // avec une fenêtre d'un quart d'heure. Les confondre accuse le visiteur de
    // ce qu'il n'a pas fait, et lui promet un délai qui n'est pas le bon.
    codes: {
      affluence: "affluence",
      trop_de_tentatives: "tropDeTentatives",
      identification_bloquee: "identificationBloquee",
    },
    sansCode: "tropDeTentatives",
  },
};
