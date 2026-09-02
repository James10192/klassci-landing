/**
 * Les etablissements clients.
 *
 * Ce qu'on veut dire : « ces ecoles utilisent KLASSCI ». Ce qu'il ne faut
 * surtout pas dire : « ces ecoles notent KLASSCI 4,8 sur 5 ».
 *
 * schema.org n'a pas de propriete « client » sur `Organization`. La formulation
 * exacte et sans risque est donc `WebPage.mentions` : la page cite ces
 * organisations. C'est vrai, verifiable — leurs logos sont a l'ecran — et cela
 * suffit aux moteurs de reponse pour relier KLASSCI a ses references.
 *
 * Deux precautions tenues ici :
 *
 * 1. Aucun `@id` n'est forge pour un tiers. Un `@id` est une affirmation
 *    d'identite : declarer `klassci.com/#esbtp-abidjan` reviendrait a dire que
 *    l'ESBTP est une entite definie par klassci.com. Ces noeuds sont donc
 *    anonymes et portent l'adresse de l'ecole, la seule que ce site connaisse
 *    d'elle.
 * 2. Aucune note, aucun avis. Les temoignages du site sont recueillis et
 *    publies par KLASSCI : Google exclut du resultat « etoiles » toute
 *    organisation qui controle les avis publies sur elle-meme.
 */

import type { Locale } from "@/i18n/routing";

import { ORGANISATION_ID } from "./constantes";
import type { JsonLdNoeud } from "./types";
import { ref } from "./types";

export interface EtablissementClient {
  nom: string;
  url?: string;
  logo?: string | null;
  ville?: string;
}

export function buildClientList(
  etablissements: EtablissementClient[],
  locale: Locale,
): JsonLdNoeud | undefined {
  if (etablissements.length === 0) return undefined;

  return {
    "@type": "ItemList",
    name:
      locale === "fr"
        ? "Etablissements utilisant KLASSCI"
        : "Institutions using KLASSCI",
    numberOfItems: etablissements.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: etablissements.map((etablissement, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "EducationalOrganization",
        name: etablissement.nom,
        url: etablissement.url,
        logo: etablissement.logo ?? undefined,
        address: etablissement.ville
          ? {
              "@type": "PostalAddress",
              addressLocality: etablissement.ville,
              addressCountry: "CI",
            }
          : undefined,
        // Le lien est declare dans ce sens, et seulement dans ce sens :
        // l'ecole utilise l'outil. On n'ecrit rien de ce qu'elle en pense.
        subjectOf: ref(ORGANISATION_ID),
      },
    })),
  };
}
