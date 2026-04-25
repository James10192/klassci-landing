import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Path is fixed: Fumadocs RootProvider's SearchDialog hits /api/search by
// default. Requires page.data.structuredData (wired via remarkStructure in
// source.config.ts).
//
// With i18n on the source loader, `createFromSource` discovers locales via
// `source._i18n` and dispatches each page to its own Orama instance. We map
// our two locales to bundled Orama tokenizers (both `french` and `english`
// stemmers ship with @orama/orama out of the box).
export const { GET } = createFromSource(source, undefined, {
  localeMap: {
    fr: { language: "french" },
    en: { language: "english" },
  },
});
