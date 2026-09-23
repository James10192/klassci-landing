import { notFound } from "next/navigation";

import { source } from "@/lib/source";
import { carteKlassci } from "@/lib/og/carte";
import { langueCarte } from "@/lib/og/cartes";

/**
 * Les cartes de partage de la documentation. Voir `cheminCarteDoc`.
 *
 * Toutes sont construites au déploiement : la liste des pages est connue, et
 * une carte servie depuis le disque ne coûte rien à chaque partage.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams("slug", "locale").map(({ slug, locale }) => {
    const segments = slug && slug.length > 0 ? [...slug] : ["index"];
    segments[segments.length - 1] += ".png";

    return { locale, chemin: segments };
  });
}

export async function GET(
  _requete: Request,
  { params }: { params: { locale: string; chemin: string[] } },
) {
  const segments = [...params.chemin];
  segments[segments.length - 1] = segments[segments.length - 1].replace(/\.png$/, "");
  const slug = segments.length === 1 && segments[0] === "index" ? [] : segments;

  const locale = langueCarte(params.locale);
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  return carteKlassci({
    locale,
    rubrique: "documentation",
    titre: page.data.title,
    description: (page.data as { description?: string }).description ?? "",
  });
}
