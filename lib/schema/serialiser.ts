/**
 * La serialisation du graphe, et le nettoyage qui la precede.
 *
 * Le contenu d'un `<script type="application/ld+json">` est du texte brut : le
 * navigateur n'y decode aucune entite HTML, mais il ferme le script au premier
 * `</script>` rencontre. Une chaine traduite qui contiendrait cette suite —
 * dans une reponse de FAQ, dans la description d'un article — sortirait donc du
 * script et deviendrait du HTML executable.
 *
 * On echappe `<`, `>` et `&` en sequences JSON `\uXXXX` : invisibles pour un
 * analyseur JSON, qui les redecode en caracteres, inoffensives pour l'analyseur
 * HTML, qui n'y voit plus de balise. U+2028 et U+2029 le sont en prime : ils
 * sont valides en JSON mais rompent un litteral JavaScript.
 */

import type { JsonLdGraphe, JsonLdNoeud, JsonLdValeur } from "./types";

const ECHAPPEMENTS: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

/**
 * Retire recursivement les valeurs absentes, les chaines vides et les tableaux
 * vides.
 *
 * Une propriete absente est neutre. Une propriete presente et vide est une
 * affirmation fausse : elle dit « cette organisation a une adresse, et cette
 * adresse est la chaine vide ». Les validateurs la signalent, et les systemes
 * qui relisent le graphe la recopient.
 */
export function nettoyer(
  valeur: JsonLdValeur | undefined,
): JsonLdValeur | undefined {
  if (valeur === undefined || valeur === null) return undefined;

  if (typeof valeur === "string") {
    const coupe = valeur.trim();
    return coupe === "" ? undefined : coupe;
  }

  if (typeof valeur === "number" || typeof valeur === "boolean") return valeur;

  if (Array.isArray(valeur)) {
    const elements = valeur
      .map((element) => nettoyer(element))
      .filter((element): element is JsonLdValeur => element !== undefined);
    return elements.length > 0 ? elements : undefined;
  }

  const noeud: JsonLdNoeud = {};
  let garde = 0;
  for (const [cle, brut] of Object.entries(valeur)) {
    const propre = nettoyer(brut);
    if (propre === undefined) continue;
    noeud[cle] = propre;
    if (cle !== "@type" && cle !== "@id") garde += 1;
  }

  // Un noeud reduit a `{"@type": "..."}` ne dit rien. Une simple reference
  // `{"@id": "..."}`, elle, est le mecanisme meme du graphe : on la garde.
  if (garde === 0 && noeud["@id"] === undefined) return undefined;

  return noeud;
}

/** Assemble un graphe a partir de noeuds dont certains peuvent etre absents. */
export function graphe(
  ...noeuds: Array<JsonLdNoeud | undefined | null | false>
): JsonLdGraphe {
  const retenus = noeuds
    .filter((noeud): noeud is JsonLdNoeud => Boolean(noeud))
    .map((noeud) => nettoyer(noeud))
    .filter(
      (noeud): noeud is JsonLdNoeud =>
        noeud !== undefined && typeof noeud === "object" && !Array.isArray(noeud),
    );

  return { "@context": "https://schema.org", "@graph": retenus };
}

/** Le texte a poser dans la balise. Sur, meme sur des chaines traduites. */
export function serialiser(donnees: JsonLdGraphe): string {
  return JSON.stringify(donnees).replace(
    /[<>&\u2028\u2029]/g,
    (caractere) => ECHAPPEMENTS[caractere] ?? caractere,
  );
}
