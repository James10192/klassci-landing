import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "always",

  // next-intl pose par defaut un en-tete HTTP `Link` decrivant les versions de
  // langue. Il double nos balises `link rel=alternate` — mais il ne dit pas la
  // meme chose : son x-default vise `/universite`, sans prefixe, qui repond
  // 307, quand le HTML vise `/fr/universite`, qui repond 200. Deux annotations
  // contradictoires pour une meme adresse, dont l'une pointe vers une
  // redirection : un moteur ecarte alors la grappe hreflang entiere. Une seule
  // source fait foi, et c'est le HTML, ou nous controlons chaque chemin.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
