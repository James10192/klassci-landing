import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Path is fixed: Fumadocs RootProvider's SearchDialog hits /api/search by default.
// Requires page.data.structuredData (wired via remarkStructure in source.config.ts).
export const { GET } = createFromSource(source);
