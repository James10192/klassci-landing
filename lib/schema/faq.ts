/**
 * La FAQ.
 *
 * Etat 2026 : le resultat enrichi FAQ est mort. Google a restreint la
 * fonctionnalite aux sites gouvernementaux et de sante en septembre 2023, puis
 * a cesse de l'afficher et retire la documentation. Emettre `FAQPage` n'ouvrira
 * donc plus d'accordeon dans les resultats.
 *
 * On l'emet quand meme, pour une seule raison defendable : c'est le seul
 * balisage qui apparie explicitement une question a sa reponse. Les moteurs de
 * reponse extraient des paires question/reponse, et une paire declaree coute
 * moins cher a extraire qu'une paire deduite d'un `<details>`. Le cout est de
 * quelques centaines d'octets ; le risque est nul tant que la regle ci-dessous
 * est tenue.
 *
 * REGLE ABSOLUE : n'emettre ce noeud que sur une page qui affiche reellement
 * ces questions. Aujourd'hui, seule la page Universite rend la FAQ. La poser
 * sur College ou LMS serait du balisage sans contenu visible — la premiere
 * interdiction des consignes generales.
 */

import type { Locale } from "@/i18n/routing";

import type { JsonLdNoeud } from "./types";
import { ref } from "./types";
import { baliseLangue, idFaq, idPage, urlPage } from "./urls";

/** La forme exacte des entrees de `messages/<locale>.json`, cle `faq.items`. */
export interface QuestionFaq {
  q: string;
  a: string;
}

export function buildFaqPage(
  items: QuestionFaq[],
  locale: Locale,
  chemin: string,
): JsonLdNoeud | undefined {
  const retenues = items.filter(
    (item) => item?.q?.trim() !== "" && item?.a?.trim() !== "",
  );
  if (retenues.length === 0) return undefined;

  return {
    "@type": "FAQPage",
    "@id": idFaq(locale, chemin),
    url: `${urlPage(locale, chemin)}#faq`,
    inLanguage: baliseLangue(locale),
    isPartOf: ref(idPage(locale, chemin)),
    mainEntity: retenues.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
