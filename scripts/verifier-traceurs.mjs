#!/usr/bin/env node
/**
 * Aucun traceur ne doit écrire chez le visiteur sans son accord.
 *
 * Écrit après avoir mesuré ce que la mesure d'audience déposait réellement.
 * PostHog tournait avec sa configuration par défaut, et cette configuration
 * écrit un cookie `ph_<clé>_posthog` contenant un `$device_id` — un identifiant
 * de terminal, valable un an. Le seul garde-fou était le signal « Do Not
 * Track », c'est-à-dire un opt-out que presque personne n'active, là où la loi
 * ivoirienne 2013-450 comme le RGPD exigent un accord PRÉALABLE.
 *
 * Le correctif tient en une ligne : `cookieless_mode: "always"`. C'est
 * précisément ce qui rend une ligne facile à supprimer par inadvertance —
 * personne ne se souviendra, dans six mois, qu'elle est ce qui dispense le
 * site d'un bandeau de consentement.
 *
 * Ce contrôle lit la configuration réellement livrée, pas la documentation.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = process.cwd();
const FICHIER = join(RACINE, "components/analytics/posthog-provider.tsx");

const source = readFileSync(FICHIER, "utf8");

/** Ce qui compte : l'appel d'initialisation, pas les commentaires autour. */
const init = source.slice(source.indexOf("posthog.init("));

const ennuis = [];

if (!/cookieless_mode:\s*"always"/.test(init)) {
  ennuis.push(
    "`cookieless_mode: \"always\"` a disparu de l'initialisation de PostHog.\n" +
      "    Sans lui, la bibliothèque dépose un cookie `ph_<clé>_posthog` qui porte\n" +
      "    un identifiant de terminal — un traceur non nécessaire, donc soumis à\n" +
      "    accord préalable. Soit vous remettez cette ligne, soit le site doit\n" +
      "    afficher un bandeau de consentement ET la page Confidentialité doit\n" +
      "    cesser d'affirmer qu'aucun cookie de mesure n'est déposé.",
  );
}

for (const interdit of ["identify(", "alias("]) {
  if (source.includes(`posthog.${interdit}`)) {
    ennuis.push(
      `\`posthog.${interdit}\` rattacherait un événement à une personne nommée.\n` +
        "    C'est exactement ce que le mode sans cookie vise à éviter.",
    );
  }
}

/** La page publique affirme qu'il n'y a pas de bandeau : elle doit dire vrai. */
for (const page of [
  "content/institutionnel/confidentialite.mdx",
  "content/institutionnel/confidentialite.en.mdx",
]) {
  const texte = readFileSync(join(RACINE, page), "utf8");
  if (!/sans cookie|cookieless/i.test(texte)) {
    ennuis.push(
      `${page} ne mentionne plus le mode sans cookie.\n` +
        "    La page et le code doivent dire la même chose.",
    );
  }
}

console.log("\n  Traceurs déposés chez le visiteur");
console.log("  ----------------------------------------");

if (ennuis.length === 0) {
  console.log("  PostHog est en mode sans cookie, et les pages le disent.\n");
  process.exit(0);
}

for (const e of ennuis) console.log(`\n  X  ${e}`);
console.log(`\n  ${ennuis.length} problème(s).\n`);
process.exit(1);
