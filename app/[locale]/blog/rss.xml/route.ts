import { articles } from "@/lib/blog";
import { SITE_URL } from "@/lib/site-url";
import { LANGUE_BLOG } from "@/lib/source";

/**
 * Le flux RSS du blog.
 *
 * Ce n'est pas un vestige : c'est le seul canal par lequel un lecteur peut
 * suivre le corpus sans laisser d'adresse e-mail, et c'est ce que lisent les
 * agregateurs, les lettres d'information sectorielles et une partie des
 * robots d'indexation. Sur un contenu reglementaire publie au rythme d'un
 * article par quinzaine, il coute une vingtaine de lignes et il ne se perime
 * pas.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: LANGUE_BLOG }];
}

/** Echappe ce qui, dans un texte, casserait le XML. */
function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (locale !== LANGUE_BLOG) {
    return new Response("Not found", { status: 404 });
  }

  const liste = articles();
  const base = `${SITE_URL}/${LANGUE_BLOG}`;

  const entrees = liste
    .map((item) => {
      const publication = new Date(`${item.donnees.date}T09:00:00Z`).toUTCString();
      return `    <item>
      <title>${echapper(item.donnees.title)}</title>
      <link>${base}${item.chemin}</link>
      <guid isPermaLink="true">${base}${item.chemin}</guid>
      <pubDate>${publication}</pubDate>
      <description>${echapper(
        item.donnees.resume ?? item.donnees.description ?? "",
      )}</description>
      <category>${echapper(item.donnees.theme)}</category>
    </item>`;
    })
    .join("\n");

  const flux = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KLASSCI — Ressources</title>
    <link>${base}/blog</link>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Textes reglementaires, procedures et methodes de calcul pour les etablissements de Cote d'Ivoire et de la zone UEMOA.</description>
    <language>fr</language>
    <lastBuildDate>${
      liste[0]
        ? new Date(`${liste[0].donnees.date}T09:00:00Z`).toUTCString()
        : new Date().toUTCString()
    }</lastBuildDate>
${entrees}
  </channel>
</rss>
`;

  return new Response(flux, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
