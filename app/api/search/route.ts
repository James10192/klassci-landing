import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import type { StructuredData } from "fumadocs-core/mdx-plugins";

// Path is fixed: Fumadocs RootProvider's SearchDialog hits /api/search by
// default. Requires page.data.structuredData (wired via remarkStructure in
// source.config.ts).
//
// pageToIndexFn drops paragraph fragments shorter than 12 chars before
// indexing — `remarkStructure` turns each table cell into its own content
// node, so cells like "1ère année" / "L1" / "BTS" leak into the spotlight
// as standalone results when a user searches "anne". Filtering them at
// index time keeps the SearchDialog focused on real prose.
//
// Headings stay untouched (different array on StructuredData), so section
// titles still surface even when short.
const MIN_CONTENT_LENGTH = 12;

interface IndexablePage {
  title: string;
  description?: string;
  keywords?: string;
  structuredData: StructuredData;
}

export const { GET } = createFromSource(
  source,
  (page) => {
    const data = page.data as unknown as IndexablePage;
    return {
      id: page.url,
      url: page.url,
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      structuredData: {
        headings: data.structuredData.headings,
        contents: data.structuredData.contents.filter(
          (content) => content.content.trim().length >= MIN_CONTENT_LENGTH,
        ),
      },
    };
  },
  {
    localeMap: {
      fr: { language: "french" },
      en: { language: "english" },
    },
  },
);
