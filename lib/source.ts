import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";

// Fumadocs source loader — exposes getPage / getPages / pageTree.
// baseUrl matches our Next.js route prefix (/docs). v11 generated `docs` is a
// DocsCollection that exposes toFumadocsSource() — feed it directly.
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
