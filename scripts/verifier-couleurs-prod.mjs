#!/usr/bin/env node
/**
 * Relève, sur le site déployé, la couleur du bandeau et l'accent de la page,
 * école par école.
 *
 *   node --experimental-strip-types scripts/verifier-couleurs-prod.mjs
 *   node --experimental-strip-types scripts/verifier-couleurs-prod.mjs --url https://…
 *
 * `verifier-identite-ecoles.mjs` éprouve la règle ; celui-ci éprouve ce que la
 * règle produit sur les données réelles des écoles. Ce n'est pas la même chose,
 * et l'écart est précisément d'où venait le défaut : une école avait réglé son
 * bandeau en blanc dans ses paramètres PDF, et ce réglage arrivait sur la page
 * web. Aucun contrôle sur le dépôt ne peut voir ce qu'une école règle chez
 * elle.
 *
 * Hors du portail de qualité, donc : il interroge un site en ligne, et une
 * école injoignable ferait échouer une construction pour une raison qui ne
 * tient pas au code.
 *
 * La règle vérifiée est conditionnelle :
 *
 *   - bandeau visible sur le fond de page → on honore ce que l'école a réglé,
 *     et il peut légitimement différer de l'accent : ce sont deux réglages
 *     distincts, que ses documents imprimés portent aussi.
 *   - bandeau invisible (le blanc, valeur par défaut des PDF) → on substitue,
 *     et le fond DOIT alors être l'accent de la page.
 *
 * Dans les deux cas, le texte doit se lire sur le fond à 4,5:1.
 */
const { rapportContraste, tropClairePourUnFond } = await import("../lib/vitrine/couleurs.ts");

const drapeau = process.argv.indexOf("--url");
const SITE = drapeau === -1 ? "https://www.klassci.com" : process.argv[drapeau + 1];

const ECOLES = ["esbtp-abidjan", "esbtp-yakro", "rostan", "usat", "ephrata", "presentation"];
const lignes = [];

for (const code of ECOLES) {
  const url = `${SITE}/fr/inscription/universite/${code}`;
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 verif-couleurs" } });
  const html = await r.text();

  const accent = html.match(/--accent:\s*(#[0-9a-fA-F]{3,6})/)?.[1] ?? "?";
  const b = html.match(/background-color:\s*(#[0-9a-fA-F]{3,6});\s*color:\s*(#[0-9a-fA-F]{3,6})/);
  const fond = b?.[1] ?? "?";
  const encre = b?.[2] ?? "?";

  // Le bandeau servi est-il le fruit d'une substitution ? Il l'est si et
  // seulement s'il vaut l'accent : c'est ce que la règle produit.
  const substitue = fond.toLowerCase() === accent.toLowerCase();
  const lisible = (rapportContraste(fond, encre) ?? 0) >= 4.5;

  // Un bandeau qui n'a PAS été substitué doit être visible : sinon la règle
  // aurait dû le remplacer, et ne l'a pas fait.
  const visible = !tropClairePourUnFond(fond);
  const verdict = !lisible
    ? "texte illisible"
    : !substitue && !visible
      ? "bandeau invisible non substitué"
      : "ok";

  lignes.push({ code, statut: r.status, accent, fond, encre,
    ratio: (rapportContraste(fond, encre) ?? 0).toFixed(1),
    origine: substitue ? "accent page" : "réglée par l'école", verdict });
}

console.log("");
console.log("  école            accent page  bandeau   encre     contraste  origine du bandeau    verdict");
console.log("  " + "-".repeat(94));
for (const l of lignes) {
  console.log(
    `  ${l.code.padEnd(16)} ${l.accent.padEnd(12)} ${l.fond.padEnd(9)} ${l.encre.padEnd(9)} ${(l.ratio + ":1").padEnd(10)} ${l.origine.padEnd(20)} ${l.verdict}`,
  );
}
const faux = lignes.filter((l) => l.verdict !== "ok");
console.log("");
console.log(
  faux.length === 0
    ? "  Chaque école porte un bandeau visible et lisible, et aucune n'en porte deux."
    : `  ${faux.length} école(s) en défaut.`,
);
console.log("");

process.exit(faux.length === 0 ? 0 : 1);
