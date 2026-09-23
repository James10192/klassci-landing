import { carteDePage } from "@/lib/og/cartes";

import { generateMetadata } from "./page";

export { size, contentType } from "@/lib/og/cartes";
export const alt = "KLASSCI";

export default function Image({ params }: { params: { locale: string } }) {
  return carteDePage(generateMetadata, params, "lms");
}
