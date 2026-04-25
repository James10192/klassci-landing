import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Search API consumed by Fumadocs RootProvider's SearchDialog (Cmd+K).
// The client fetches /api/search?query=... by default — no extra wiring on
// the React side. createFromSource walks the loader's pages and indexes each
// one's structuredData (populated by remarkStructure in source.config.ts).
export const { GET } = createFromSource(source);
