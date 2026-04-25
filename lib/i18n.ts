import type { I18nConfig } from "fumadocs-core/i18n";

// Single source of truth for Fumadocs i18n. Mirrors next-intl routing
// (FR default, no prefix; EN at /en/...). Fed into the source loader,
// the search API and the docs UI provider.
export const i18n: I18nConfig = {
  defaultLanguage: "fr",
  languages: ["fr", "en"],
  // FR is the default and stays unprefixed (`/docs/...`).
  // EN gets a prefix (`/en/docs/...`), matching next-intl `as-needed` policy.
  hideLocale: "default-locale",
};
