import { carteDEcole } from "@/lib/og/cartes";

export { size, contentType, parEcole as generateStaticParams } from "@/lib/og/cartes";

// Aucun nouveau code d'etablissement ne doit declencher une image couteuse
// en production : seuls ceux connus au build ont une carte de partage.
export const dynamicParams = false;
export const alt = "KLASSCI";

// Les couleurs et le logo viennent de l'instance de l'école, relue au plus une
// fois par heure — la même cadence que la page.
export const revalidate = 3600;

export default function Image({ params }: { params: { locale: string; ecole: string } }) {
  return carteDEcole(params, "inscription");
}
