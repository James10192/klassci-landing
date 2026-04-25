import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { remarkHeading, remarkStructure } from "fumadocs-core/mdx-plugins";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // Order matters: remarkHeading runs first to assign data.hProperties.id
    // on every heading node (so the rendered HTML gets <h2 id="...">), then
    // remarkStructure walks the same AST and references those ids when it
    // builds the page-level structured data consumed by /api/search.
    //
    // Passing a plain array here REPLACES Fumadocs' default plugin list,
    // which silently drops remarkHeading. Without it the search dialog
    // navigates to /docs/foo#some-id but no heading has that id in the DOM
    // — so the browser (and our HashScroll watcher) cannot scroll to it.
    remarkPlugins: [remarkHeading, remarkStructure],
  },
});
