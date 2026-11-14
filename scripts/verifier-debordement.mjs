#!/usr/bin/env node
/**
 * Aucune page ne doit défiler en largeur sur un téléphone.
 *
 *   pnpm build && pnpm start -p 3100 &
 *   node scripts/verifier-debordement.mjs [--url http://127.0.0.1:3100] [--ecole esbtp-yakro]
 *
 * Écrit après des retours de familles : sur certains téléphones, la page
 * glissait de côté. Une page qui déborde d'un seul pixel se décale sous le
 * pouce à chaque défilement, et une famille qui remplit un formulaire depuis
 * un téléphone d'entrée de gamme le vit à chaque champ. Rien ne le signalait :
 * la page se construit, se rend, passe ses contrôles — à 1 440 pixels.
 *
 * Pour chaque page et chaque largeur (320, 360, 375, 414), on compare la
 * largeur du document à celle de la fenêtre, et on nomme les éléments qui
 * dépassent du bord droit : c'est par eux qu'on corrige.
 *
 * `--ecole` ajoute le portail de cette école (il faut qu'elle soit servie par
 * le site qui tourne). Hors du portail de qualité : il faut un serveur.
 */

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error(
      "\n  playwright-core est absent. Ce contrôle pilote un vrai navigateur :\n" +
        "    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm add -D playwright-core\n",
    );
    process.exit(2);
  }
}

const option = (nom, defaut) => {
  const rang = process.argv.indexOf(nom);
  return rang === -1 ? defaut : process.argv[rang + 1];
};
const SITE = option('--url', 'http://127.0.0.1:3100');
const ECOLE = option('--ecole', null);

const LARGEURS = [320, 360, 375, 414];
const PAGES = [
  '/fr',
  '/fr/universite',
  '/fr/college',
  '/fr/inscription',
  '/fr/inscription/universite',
  '/fr/reinscription',
  '/fr/docs/changelog',
  '/fr/a-propos',
  '/fr/securite',
  '/en',
  ...(ECOLE ? [`/fr/inscription/universite/${ECOLE}`, `/fr/inscription/universite/${ECOLE}/rendez-vous`] : []),
];

let nav;
try {
  nav = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? undefined, args: ['--no-sandbox'] });
} catch (erreur) {
  console.error(`\n  Chromium introuvable. Posez CHROMIUM_PATH sur le binaire.\n  (${erreur.message.split('\n')[0]})\n`);
  process.exit(2);
}

try {
  const sonde = await fetch(`${SITE}/fr`, { redirect: 'manual' });
  if (sonde.status >= 500) throw new Error(`statut ${sonde.status}`);
} catch (erreur) {
  console.error(`\n  Rien ne répond sur ${SITE}. Lancez le site :\n    pnpm build && pnpm start -p 3100\n  (${erreur.message})\n`);
  await nav.close();
  process.exit(2);
}

/** Exécuté dans la page : la largeur du document, et ce qui dépasse à droite. */
function mesurer() {
  const largeur = document.documentElement.clientWidth;
  const coupables = [];

  for (const el of document.body.querySelectorAll('*')) {
    const boite = el.getBoundingClientRect();
    if (boite.width === 0 || boite.right <= largeur + 1) continue;

    // Un élément dans un conteneur qui défile ou coupe ne fait pas déborder la page.
    let parent = el.parentElement;
    let contenu = false;
    while (parent && parent !== document.body) {
      const style = getComputedStyle(parent);
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { contenu = true; break; }
      parent = parent.parentElement;
    }
    if (contenu || getComputedStyle(el).position === 'fixed') continue;

    const classe = typeof el.className === 'string' ? el.className.split(' ').slice(0, 4).join('.') : '';
    coupables.push(`${el.tagName.toLowerCase()}${classe ? '.' + classe : ''} (droite ${Math.round(boite.right)} px)`);
    if (coupables.length >= 5) break;
  }

  return { document: document.documentElement.scrollWidth, fenetre: largeur, coupables };
}

let echecs = 0;

for (const largeur of LARGEURS) {
  const contexte = await nav.newContext({ viewport: { width: largeur, height: 780 }, isMobile: true, hasTouch: true });
  const page = await contexte.newPage();
  console.log(`\n${largeur} px`);

  for (const chemin of PAGES) {
    const reponse = await page.goto(`${SITE}${chemin}`, { waitUntil: 'networkidle' }).catch(() => null);
    if (reponse === null || reponse.status() >= 400) {
      console.log(`  --   ${chemin} (statut ${reponse?.status() ?? 'injoignable'}, ignorée)`);
      continue;
    }

    const { document: doc, fenetre, coupables } = await page.evaluate(mesurer);
    const ok = doc <= fenetre;
    if (!ok) echecs++;
    console.log(`  ${ok ? 'ok  ' : 'X   '} ${chemin}${ok ? '' : ` — ${doc} px pour ${fenetre} : ${coupables.join(', ') || 'source introuvable'}`}`);
  }

  await contexte.close();
}

await nav.close();

console.log(echecs === 0 ? '\nAucun débordement horizontal.' : `\n${echecs} page(s) débordent.`);
process.exit(echecs === 0 ? 0 : 1);
