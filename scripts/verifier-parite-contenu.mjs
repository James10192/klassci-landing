#!/usr/bin/env node
/**
 * Vérifie qu'une refonte n'a fait disparaître aucun contenu.
 *
 *   # Prendre la photo de référence (une fois, avant la refonte) :
 *   node scripts/verifier-parite-contenu.mjs --photographier --url https://www.klassci.com
 *
 *   # Comparer une version à la référence :
 *   pnpm build && pnpm start -p 3100 &
 *   node scripts/verifier-parite-contenu.mjs --url http://127.0.0.1:3100
 *
 * Écrit pour la refonte d'octobre 2026, dont la règle première est « aucune
 * section existante ne disparaît ». Une règle qu'on ne mesure pas se perd au
 * troisième lot : on raccourcit un paragraphe, on fusionne deux cartes, et un
 * tarif, une question de FAQ ou la mention d'une sauvegarde quotidienne s'en va
 * sans que personne ne l'ait décidé.
 *
 * Deux contrôles, parce qu'aucun ne suffit seul :
 *
 * 1. **Les sources.** Toute clé de `messages/*.json`, tout article et toute page
 *    de documentation présents dans la référence existent encore. C'est le
 *    contrôle qui voit le contenu caché : modales, FAQ repliées, formulaire de
 *    devis, messages d'erreur.
 * 2. **Le rendu.** Chaque bloc de texte affiché par une route de la référence
 *    se retrouve affiché par la même route — ou par celle qu'indique le
 *    mapping. Une clé qui existe encore mais que plus aucun composant n'affiche
 *    est exactement le défaut que ce second contrôle attrape.
 *
 * Une reformulation voulue n'est pas une perte : elle se déclare dans
 * `docs/redesign/mapping.json` (statut IMPROVED, MOVED ou PRESERVED, avec
 * l'ancien texte, le nouveau et sa route). Ce qui n'y figure pas et a disparu
 * est BLOQUANT. Il n'existe pas de statut DELETED.
 *
 * Le métier SEO est contrôlé au passage : titre, canonique, hreflang et types
 * JSON-LD doivent rester présents sur chaque route.
 */

import fs from 'node:fs';
import path from 'node:path';

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('\n  playwright-core est absent :  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm add -D playwright-core\n');
  process.exit(2);
}

const arg = (nom, defaut) => {
  const i = process.argv.indexOf(nom);
  return i === -1 ? defaut : process.argv[i + 1];
};
const SITE = arg('--url', 'http://127.0.0.1:3100').replace(/\/$/, '');
const PHOTO = process.argv.includes('--photographier');
const RACINE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DOSSIER = path.join(RACINE, 'docs/redesign/inventaire');
const REFERENCE = path.join(DOSSIER, 'reference');
const MAPPING = path.join(RACINE, 'docs/redesign/mapping.json');
const NAVIGATEUR = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

/** Les routes de la référence. Lue sur le sitemap, complétée des portails. */
async function routesDuSite() {
  const sitemap = await (await contexte.request.get(`${SITE}/sitemap.xml`)).text();
  const publiques = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  // Les portails sont retirés des moteurs, donc absents du sitemap. Ils font
  // pourtant partie de l'expérience : on les lit sur la liste des écoles.
  const portails = [];
  for (const langue of ['fr', 'en']) {
    const liste = await (await contexte.request.get(`${SITE}/${langue}/inscription/universite`)).text();
    for (const m of liste.matchAll(/href="\/[a-z]{2}\/inscription\/universite\/([a-z0-9-]+)"/g)) {
      const ecole = m[1];
      portails.push(`/${langue}/inscription/universite/${ecole}`,
        `/${langue}/inscription/universite/${ecole}/rendez-vous`, `/${langue}/reinscription/${ecole}`);
    }
    portails.push(`/${langue}/inscription`, `/${langue}/inscription/universite`, `/${langue}/reinscription`,
      `/${langue}/verification-email`, `/${langue}/page-qui-nexiste-pas`);
  }
  return [...new Set([...publiques, ...portails])].sort();
}

/**
 * Ce qu'une route affiche, et ce qu'elle déclare aux moteurs. Une page neuve
 * par route, et jusqu'à trois tentatives : une navigation qui échoue ne doit
 * pas entraîner la suivante, et un aléa réseau n'est pas une disparition.
 *
 * Une lecture est refusée, et refaite, quand la page n'a pas fini de se
 * construire : titre vide, ou écran d'erreur côté client. La première
 * photographie de production avait enregistré un « Application error » à la
 * place d'une page de documentation, et un « Vérification en cours… » à la
 * place du message final : la comparaison suivante accusait ensuite le site
 * d'avoir perdu un écran d'erreur.
 */
async function lire(_page, route, essai = 1) {
  const page = await contexte.newPage();
  try {
    const lu = await lireSurPage(page, route);
    if ((!lu.titre || lu.erreurClient) && essai < 3) return lire(_page, route, essai + 1);
    return lu;
  } catch (e) {
    if (essai < 3) return lire(_page, route, essai + 1);
    throw e;
  } finally {
    await page.close();
  }
}

/**
 * Les données vivantes ne sont pas du contenu : un créneau de rendez-vous
 * pris ou passé disparaît, et c'est le fonctionnement normal du portail.
 * Les libellés qui les entourent restent comparés, et le gabarit du créneau
 * est couvert par les clés de traduction.
 */
const MOIS_FR = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';
const MOIS_EN = 'January|February|March|April|May|June|July|August|September|October|November|December';
const DONNEES_VIVANTES = [
  new RegExp(`^\\d{1,2} (${MOIS_FR}) \\d{4} · \\d{1,2}:\\d{2}`, 'i'),
  new RegExp(`^(${MOIS_EN}) \\d{1,2}, \\d{4} · \\d{1,2}:\\d{2}`),
];
const estDonneeVivante = (bloc) => DONNEES_VIVANTES.some((motif) => motif.test(bloc));
const ERREUR_CLIENT = 'Application error: a client-side exception';

async function lireSurPage(page, route) {
  const reponse = await page.goto(SITE + route, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  // Laisser la page se construire : hydratation, appels aux écoles, états
  // « en cours » qui se résolvent. Les mesures d'audience ne s'arrêtent
  // jamais tout à fait, d'où le plafond.
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(800);
  // Fait défiler la page : les contenus révélés au défilement doivent exister.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
  });
  const lu = await page.evaluate(() => {
    const blocs = new Set();
    const ajouter = (t) => {
      const propre = (t ?? '').replace(/\s+/g, ' ').trim();
      if (propre.split(' ').length >= 3) blocs.add(propre);
    };
    document.body.innerText.split('\n').forEach(ajouter);
    // Le texte caché compte aussi : modales, FAQ repliées.
    document.querySelectorAll('dialog, details').forEach((el) => el.innerText.split('\n').forEach(ajouter));
    const types = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
      try {
        const j = JSON.parse(s.textContent);
        return (j['@graph'] ?? [j]).map((n) => [n['@type']].flat().join('+'));
      } catch {
        return ['illisible'];
      }
    });
    return {
      titre: document.title,
      canonique: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.hreflang).sort(),
      jsonld: [...new Set(types)].sort(),
      titres: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
      liens: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))].sort(),
      champs: [...document.querySelectorAll('input[name],select[name],textarea[name]')].map((i) => i.name).sort(),
      blocs: [...blocs],
    };
  });
  const erreurClient = lu.blocs.some((b) => b.startsWith(ERREUR_CLIENT));
  lu.blocs = lu.blocs.filter((b) => !estDonneeVivante(b) && !b.startsWith(ERREUR_CLIENT));
  return { route, statut: reponse?.status() ?? 0, erreurClient, ...lu };
}

/** Les sources : clés de traduction, articles, pages de documentation. */
function lireSources() {
  const cles = {};
  const aplatir = (o, prefixe, fichier) => {
    for (const [k, v] of Object.entries(o)) {
      const cle = prefixe ? `${prefixe}.${k}` : k;
      if (v && typeof v === 'object') aplatir(v, cle, fichier);
      else cles[`${fichier}:${cle}`] = String(v);
    }
  };
  for (const f of fs.readdirSync(path.join(RACINE, 'messages'))) {
    aplatir(JSON.parse(fs.readFileSync(path.join(RACINE, 'messages', f), 'utf8')), '', f);
  }
  const lister = (dossier) => fs.readdirSync(path.join(RACINE, dossier), { recursive: true })
    .filter((f) => String(f).endsWith('.mdx')).map((f) => `${dossier}/${f}`).sort();
  return { cles, mdx: [...lister('content/blog'), ...lister('content/docs'), ...lister('content/institutionnel')] };
}

const normaliser = (t) => t.toLowerCase().normalize('NFC').replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const fichierDe = (route) => `${route.replace(/^\//, '').replace(/\//g, '__') || 'racine'}.json`;

// Derrière un proxy qui ré-signe le TLS (conteneurs d'agent), Chromium ne fait
// pas confiance à l'autorité du proxy alors que Node, si : les requêtes du
// navigateur sont alors relayées par Node. Jamais de vérification désactivée.
const distant = !/^https?:\/\/(127\.0\.0\.1|localhost)/.test(SITE);
const relais = distant && process.env.HTTPS_PROXY;
const navigateur = await chromium.launch({
  executablePath: NAVIGATEUR,
  ...(relais ? { proxy: { server: process.env.HTTPS_PROXY } } : {}),
});
const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
if (relais) {
  await contexte.route('**/*', async (r) => {
    try { await r.fulfill({ response: await r.fetch() }); } catch { await r.abort().catch(() => {}); }
  });
}
const page = await contexte.newPage();

if (PHOTO) {
  fs.mkdirSync(REFERENCE, { recursive: true });
  const routes = await routesDuSite();
  for (const route of routes) {
    try {
      const lu = await lire(page, route);
      fs.writeFileSync(path.join(REFERENCE, fichierDe(route)), JSON.stringify(lu, null, 1));
      const alerte = lu.erreurClient ? '  ⚠ erreur côté client en production' : !lu.titre ? '  ⚠ titre vide' : '';
      console.log(`  ${lu.statut}  ${route}  ${lu.blocs.length} blocs${alerte}`);
    } catch (e) {
      console.log(`  ERR  ${route}  ${e.message.split('\n')[0]}`);
    }
  }
  fs.writeFileSync(path.join(DOSSIER, 'sources.json'), JSON.stringify(lireSources(), null, 1));
  await navigateur.close();
  console.log(`\n  Référence écrite dans ${path.relative(RACINE, DOSSIER)} (${routes.length} routes).\n`);
  process.exit(0);
}

// --- Comparaison --------------------------------------------------------------

const mapping = fs.existsSync(MAPPING) ? JSON.parse(fs.readFileSync(MAPPING, 'utf8')) : { entrees: [] };
const declares = new Map(mapping.entrees.filter((e) => e.ancien).map((e) => [normaliser(e.ancien), e]));
const bloquants = [];
const avertissements = [];

// 1. Sources.
const avant = JSON.parse(fs.readFileSync(path.join(DOSSIER, 'sources.json'), 'utf8'));
const apres = lireSources();
for (const [cle, texte] of Object.entries(avant.cles)) {
  if (apres.cles[cle] !== undefined) continue;
  if (mapping.entrees.some((e) => e.cle === cle)) continue;
  if (Object.values(apres.cles).some((t) => normaliser(t) === normaliser(texte))) continue; // clé renommée
  bloquants.push(`clé disparue  ${cle}  « ${texte.slice(0, 80)} »`);
}
for (const fichier of avant.mdx) {
  if (!apres.mdx.includes(fichier) && !mapping.entrees.some((e) => e.fichier === fichier)) {
    bloquants.push(`contenu disparu  ${fichier}`);
  }
}

// 2. Rendu.
const reference = fs.readdirSync(REFERENCE).map((f) => JSON.parse(fs.readFileSync(path.join(REFERENCE, f), 'utf8')));
const lus = new Map();
const lireUneFois = async (route) => {
  if (!lus.has(route)) {
    try { lus.set(route, await lire(page, route)); } catch (e) { lus.set(route, { route, statut: 0, blocs: [], erreur: e.message }); }
  }
  return lus.get(route);
};

for (const ref of reference) {
  if (!ref.statut) continue; // une 404 a aussi un contenu (les reprises), qui doit survivre
  const maintenant = await lireUneFois(ref.route);
  if (maintenant.statut !== ref.statut) {
    bloquants.push(`${ref.route}  statut ${ref.statut} → ${maintenant.statut}`);
    continue;
  }
  if (maintenant.erreurClient) bloquants.push(`${ref.route}  erreur côté client (« ${ERREUR_CLIENT}… »)`);
  const affiche = normaliser(maintenant.blocs.join('\n'));
  for (const bloc of ref.blocs.filter((b) => !estDonneeVivante(b))) {
    if (affiche.includes(normaliser(bloc))) continue;
    const decl = declares.get(normaliser(bloc));
    if (decl) {
      // Déclarer un changement sans dire où le texte est parti, c'est déclarer
      // une suppression sous un autre nom.
      if (!decl.nouveau) {
        bloquants.push(`${ref.route}  [${decl.id}] déclaré ${decl.statut} sans « nouveau » : où est passé « ${bloc.slice(0, 60)} » ?`);
        continue;
      }
      if (!['PRESERVED', 'IMPROVED', 'MOVED'].includes(decl.statut)) {
        bloquants.push(`${ref.route}  [${decl.id}] statut « ${decl.statut} » refusé (PRESERVED, IMPROVED ou MOVED)`);
        continue;
      }
      const cible = decl.route ? await lireUneFois(decl.route) : maintenant;
      if (!normaliser(cible.blocs.join('\n')).includes(normaliser(decl.nouveau))) {
        bloquants.push(`${ref.route}  [${decl.id}] déclaré ${decl.statut} mais introuvable sur ${cible.route} : « ${decl.nouveau.slice(0, 80)} »`);
      }
      continue;
    }
    bloquants.push(`${ref.route}  bloc absent  « ${bloc.slice(0, 100)} »`);
  }
  // Le contrat SEO de la route.
  if (!maintenant.titre) bloquants.push(`${ref.route}  titre vide`);
  if (ref.canonique && maintenant.canonique !== ref.canonique) bloquants.push(`${ref.route}  canonique ${ref.canonique} → ${maintenant.canonique}`);
  if (ref.hreflang.join() !== maintenant.hreflang.join()) bloquants.push(`${ref.route}  hreflang ${ref.hreflang} → ${maintenant.hreflang}`);
  for (const type of ref.jsonld) {
    if (!maintenant.jsonld.includes(type)) bloquants.push(`${ref.route}  JSON-LD ${type} disparu`);
  }
  for (const champ of ref.champs) {
    if (!maintenant.champs.includes(champ)) bloquants.push(`${ref.route}  champ de formulaire « ${champ} » disparu`);
  }
  if (maintenant.titres.length < ref.titres.length) {
    avertissements.push(`${ref.route}  ${ref.titres.length} titres → ${maintenant.titres.length} (vérifier qu'aucune section n'a été absorbée)`);
  }
}

await navigateur.close();

for (const a of avertissements) console.log(`  ⚠  ${a}`);
for (const b of bloquants) console.log(`  ✗  ${b}`);
console.log(`\n  ${reference.length} routes, ${Object.keys(avant.cles).length} clés, ${avant.mdx.length} fichiers de contenu comparés.`);
if (bloquants.length) {
  console.log(`  ${bloquants.length} disparition(s) non déclarée(s) : BLOQUANT.\n`);
  process.exit(1);
}
console.log('  Aucune disparition. Parité de contenu tenue.\n');
