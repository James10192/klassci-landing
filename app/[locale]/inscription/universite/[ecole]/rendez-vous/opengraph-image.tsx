import { carteDEcole } from "@/lib/og/cartes";

export { size, contentType, parEcole as generateStaticParams } from "@/lib/og/cartes";

export const dynamicParams = false;
export const alt = "KLASSCI";

// Les couleurs et le logo viennent de l'instance de l'école, relue au plus une
// fois par heure — la même cadence que la page.
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ locale: string; ecole: string }> }) {
  const routeParams = await params;
  return carteDEcole(routeParams, "rendezVous");
}
