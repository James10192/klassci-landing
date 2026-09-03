/**
 * L'editeur, African Digit Consulting, et la marque KLASSCI qu'il porte.
 *
 * Ce noeud n'apparait qu'une fois par page, avec le meme `@id` partout, et
 * c'est tout son interet : c'est ce qui permet a un moteur de rassembler la
 * page d'accueil, les trois pages produit, la documentation et le blog sous une
 * seule et meme organisation.
 *
 * Il ne produit pas de resultat enrichi au sens strict — Google le dit
 * explicitement — mais il alimente le panneau de connaissance, la
 * desambiguisation de la marque et l'extraction par les moteurs de reponse.
 * C'est le noeud le plus rentable du graphe, et celui a remplir en premier.
 */

import type { Locale } from "@/i18n/routing";

import {
  COURRIEL_CONTACT,
  DESCRIPTION_EDITEUR,
  LOGO,
  MARQUE_ID,
  ORGANISATION_ID,
  PAYS_DESSERVIS,
  PROFILS_OFFICIELS,
  SITE_URL,
} from "./constantes";
import type { JsonLdNoeud } from "./types";
import { ref } from "./types";
import { urlActif } from "./urls";

export interface EntreeOrganisation {
  locale: Locale;
  competences?: string[];
}

/**
 * Les sujets que KLASSCI maitrise. `knowsAbout` est l'une des rares proprietes
 * qu'un moteur de reponse lit litteralement pour decider si une entite fait
 * autorite sur une question. Les valeurs decrivent ce que le produit fait
 * reellement, pas une liste de mots-cles.
 */
const COMPETENCES: Record<Locale, string[]> = {
  fr: [
    "Gestion scolaire",
    "Systeme LMD (UEMOA)",
    "Bulletins et releves de notes",
    "Comptabilite scolaire et suivi des paiements",
    "Emargement et gestion des presences",
    "Emplois du temps et planification academique",
    "Inscriptions et reinscriptions en ligne",
    "Logiciel de gestion d'etablissement en Afrique de l'Ouest",
  ],
  en: [
    "School management",
    "LMD system (UEMOA)",
    "Report cards and transcripts",
    "School accounting and payment tracking",
    "Digital attendance",
    "Timetables and academic planning",
    "Online enrolment and re-enrolment",
    "School information systems for West Africa",
  ],
};

/**
 * La marque du produit.
 *
 * `Brand` est le type exact pour un nom de produit qui n'est pas une personne
 * morale : il porte le logo et l'accroche sans rien affirmer d'une societe.
 * C'est ce noeud, et non l'organisation, qui s'appelle KLASSCI.
 */
export function buildMarque({ description, slogan }: {
  description: string;
  slogan?: string;
}): JsonLdNoeud {
  return {
    "@type": "Brand",
    "@id": MARQUE_ID,
    name: "KLASSCI",
    description,
    slogan,
    logo: ref(`${SITE_URL}/#logo`),
    url: SITE_URL,
  };
}

export function buildOrganization({
  locale,
  competences,
}: EntreeOrganisation): JsonLdNoeud {
  return {
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: "African Digit Consulting",
    alternateName: "ADC",
    url: SITE_URL,
    description: DESCRIPTION_EDITEUR[locale],
    // `foundingDate` est absent a dessein : ce depot connait l'annee des
    // premiers etablissements accompagnes, pas celle de la creation de la
    // societe. Les deux ne se confondent pas.
    //
    // Une adresse partielle est acceptee et reste vraie. Une rue inventee ne le
    // serait pas : `streetAddress` et `postalCode` restent absents tant que
    // personne n'a fourni l'adresse reelle du siege.
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abidjan",
      addressCountry: "CI",
    },
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: urlActif(LOGO.chemin),
      contentUrl: urlActif(LOGO.chemin),
      width: LOGO.largeur,
      height: LOGO.hauteur,
      caption: "KLASSCI",
    },
    // Le logo servi est celui du produit : c'est la marque que ce site affiche,
    // et Google demande le logo tel qu'il apparait sur le site.
    brand: ref(MARQUE_ID),
    image: ref(`${SITE_URL}/#logo`),
    email: COURRIEL_CONTACT,
    // `telephone` reste absent : le seul numero present dans le depot est le
    // remplissage du formulaire de contact, qui n'est pas un numero joignable.
    sameAs: PROFILS_OFFICIELS,
    knowsAbout: competences ?? COMPETENCES[locale],
    areaServed: PAYS_DESSERVIS.map((code) => ({
      "@type": "Country",
      identifier: code,
    })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: locale === "fr" ? "service client" : "customer support",
        email: COURRIEL_CONTACT,
        availableLanguage: ["fr", "en"],
        areaServed: PAYS_DESSERVIS,
      },
    ],
  };
}
