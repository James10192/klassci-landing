import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { buildDocGraph } from "@/lib/schema/pages";
import { routing, type Locale } from "@/i18n/routing";
import { getMDXComponents } from "@/mdx-components";

interface PageParams {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export async function generateStaticParams() {
  // With i18n on the source loader, generateParams returns one entry per
  // (slug, locale) pair. We just rename `lang` → `locale` to match our
  // [locale] segment in the App Router.
  return source
    .generateParams("slug", "locale")
    .map(({ slug, locale }) => ({ slug, locale }));
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = source.getPage(slug, locale);
  if (!page) return {};

  const description = (page.data as { description?: string }).description;

  // Sans ce bloc, la documentation heritait des metadonnees du layout de
  // locale : les vingt-quatre pages declaraient toutes
  // `<link rel="canonical" href="https://klassci.com/fr">`, c'est-a-dire
  // qu'elles se presentaient a Google comme des doublons de la page
  // d'accueil. Le titre etait bien le leur, mais l'adresse canonique, l'og:url
  // et l'og:title etaient ceux de l'accueil. Autant de contenu ecrit pour
  // rien.
  const chemin = (slug ?? []).join("/");
  const suffixe = chemin ? `/${chemin}` : "";
  const cheminSansLangue = `/docs${suffixe}`;

  return {
    title: page.data.title,
    description,
    alternates: {
      canonical: `/${locale}${cheminSansLangue}`,
      languages: {
        fr: `/fr${cheminSansLangue}`,
        en: `/en${cheminSansLangue}`,
        "x-default": `/fr${cheminSansLangue}`,
      },
    },
    openGraph: {
      type: "article",
      siteName: "KLASSCI",
      title: page.data.title,
      description,
      url: `${SITE_URL}/${locale}${cheminSansLangue}`,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: `${SITE_URL}/img/og/default.png`,
          width: 1200,
          height: 630,
          alt: page.data.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description,
      images: [`${SITE_URL}/img/og/default.png`],
    },
  };
}

export default async function DocPage({ params }: PageParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // getPage returns the locale-specific file when present, falling back to
  // the default-language file otherwise. So an untranslated EN page silently
  // serves the FR content rather than 404'ing.
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  // Fumadocs v11 runtime exposes the MDX module's React component on `body`
  // (not `default`), with frontmatter (title, description) spread on top.
  // TypeScript's loader type doesn't expose `body` — manual cast below.
  type MDXPageData = {
    title: string;
    description?: string;
    full?: boolean;
    toc?: import("fumadocs-core/server").TableOfContents;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: React.ComponentType<{ components?: any }>;
  };
  const data = page.data as unknown as MDXPageData;
  const MDX = data.body;

  const safeLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const segments = slug ?? [];
  const cheminDoc = `/docs${segments.length ? `/${segments.join("/")}` : ""}`;

  // Le fil d'Ariane reprend ce que Fumadocs affiche deja dans la barre
  // laterale : la documentation, la rubrique, puis la page. C'est le seul
  // resultat enrichi encore facilement atteignable, et vingt-quatre pages
  // s'en passaient.
  const filAriane = [
    { nom: "Documentation", chemin: "/docs" },
    ...(segments.length > 1
      ? [{ nom: segments[0], chemin: `/docs/${segments[0]}` }]
      : []),
    { nom: data.title },
  ];

  const graphe = await buildDocGraph(
    safeLocale,
    {
      chemin: cheminDoc,
      titre: data.title,
      description: data.description,
      rubrique: segments.length > 1 ? segments[0] : undefined,
    },
    filAriane,
  );

  return (
    <DocsPage toc={data.toc} full={data.full}>
      <JsonLd graph={graphe} />
      <DocsTitle>{data.title}</DocsTitle>
      {data.description ? (
        <DocsDescription>{data.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
