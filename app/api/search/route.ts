import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import type { StructuredData } from "fumadocs-core/mdx-plugins";

// Path is fixed: Fumadocs RootProvider's SearchDialog hits /api/search by
// default. Requires page.data.structuredData (wired via remarkStructure in
// source.config.ts).
//
// pageToIndexFn drops paragraph fragments that don't look like real prose
// before indexing. remarkStructure splits Markdown tables into one content
// node per cell — short labels like "BTS Première Année" (a table cell)
// would otherwise flood the spotlight with seven near-identical entries on
// a search like "anne". We keep:
//   - any content over MIN_PROSE_LENGTH (long enough to be real text)
//   - shorter content only if it ends with terminal punctuation (.!?:)
// Headings stay untouched on a separate array, so section titles are
// always indexed regardless of length.
const MIN_CONTENT_LENGTH = 12;
const MIN_PROSE_LENGTH = 50;
const TERMINAL_PUNCTUATION = /[.!?:]\s*$/;

function isMeaningfulProse(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_CONTENT_LENGTH) return false;
  if (trimmed.length >= MIN_PROSE_LENGTH) return true;
  return TERMINAL_PUNCTUATION.test(trimmed);
}

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
        contents: data.structuredData.contents.filter((content) =>
          isMeaningfulProse(content.content),
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
