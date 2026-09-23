import { carteDEcole } from "@/lib/og/cartes";

export { size, contentType } from "@/lib/og/cartes";
export const alt = "KLASSCI";

// Les couleurs et le logo viennent de l'instance de l'école, relue au plus une
// fois par heure — la même cadence que la page.
export const revalidate = 3600;

export default function Image({ params }: { params: { locale: string; ecole: string } }) {
  return carteDEcole(params, "rendezVous");
}
