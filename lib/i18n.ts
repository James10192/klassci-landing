import type { I18nConfig } from "fumadocs-core/i18n";

// Single source of truth for Fumadocs i18n. Mirrors next-intl routing.
// FR and EN both use an explicit locale prefix for stable alternates.
export const i18n: I18nConfig = {
  defaultLanguage: "fr",
  languages: ["fr", "en"],
};
