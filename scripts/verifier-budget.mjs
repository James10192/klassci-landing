#!/usr/bin/env node
/**
 * Le budget de performance, tenu par la construction.
 *
 * Le poids d'une page ne se degrade jamais d'un coup : il monte d'une
 * dependance ici, d'une police la, et personne ne remarque le moment ou la
 * page cesse d'etre utilisable sur une 4G instable. Ce script transforme le
 * budget en condition de livraison.
 *
 * Les seuils viennent de `docs/seo/regles.md`. Ils sont calibres pour un
 * visiteur d'Afrique de l'Ouest sur telephone d'entree de gamme, ou chaque
 * kilo-octet se paie deux fois : en secondes et en forfait.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BUDGET = {
  /** Fichiers de police prechargés sur une page, et leur poids cumule. */
  polices: { fichiers: 6, kilooctets: 115 },
  /** Balises `img` brutes hors documentation. Elles contournent l'optimiseur. */
  imagesBrutes: 0,
};

const anomalies = [];
const mesures = [];

/* ------------------------------------------------ balises img contournantes */

async function fichiersSources(dossier) {
  const sortie = [];
  const parcourir = async (courant) => {
    for (const entree of await readdir(courant, { withFileTypes: true })) {
      if (entree.name === "node_modules" || entree.name.startsWith(".")) continue;
      const chemin = join(courant, entree.name);
      if (entree.isDirectory()) await parcourir(chemin);
      else if (/\.tsx$/.test(entree.name)) sortie.push(chemin);
    }
  };
  if (existsSync(dossier)) await parcourir(dossier);
  return sortie;
}

async function controlerImages() {
  const fichiers = [
    ...(await fichiersSources("components")),
    ...(await fichiersSources("app")),
  ].filter((f) => !f.includes("components/docs/"));

  let trouvees = 0;
  for (const fichier of fichiers) {
    const source = await readFile(fichier, "utf8");
    for (const balise of source.match(/<img\s/g) ?? []) {
      void balise;
      trouvees += 1;
      anomalies.push(
        `${fichier} : balise <img> brute. Elle contourne l'optimiseur — dix d'entre elles pesaient huit megaoctets sur trois pages.`,
      );
    }
  }
  mesures.push(`balises <img> brutes : ${trouvees} (budget ${BUDGET.imagesBrutes})`);
}

/* ---------------------------------------------------------------- polices */

async function controlerPolices() {
  const page = ".next/server/app/fr.html";
  if (!existsSync(page)) {
    console.error(`  ${page} est absent. Lancez \`pnpm build\` d'abord.`);
    process.exit(2);
  }

  const html = await readFile(page, "utf8");
  const polices = [
    ...new Set(
      [...html.matchAll(/\/_next\/(static\/media\/[^"']+?\.woff2)/g)].map((m) => m[1]),
    ),
  ];

  let total = 0;
  for (const police of polices) {
    total += (await stat(join(".next", police))).size;
  }
  const kilooctets = total / 1024;

  mesures.push(
    `polices prechargees : ${polices.length} fichiers, ${kilooctets.toFixed(1)} ko ` +
      `(budget ${BUDGET.polices.fichiers} fichiers, ${BUDGET.polices.kilooctets} ko)`,
  );

  if (polices.length > BUDGET.polices.fichiers) {
    anomalies.push(
      `${polices.length} fichiers de police prechargés sur /fr, budget ${BUDGET.polices.fichiers}.`,
    );
  }
  if (kilooctets > BUDGET.polices.kilooctets) {
    anomalies.push(
      `${kilooctets.toFixed(1)} ko de polices prechargées sur /fr, budget ${BUDGET.polices.kilooctets} ko. ` +
        `Le sous-ensemble latin-ext ne sert ni au francais ni a l'anglais.`,
    );
  }
}

/* -------------------------------------------------- revalidation de l'accueil */

async function controlerRendu() {
  const manifeste = ".next/prerender-manifest.json";
  if (!existsSync(manifeste)) return;

  const donnees = JSON.parse(await readFile(manifeste, "utf8"));
  const accueil = donnees.routes?.["/fr"];

  if (!accueil) {
    anomalies.push(
      "/fr n'est pas preproduite. Une page d'accueil rendue a la demande depuis l'Afrique, c'est un aller-retour complet a chaque visite.",
    );
    return;
  }

  const revalidation = accueil.initialRevalidateSeconds;
  mesures.push(`revalidation de /fr : ${revalidation === false ? "aucune" : `${revalidation} s`}`);

  if (revalidation === false) {
    // Le mur de logos interroge les instances des ecoles. Si les variables
    // d'environnement manquent a la construction, aucun appel n'est emis, la
    // revalidation retombe a `false` — et les logos restent figes jusqu'au
    // prochain deploiement, sans le moindre avertissement.
    console.log(
      "  Note : /fr est figee jusqu'au prochain deploiement. Les variables des instances etaient-elles presentes a la construction ?",
    );
  }
}

/* ------------------------------------------------------------------ sortie */

console.log("\n  Budget de performance\n  " + "-".repeat(40));

await controlerImages();
await controlerPolices();
await controlerRendu();

for (const mesure of mesures) console.log(`    ${mesure}`);

if (anomalies.length > 0) {
  console.log(`\n  ${anomalies.length} depassement(s) :`);
  for (const anomalie of anomalies) console.log(`    X  ${anomalie}`);
  console.log("");
  process.exit(1);
}

console.log("\n  Budget tenu.\n");
