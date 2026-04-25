import { defineConfig, defineDocs } from "fumadocs-mdx/config";

// Declare the docs source. Fumadocs reads MDX from content/docs and the
// optional meta.json sidebar config. Auto-generates `.source/index.ts` at
// dev/build time — added to .gitignore.
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // No remark/rehype plugins for now — keeping the pipeline minimal.
  },
});
