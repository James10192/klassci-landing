import { carteDePage, visuelArticle } from "@/lib/og/cartes";

import { generateMetadata } from "./page";

export { size, contentType } from "@/lib/og/cartes";
export const alt = "KLASSCI";

// Construite au déploiement : voir `parLangue`.
export { generateStaticParams } from "./page";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const routeParams = await params;
  return carteDePage(generateMetadata, routeParams, "ressources", visuelArticle(routeParams.slug));
}
