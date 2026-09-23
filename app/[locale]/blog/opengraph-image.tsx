import { carteDePage } from "@/lib/og/cartes";

import { generateMetadata } from "./page";

export { size, contentType } from "@/lib/og/cartes";
export const alt = "KLASSCI";

// Construite au déploiement : voir `parLangue`.
export { generateStaticParams } from "./page";

export default function Image({ params }: { params: { locale: string } }) {
  return carteDePage(generateMetadata, params, "ressources");
}
