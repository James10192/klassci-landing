import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { remarkStructure } from "fumadocs-core/mdx-plugins";

// Declare the docs source. Fumadocs reads MDX from content/docs and the
// optional meta.json sidebar config. Auto-generates `.source/index.ts` at
// dev/build time — added to .gitignore.
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // remarkStructure attaches StructuredData (headings + paragraphs) to each
    // page so the /api/search route can index full text content, not just
    // titles. Without this plugin, AdvancedIndex.structuredData is undefined
    // and the search dialog returns nothing.
    remarkPlugins: [remarkStructure],
  },
});
