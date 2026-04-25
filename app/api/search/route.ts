import { source } from "@/lib/source";
import { createI18nSearchAPI } from "fumadocs-core/search/server";
import type { StructuredData } from "fumadocs-core/mdx-plugins";

import { i18n } from "@/lib/i18n";

// Why createI18nSearchAPI instead of createFromSource:
// In fumadocs-core v14, createFromSource(source, fn, { localeMap }) does
// NOT actually segregate indexes per locale on the search server — every
// page from every language ends up in the same Orama instance, so a search
// from /en/ returns FR titles and vice versa. createI18nSearchAPI is the
// explicit i18n entry point: we feed it WithLocale<AdvancedIndex>[] (one
// index per page, tagged with its locale) and it routes /api/search?locale=
// requests to the correct per-locale Orama instance.
//
// Filter rules (same as before):
// - drop content shorter than MIN_CONTENT_LENGTH (single words / labels)
// - keep content longer than MIN_PROSE_LENGTH (real prose)
// - in between, require terminal punctuation so table cells don't leak
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

const indexes = i18n.languages.flatMap((locale) =>
  source.getPages(locale).map((page) => {
    const data = page.data as unknown as IndexablePage;
    return {
      locale,
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
  }),
);

export const { GET } = createI18nSearchAPI("advanced", {
  i18n,
  indexes,
  localeMap: {
    fr: { language: "french" },
    en: { language: "english" },
  },
});
