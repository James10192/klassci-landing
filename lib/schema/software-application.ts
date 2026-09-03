/**
 * Les trois editions du produit.
 *
 * Choix de type — `SoftwareApplication` plutot que `Product` :
 *
 * - `Product` + `Offer` viserait le resultat « extrait de produit », et
 *   passerait techniquement avec les seuls tarifs. Mais la regle de pertinence
 *   demande que le balisage decrive ce que la page est : ces pages ne vendent
 *   pas, elles qualifient un prospect vers une demonstration. `Product`
 *   placerait par ailleurs KLASSCI dans un univers d'achat ou l'entite serait
 *   comparee a des biens.
 * - `SoftwareApplication` decrit exactement l'objet : un logiciel servi par
 *   navigateur, sous licence annuelle. C'est le type que les moteurs de reponse
 *   et les bases d'entites lisent pour repondre « quel logiciel de gestion
 *   scolaire existe en Afrique de l'Ouest ».
 *
 * Consequence assumee : `SoftwareApplication` exige `aggregateRating` OU
 * `review` pour etre eligible au resultat enrichi. KLASSCI n'a aucun avis tiers
 * verifiable a declarer, donc aucun n'est emis, et il n'y aura pas d'etoiles.
 * C'est le bon arbitrage : une note fabriquee expose a une action manuelle qui
 * retirerait la page de TOUS les resultats enrichis, fil d'Ariane compris.
 */

import type { Locale } from "@/i18n/routing";

import {
  APPLICATION_ID,
  CHEMIN_EDITION,
  NAVIGATEURS_REQUIS,
  ORGANISATION_ID,
  type Edition,
} from "./constantes";
import type { JsonLdNoeud } from "./types";
import { ref } from "./types";
import { baliseLangue, urlPage } from "./urls";

/** Une formule commerciale reellement affichee sur la page. */
export interface Formule {
  /** Le nom lu par le visiteur. */
  nom: string;
  /** Le tarif annuel courant, en francs CFA, celui qui figure sur la page. */
  prixAnnuel: number;
  /** Un tarif promotionnel, s'il est affiche a cote du tarif courant. */
  prixPromotionnel?: number;
  /** ISO 8601. Obligatoire des lors qu'un prix promotionnel est declare. */
  promotionValableJusquA?: string;
  /** L'ancre de la page ou le tarif est visible. */
  ancre?: string;
}

export interface EntreeApplication {
  edition: Edition;
  locale: Locale;
  nom: string;
  description: string;
  fonctionnalites: string[];
  /**
   * Les formules affichees. Absent pour une edition qui n'est pas encore
   * commercialisee — c'est le cas du LMS, annonce « bientot ». Mieux vaut
   * aucune offre qu'une offre a zero franc.
   */
  formules?: Formule[];
  /**
   * L'edition dont celle-ci fait partie, si elle n'est pas vendue seule.
   *
   * On passe ici un noeud nomme, et non une simple reference `@id` : le noeud
   * complet de l'edition parente n'est pas dans le graphe de cette page — il
   * n'a rien a y faire — et une reference vers un identifiant absent du graphe
   * est une reference orpheline, que rien ne resout et que rien ne signale.
   */
  partieDe?: { id: string; nom: string; url: string };
  categorie?: string;
}

const DEVISE = "XOF";

/**
 * Prix unitaire annuel. `UnitPriceSpecification` dit ce qu'un simple `price`
 * tait : que ce montant couvre douze mois. Sans cette precision, un lecteur
 * automatique compare un abonnement annuel a un paiement unique.
 */
function specificationTarifaire(formule: Formule, locale: Locale): JsonLdNoeud {
  return {
    "@type": "UnitPriceSpecification",
    price: formule.prixPromotionnel ?? formule.prixAnnuel,
    priceCurrency: DEVISE,
    billingDuration: 1,
    billingIncrement: 1,
    unitCode: "ANN",
    unitText: locale === "fr" ? "an" : "year",
    // `valueAddedTaxIncluded` est volontairement absent : rien sur le site ne
    // dit si ces montants sont hors taxes ou toutes taxes comprises.
  };
}

function offre(formule: Formule, locale: Locale, urlEdition: string): JsonLdNoeud {
  return {
    "@type": "Offer",
    name: formule.nom,
    price: formule.prixPromotionnel ?? formule.prixAnnuel,
    priceCurrency: DEVISE,
    priceValidUntil: formule.promotionValableJusquA,
    priceSpecification: specificationTarifaire(formule, locale),
    availability: "https://schema.org/InStock",
    url: formule.ancre ? `${urlEdition}${formule.ancre}` : urlEdition,
    seller: ref(ORGANISATION_ID),
    category: locale === "fr" ? "Licence annuelle" : "Annual licence",
  };
}

/**
 * `AggregateOffer` porte la fourchette. Les formules a tarification variable —
 * la formule Partenaire, facturee a l'eleve — en sont exclues : une fourchette
 * n'a de sens que sur des prix fixes et affiches.
 */
function offreAgregee(
  formules: Formule[],
  locale: Locale,
  urlEdition: string,
): JsonLdNoeud | undefined {
  if (formules.length === 0) return undefined;

  const prix = formules.map((f) => f.prixPromotionnel ?? f.prixAnnuel);

  return {
    "@type": "AggregateOffer",
    priceCurrency: DEVISE,
    lowPrice: Math.min(...prix),
    highPrice: Math.max(...prix),
    offerCount: formules.length,
    availability: "https://schema.org/InStock",
    offers: formules.map((formule) => offre(formule, locale, urlEdition)),
  };
}

export function buildSoftwareApplication({
  edition,
  locale,
  nom,
  description,
  fonctionnalites,
  formules,
  partieDe,
  categorie = "BusinessApplication",
}: EntreeApplication): JsonLdNoeud {
  const urlEdition = urlPage(locale, CHEMIN_EDITION[edition]);

  return {
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": APPLICATION_ID[edition],
    name: nom,
    url: urlEdition,
    description,
    applicationCategory: categorie,
    applicationSubCategory:
      locale === "fr"
        ? "Logiciel de gestion d'etablissement scolaire"
        : "School management software",
    operatingSystem: locale === "fr" ? "Navigateur web" : "Web browser",
    browserRequirements: NAVIGATEURS_REQUIS,
    featureList: fonctionnalites,
    inLanguage: [baliseLangue("fr"), baliseLangue("en")],
    provider: ref(ORGANISATION_ID),
    publisher: ref(ORGANISATION_ID),
    // `isAccessibleForFree: false` leve l'ambiguite que creait l'ancien
    // `price: "0"` : le produit n'est pas gratuit, il propose un essai.
    isAccessibleForFree: formules && formules.length > 0 ? false : undefined,
    isPartOf: partieDe
      ? {
          "@type": "SoftwareApplication",
          "@id": partieDe.id,
          name: partieDe.nom,
          url: partieDe.url,
        }
      : undefined,
    offers: formules ? offreAgregee(formules, locale, urlEdition) : undefined,
    // Pas d'`aggregateRating`, pas de `review`. Voir l'en-tete du fichier.
  };
}
