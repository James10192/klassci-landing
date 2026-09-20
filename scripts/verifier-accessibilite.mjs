#!/usr/bin/env node
/**
 * Mesure l'accessibilité des pages, dans un vrai navigateur.
 *
 *   pnpm build && pnpm start -p 3100 &
 *   node scripts/verifier-accessibilite.mjs [--url http://127.0.0.1:3100]
 *
 * Écrit parce que l'accessibilité de ce site était tenue pour acquise sans
 * jamais avoir été mesurée. Le budget de performance interdit les `<img>`
 * bruts, toutes les images portent un `alt`, et le contraste des couleurs
 * d'école est calculé et refusé quand il est insuffisant — mais rien ne
 * regardait le reste : l'ordre des titres, les libellés de formulaire, le
 * contraste du texte contre son fond, les repères de région.
 *
 * Tenir une chose pour acquise et la mesurer sont deux états différents. La
 * page d'inscription est remplie par des familles, parfois sur un téléphone
 * d'entrée de gamme, parfois par quelqu'un qui ne voit pas bien l'écran.
 *
 * Ce contrôle n'invente pas ses règles : il exécute `axe-core`, la même
 * bibliothèque que les outils du domaine, sur les critères WCAG 2.1 niveaux A
 * et AA. Seules les infractions RÉELLES font échouer — `axe` distingue ce
 * qu'il a constaté de ce qu'il faudrait vérifier à la main, et confondre les
 * deux ferait crier le contrôle pour rien, donc finirait par le faire
 * désactiver.
 *
 * Hors du portail de qualité : il lui faut un serveur qui tourne.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error(
    "\n  playwright-core est absent. Ce contrôle pilote un vrai navigateur :\n" +
      "    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm add -D playwright-core\n",
  );
  process.exit(2);
}

let cheminAxe;
try {
  cheminAxe = require.resolve('axe-core/axe.min.js');
} catch {
  console.error("\n  axe-core est absent :  pnpm add -D axe-core\n");
  process.exit(2);
}

const drapeau = process.argv.indexOf('--url');
const SITE = drapeau === -1 ? 'http://127.0.0.1:3100' : process.argv[drapeau + 1];

/**
 * Les pages contrôlées, choisies par ce qu'elles engagent.
 *
 * La liste d'inscription et la page d'une école portent le formulaire que
 * remplissent les familles : c'est là qu'une étiquette manquante coûte le plus
 * cher. Les pages institutionnelles sont celles qu'on ouvre pour y chercher un
 * droit — souvent sans être l'utilisateur habituel du site.
 */
const PAGES = [
  ['/fr', "l'accueil"],
  ['/fr/inscription/universite', "la liste d'inscription"],
  ['/fr/confidentialite', 'la politique de confidentialité'],
  ['/fr/securite', 'la page Sécurité'],
  ['/en', 'the English home page'],
];

/**
 * Ce que ce contrôle laisse passer, et pourquoi.
 *
 * Une seule entrée, et elle n'est pas silencieuse : elle est réaffichée à
 * chaque exécution. Une exception qu'on oublie est une infraction qu'on a
 * renommée.
 *
 * Le bouton « Voir les univers » porte du blanc sur l'orange de la marque
 * (#f58220) : rapport 2,59 pour 4,5 exigés. Il échoue même le seuil assoupli
 * des grands textes (3:1). Les deux corrections possibles se voient toutes
 * les deux — assombrir l'orange, ou passer le texte en sombre (#1e293b donne
 * 5,64) — et l'orange est celui du logotype officiel. Ce n'est donc pas une
 * décision technique, et elle n'est pas prise ici.
 */
const ATTENTE = [
  {
    regle: 'color-contrast',
    couleurs: '#ffffff sur #f58220',
    quoi: "le bouton « Voir les univers » de l'accueil",
    pourquoi: "l'orange est celui du logotype : la correction se voit, elle appartient à la marque",
  },
];

/** Une infraction est-elle celle qu'on attend, et elle seule ? */
function estAttendue(v) {
  return ATTENTE.some((a) => {
    if (a.regle !== v.id) return false;
    return v.nodes.every((n) => {
      const d = n.any[0]?.data;
      if (!d) return false;
      return `${d.fgColor} sur ${d.bgColor}` === a.couleurs;
    });
  });
}

let nav;
try {
  nav = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? undefined,
    args: ['--no-sandbox'],
  });
} catch (erreur) {
  console.error(
    `\n  Chromium introuvable. Posez CHROMIUM_PATH sur le binaire, ou\n` +
      `  installez-le : pnpm exec playwright install chromium\n  (${erreur.message.split('\n')[0]})\n`,
  );
  process.exit(2);
}

try {
  const sonde = await fetch(`${SITE}/fr`, { redirect: 'manual' });
  if (sonde.status >= 500) throw new Error(`statut ${sonde.status}`);
} catch (erreur) {
  console.error(
    `\n  Rien ne répond sur ${SITE}. Lancez le site :\n` +
      `    pnpm build && pnpm start -p 3100\n  (${erreur.message})\n`,
  );
  await nav.close();
  process.exit(2);
}

console.log('\n  Accessibilité (axe-core, WCAG 2.1 A et AA)');
console.log('  ----------------------------------------');

let total = 0;
const enAttente = new Set();

for (const [chemin, libelle] of PAGES) {
  const page = await nav.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(SITE + chemin, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // Le temps que l'hydratation pose les attributs que React ajoute après coup.
    await page.waitForTimeout(2500);
    await page.addScriptTag({ path: cheminAxe });

    const resultat = await page.evaluate(async () =>
      await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }),
    );

    const attendues = resultat.violations.filter(estAttendue);
    const infractions = resultat.violations.filter((v) => !estAttendue(v));
    total += infractions.length;
    for (const a of attendues) enAttente.add(a.id);

    if (infractions.length === 0) {
      const suffixe = attendues.length === 0 ? '' : `  (${attendues.length} en attente d'arbitrage)`;
      console.log(`  ok    ${libelle}${suffixe}`);
    } else {
      console.log(`\n  X     ${libelle} — ${infractions.length} infraction(s)`);
      for (const v of infractions) {
        console.log(`          [${v.impact}] ${v.id} — ${v.help}`);
        // Un seul exemple par infraction : la liste complète encombre sans
        // rien apprendre de plus, et le sélecteur suffit à retrouver l'élément.
        const cible = v.nodes[0]?.target?.join(' ') ?? '?';
        console.log(`          ${v.nodes.length} élément(s), dont : ${cible}`);
        console.log(`          ${v.helpUrl}`);
      }
      console.log('');
    }
  } catch (erreur) {
    console.log(`  X     ${libelle} — non mesurable : ${erreur.message.split('\n')[0]}`);
    total++;
  } finally {
    await page.close();
  }
}

await nav.close();

/** L'exception se rappelle à chaque exécution, sinon elle devient un acquis. */
function rappelerLAttente() {
  if (enAttente.size === 0) return;
  console.log("\n  En attente d'un arbitrage, donc tolérées :");
  for (const a of ATTENTE) {
    if (!enAttente.has(a.regle)) continue;
    console.log(`    ${a.quoi} — ${a.couleurs}`);
    console.log(`    ${a.pourquoi}`);
  }
}

if (total === 0) {
  console.log('\n  Aucune infraction constatée.');
  rappelerLAttente();
  console.log('');
  process.exit(0);
}

rappelerLAttente();

console.log(`  ${total} infraction(s) au total.`);
console.log("  `axe` ne signale ici que ce qu'il a CONSTATÉ, pas ce qui");
console.log('  demanderait un jugement humain.\n');
process.exit(1);
