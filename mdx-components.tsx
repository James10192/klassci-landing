import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

// Global MDX component map. Adds defaults from fumadocs-ui (Callout, Card,
// Tabs, etc.) on top of any per-page overrides. Imported by the docs page so
// MDX files can use components without per-file imports.
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
  };
}
