/**
 * L'entite KLASSCI, et son editeur.
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
  ANNEE_CREATION,
  COURRIEL_CONTACT,
  EDITEUR_ID,
  LOGO,
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
  /** La description, dans la langue de la page. */
  description: string;
  /** L'accroche courte affichee en haut de la page produit. */
  slogan?: string;
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
 * L'editeur, tel que le pied de page et les metadonnees du layout le nomment.
 *
 * A CONFIRMER : si KLASSCI n'est pas une personne morale distincte mais un
 * produit d'African Digital Consulting, il faut inverser la hierarchie —
 * `Organization` devient ADC, et KLASSCI une `Brand` qu'elle reference.
 */
export function buildPublisher(): JsonLdNoeud {
  return {
    "@type": "Organization",
    "@id": EDITEUR_ID,
    name: "African Digital Consulting",
    alternateName: "ADC",
    url: SITE_URL,
    subOrganization: ref(ORGANISATION_ID),
  };
}

export function buildOrganization({
  locale,
  description,
  slogan,
  competences,
}: EntreeOrganisation): JsonLdNoeud {
  return {
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: "KLASSCI",
    url: SITE_URL,
    description,
    slogan,
    foundingDate: ANNEE_CREATION,
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Abidjan",
        addressCountry: "CI",
      },
    },
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
    parentOrganization: ref(EDITEUR_ID),
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
