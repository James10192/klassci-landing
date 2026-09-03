/**
 * Les pages de documentation et les articles du blog.
 *
 * `Article`, et sa specialisation `TechArticle`, n'exige aucune propriete :
 * Google ecrit qu'il n'y a pas de proprietes obligatoires et qu'il faut ajouter
 * celles qui s'appliquent au contenu. Ce n'est plus vraiment un resultat
 * enrichi, c'est un signal de comprehension — qui ecrit, sur quoi, et quand
 * cela a ete revu. Pour une documentation de vingt-quatre pages et un blog,
 * c'est exactement ce qu'on veut declarer.
 *
 * Les dates sont le point delicat. Deux options honnetes, et une seule
 * malhonnete :
 *
 *   - lire la date dans le frontmatter, quand il en porte une ;
 *   - deriver la date du fichier source au moment de la construction ;
 *   - INTERDIT : `new Date()` au rendu. Chaque deploiement declarerait alors
 *     toutes les pages modifiees le jour meme. Google recoupe ces dates avec ce
 *     qu'il voit du contenu ; une page qui se dit fraiche sans jamais changer
 *     perd la confiance accordee a sa date — et les pages qui bougent vraiment
 *     la perdent avec elle.
 */

import type { Locale } from "@/i18n/routing";

import { ORGANISATION_ID, SITE_ID } from "./constantes";
import type { JsonLdNoeud } from "./types";
import { ref } from "./types";
import { baliseLangue, idArticle, idPage, urlActif, urlPage } from "./urls";

export interface EntreeArticle {
  locale: Locale;
  /** Le chemin sans prefixe de langue. */
  chemin: string;
  titre: string;
  description?: string;
  /** La rubrique. « Modules », « Comptable », « LMD ». */
  rubrique?: string;
  /** Les sujets traites, tires du contenu. Pas des mots-cles. */
  aPropos?: string[];
  /** ISO 8601, ou absent. Jamais la date de construction. */
  datePublication?: string;
  dateModification?: string;
  image?: { chemin: string; largeur: number; hauteur: number };
  /** `TechArticle` pour la documentation, `Article` pour le blog. */
  type?: "TechArticle" | "Article";
  /** Le nom de l'auteur, s'il est signe. A defaut, l'organisation. */
  auteur?: string;
}

/** Google tronque au-dela de 110 caracteres. On coupe sur un mot. */
function titreCourt(titre: string): string {
  if (titre.length <= 110) return titre;
  const coupe = titre.slice(0, 110);
  const espace = coupe.lastIndexOf(" ");
  return (espace > 60 ? coupe.slice(0, espace) : coupe).trimEnd();
}

export function buildTechArticle({
  locale,
  chemin,
  titre,
  description,
  rubrique,
  aPropos,
  datePublication,
  dateModification,
  image,
  type = "TechArticle",
  auteur,
}: EntreeArticle): JsonLdNoeud {
  return {
    "@type": type,
    "@id": idArticle(locale, chemin),
    headline: titreCourt(titre),
    name: titre,
    description,
    url: urlPage(locale, chemin),
    mainEntityOfPage: ref(idPage(locale, chemin)),
    isPartOf: ref(SITE_ID),
    inLanguage: baliseLangue(locale),
    articleSection: rubrique,
    about: aPropos?.map((sujet) => ({ "@type": "Thing", name: sujet })),
    // L'auteur. « Equipe KLASSCI » n'est pas une signature : c'est
    // l'organisation elle-meme, et elle a deja son noeud dans le graphe — la
    // dupliquer sans identifiant en creerait une seconde, homonyme et
    // orpheline. Une vraie signature, en revanche, merite un noeud `Person` :
    // sur un sujet reglementaire, savoir qui ecrit compte.
    author:
      auteur && !/klassci/i.test(auteur)
        ? { "@type": "Person", name: auteur }
        : ref(ORGANISATION_ID),
    publisher: ref(ORGANISATION_ID),
    datePublished: datePublication,
    dateModified: dateModification ?? datePublication,
    image: image
      ? {
          "@type": "ImageObject",
          url: urlActif(image.chemin),
          width: image.largeur,
          height: image.hauteur,
        }
      : undefined,
  };
}
