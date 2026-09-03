#!/usr/bin/env node
/**
 * Vérifie la navigation en la manipulant, dans un vrai navigateur.
 *
 *   pnpm build && pnpm start -p 3100 &
 *   node scripts/verifier-navigation.mjs [--url http://127.0.0.1:3100]
 *
 * Écrit après avoir découvert que les quatre pages institutionnelles n'avaient
 * AUCUNE barre de navigation : on arrivait sur `/fr/securite` — souvent depuis
 * une recherche, ou par un lien envoyé à un prestataire informatique — et le
 * seul chemin de retour était un fil d'Ariane en petites capitales. Rien ne
 * l'avait signalé, parce que rien ne le regardait : la page se construisait, se
 * rendait, passait les contrôles de métadonnées et de données structurées.
 *
 * Ce que ce script vérifie ne se voit qu'en cliquant : qu'un panneau se ferme
 * à Escape en rendant le focus, qu'un clic ailleurs le referme, qu'un lien
 * suivi ne laisse pas un menu ouvert par-dessus la page suivante, et que le
 * défilement de la page est rendu quand le menu plein écran se referme.
 *
 * Hors du portail de qualité : il lui faut un serveur qui tourne.
 */

// Import paresseux : `playwright-core` n'est pas une dépendance du site — le
// portail de qualité n'en a pas besoin, et l'imposer à quiconque installe le
// dépôt pour corriger une faute de frappe serait disproportionné. Absent, on le
// dit en une phrase utile plutôt qu'en trace d'appels.
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
const drapeau = process.argv.indexOf('--url');
const SITE = drapeau === -1 ? 'http://127.0.0.1:3100' : process.argv[drapeau + 1];

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

// Un serveur doit répondre : sinon les seize contrôles échouent tous pour la
// même raison, et le rapport ne dit pas laquelle.
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
let echecs = 0;
const verifier = (nom, ok) => { console.log(`  ${ok ? 'ok  ' : 'X   '} ${nom}`); if (!ok) echecs++; };

// ── Bureau : le panneau ──
let page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${SITE}/fr/securite`, { waitUntil: 'networkidle' });
const bouton = page.locator('nav button[data-menu-groupe]').first();

verifier('le panneau est ferme au chargement', await page.locator('nav [data-menu-groupe] + div').count() === 0);
await bouton.click(); await page.waitForTimeout(300);
verifier('un clic ouvre le panneau', await page.locator('nav a[href$="/mentions-legales"]').first().isVisible());
verifier('aria-expanded suit', await bouton.getAttribute('aria-expanded') === 'true');

await page.keyboard.press('Escape'); await page.waitForTimeout(300);
verifier('Escape referme', await bouton.getAttribute('aria-expanded') === 'false');
verifier('Escape rend le focus au bouton', await bouton.evaluate(b => b === document.activeElement));

await bouton.click(); await page.waitForTimeout(300);
await page.mouse.click(700, 600); await page.waitForTimeout(300);
verifier('un clic ailleurs referme', await bouton.getAttribute('aria-expanded') === 'false');

await bouton.click(); await page.waitForTimeout(300);
await page.locator('nav a[href$="/confidentialite"]').first().click();
await page.waitForTimeout(1200);
verifier('un lien du panneau navigue', page.url().includes('/confidentialite'));
verifier('la barre est encore la sur la page suivante', await page.locator('nav[aria-label="Principale"]').count() === 1);
verifier('le panneau ne reste pas ouvert', await page.locator('nav button[data-menu-groupe]').first().getAttribute('aria-expanded') === 'false');
await page.close();

// ── Mobile : le hamburger ──
page = await nav.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(`${SITE}/fr/securite`, { waitUntil: 'networkidle' });
const burger = page.locator('nav button[aria-expanded]:not([data-menu-groupe])').first();

await burger.click(); await page.waitForTimeout(500);
verifier('le menu plein ecran s ouvre', await page.locator('[role="dialog"]').isVisible());
verifier('le groupe est a plat, pas replie', await page.locator('[role="dialog"] a[href$="/mentions-legales"]').isVisible());
verifier('la page ne defile plus derriere', await page.evaluate(() => document.body.style.overflow) === 'hidden');
verifier('les 4 pages du groupe sont la', (await page.locator('[role="dialog"] a').allInnerTexts()).filter(t => /propos|Sécurité|Confidentialité|Mentions/.test(t)).length === 4);

await page.locator('[role="dialog"] a[href$="/a-propos"]').first().click();
await page.waitForTimeout(1200);
verifier('un lien du menu navigue', page.url().includes('/a-propos'));
verifier('le menu se referme', await page.locator('[role="dialog"]').count() === 0);
verifier('le defilement est rendu', await page.evaluate(() => document.body.style.overflow) !== 'hidden');
await page.close();

await nav.close();
console.log(
  echecs === 0
    ? '\n  La navigation se comporte comme prevu.'
    : `\n  ${echecs} comportement(s) en defaut.`,
);
process.exit(echecs ? 1 : 0);
