import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { source } from "@/lib/source";
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

  return {
    title: page.data.title,
    description: (page.data as { description?: string }).description,
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

  return (
    <DocsPage toc={data.toc} full={data.full}>
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
