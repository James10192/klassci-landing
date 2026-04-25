import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { remarkStructure } from "fumadocs-core/mdx-plugins";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // Required by /api/search/route.ts — without StructuredData on page.data,
    // createFromSource has nothing to index and the search dialog returns nothing.
    remarkPlugins: [remarkStructure],
  },
});
