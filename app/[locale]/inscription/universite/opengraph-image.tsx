import { carteDePage } from "@/lib/og/cartes";

import { generateMetadata } from "./page";

export { size, contentType } from "@/lib/og/cartes";
export const alt = "KLASSCI";

// Construite au déploiement : voir `parLangue`.
export { parLangue as generateStaticParams } from "@/lib/og/cartes";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const routeParams = await params;
  return carteDePage(generateMetadata, routeParams, "inscription");
}
