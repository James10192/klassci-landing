import { loader } from "fumadocs-core/source";
import { blog, docs } from "@/.source";
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

// Le blog. Volontairement sans i18n : le corpus est francais, et il le reste
// tant qu'il n'est pas traduit par quelqu'un qui connait le sujet. Brancher
// l'i18n ici ferait servir les memes articles sous `/en/blog/...` par repli —
// c'est-a-dire du contenu duplique entre deux langues, exactement ce que les
// balises hreflang sont censees empecher. Un article reglementaire ivoirien
// mal traduit dessert l'autorite qu'il est cense construire.
export const sourceBlog = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource(),
});

/** La langue dans laquelle le blog est publie. */
export const LANGUE_BLOG = "fr" as const;
