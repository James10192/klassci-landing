/**
 * Le minimum de typage pour construire un graphe JSON-LD sans `any`.
 *
 * On ne modelise pas schema.org au type pres : le vocabulaire compte des
 * milliers de proprietes, il bouge, et un type exhaustif se perimerait plus
 * vite qu'il ne rendrait service. Ce qu'on veut garantir ici est plus etroit
 * et plus utile : qu'un noeud soit serialisable, qu'il porte un `@type`, et
 * qu'un `@id` reference soit ecrit de la seule maniere admise.
 */

export type JsonLdValeur =
  | string
  | number
  | boolean
  | null
  | JsonLdNoeud
  | JsonLdValeur[];

export interface JsonLdNoeud {
  "@type"?: string | string[];
  "@id"?: string;
  [propriete: string]: JsonLdValeur | undefined;
}

/** Une simple reference vers un noeud declare ailleurs dans le meme graphe. */
export interface JsonLdReference extends JsonLdNoeud {
  "@id": string;
}

export interface JsonLdGraphe {
  "@context": "https://schema.org";
  "@graph": JsonLdNoeud[];
}

/** Reference un noeud par son identifiant. `ref(ORGANISATION_ID)`. */
export function ref(id: string): JsonLdReference {
  return { "@id": id };
}
