/**
 * La balise. Composant serveur : rien ici ne doit atteindre le navigateur
 * autrement que sous forme de texte deja rendu.
 *
 * `dangerouslySetInnerHTML` est ici le mecanisme correct, et non un
 * contournement : React echapperait sinon les guillemets du JSON en entites
 * HTML, que l'analyseur JSON-LD ne decode pas — le graphe deviendrait
 * illisible. La securite est assuree en amont par `serialiser()`, qui
 * neutralise `<`, `>`, `&` et les separateurs de ligne Unicode.
 */

import { serialiser } from "@/lib/schema/serialiser";
import type { JsonLdGraphe } from "@/lib/schema/types";

export function JsonLd({ graph }: { graph: JsonLdGraphe }) {
  if (graph["@graph"].length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialiser(graph) }}
    />
  );
}
