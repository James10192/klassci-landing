import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";
import { i18n } from "@/lib/i18n";

// Fumadocs source loader — exposes getPage / getPages / pageTree.
// baseUrl matches our Next.js route prefix (/docs). v11 generated `docs` is a
// DocsCollection that exposes toFumadocsSource() — feed it directly.
//
// With `i18n` configured, fumadocs-mdx auto-detects translated files via the
// `<name>.<locale>.mdx` suffix (dot parser, the v14 default). Untranslated
// pages fall back to the default-language file automatically.
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n,
});
