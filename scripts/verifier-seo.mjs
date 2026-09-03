#!/usr/bin/env node
/**
 * Verificateur SEO — le garde-fou qui empeche une regression silencieuse.
 *
 * Deux modes, complementaires :
 *
 *   node scripts/verifier-seo.mjs
 *       Controles statiques sur le depot. Rapide, hors ligne, fait pour la CI :
 *       toute route rendue doit produire des metadonnees completes, aucune
 *       adresse ne doit etre concatenee a la main, aucun prix mensonger ne doit
 *       trainer dans le JSON-LD.
 *
 *   node scripts/verifier-seo.mjs --url https://www.klassci.com
 *       Controles en conditions reelles. Parcourt le sitemap, ouvre chaque
 *       page, verifie ce que voit reellement un robot d'indexation.
 *
 * Pourquoi ce fichier existe : en septembre 2026, une variable d'environnement
 * contenant un saut de ligne final a rendu invalides les 32 adresses du
 * sitemap et coupe en deux la directive `Sitemap:` du robots.txt. Rien n'avait
 * plante, aucun test n'avait echoue, le site s'affichait normalement — et
 * Google n'avait plus de plan du site. Un defaut de cette nature ne se voit
 * qu'en regardant la sortie reelle. C'est ce que fait ce script.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep as sepChemin } from "node:path";

const RACINE = new URL("..", import.meta.url).pathname;

const anomalies = [];
const avertissements = [];
const reussites = [];

const echec = (regle, detail) => anomalies.push({ regle, detail });
const alerte = (regle, detail) => avertissements.push({ regle, detail });
const ok = (regle) => reussites.push(regle);

/* ------------------------------------------------------------------ outils */

function fichiers(dossier, filtre) {
  const chemin = join(RACINE, dossier);
  if (!existsSync(chemin)) return [];
  const sortie = [];
  const parcourir = (d) => {
    for (const entree of readdirSync(d)) {
      if (entree === "node_modules" || entree.startsWith(".")) continue;
      const complet = join(d, entree);
      if (statSync(complet).isDirectory()) parcourir(complet);
      else if (filtre.test(entree)) sortie.push(complet);
    }
  };
  parcourir(chemin);
  return sortie;
}

const lire = (chemin) => readFileSync(chemin, "utf8");
const court = (chemin) => relative(RACINE, chemin);

/* -------------------------------------------------- controles sur le depot */

function controlerMetadonnees() {
  const pages = fichiers("app", /^page\.tsx$/).filter((p) => !p.includes("/api/"));
  const constructeurs = constructeursDeMetadonnees();

  for (const page of pages) {
    const source = lire(page);
    const nom = court(page);

    // Une page qui ne fait que rediriger ou lever un 404 ne rend rien : elle
    // n'a aucune metadonnee a porter.
    const sansRendu =
      /\b(redirect|notFound)\s*\(/.test(source) && !/return\s*\(/.test(source);
    if (sansRendu) continue;

    if (!/export\s+(async\s+)?function\s+generateMetadata|export\s+const\s+metadata/.test(source)) {
      echec("metadonnees", `${nom} ne definit ni generateMetadata ni metadata`);
      continue;
    }

    // Le canonical peut etre ecrit sur place, ou delegue a un constructeur.
    const aCanonical =
      /alternates\s*:/.test(source) ||
      constructeurs.some((nomFonction) =>
        new RegExp(`\\b${nomFonction}\\s*\\(`).test(source),
      );
    if (!aCanonical) {
      echec("canonical", `${nom} ne pose pas de canonical ni d'alternates de langue`);
    }
  }
  if (pages.length) ok(`metadonnees verifiees sur ${pages.length} routes`);
}

/**
 * Les fonctions de `lib/` qui posent une adresse canonique.
 *
 * Elles sont decouvertes plutot qu'enumerees. Une liste ecrite en dur ici
 * aurait cette proprietee desagreable : ajouter un constructeur de
 * metadonnees ferait echouer le controle, et la reaction naturelle serait
 * d'ajouter son nom a la liste — c'est-a-dire de faire taire le controle sans
 * avoir rien verifie. En lisant `lib/`, on accepte exactement les fonctions
 * dont on a constate qu'elles appellent `buildUniverseMetadata`, qui est le
 * seul endroit du depot ou le canonical est reellement pose.
 */
function constructeursDeMetadonnees() {
  const racine = "buildUniverseMetadata";
  const trouves = new Set([racine]);

  // Deux passes suffisent : une fonction qui delegue a une fonction qui
  // delegue au constructeur racine. Au-dela, la chaine serait elle-meme le
  // probleme a signaler.
  for (let passe = 0; passe < 2; passe += 1) {
    for (const fichier of fichiers("lib", /\.ts$/)) {
      const source = lire(fichier);
      const connus = [...trouves];
      if (!connus.some((nom) => new RegExp(`\\b${nom}\\s*\\(`).test(source))) continue;

      for (const trouve of source.matchAll(
        /export\s+(?:async\s+)?function\s+(\w+)/g,
      )) {
        // On ne retient que les fonctions qui rendent des metadonnees : le
        // type de retour est la seule marque fiable, et il est present partout
        // dans ce depot.
        const declaration = source.slice(trouve.index, trouve.index + 400);
        if (/:\s*Metadata\b/.test(declaration)) trouves.add(trouve[1]);
      }
    }
  }

  return [...trouves];
}

function controlerAdresseDuSite() {
  const module = join(RACINE, "lib/site-url.ts");
  if (!existsSync(module)) {
    echec("adresse", "lib/site-url.ts est absent : chaque fichier lit l'environnement dans son coin");
    return;
  }
  const source = lire(module);
  if (!/trim\(\)/.test(source)) {
    echec("adresse", "lib/site-url.ts ne nettoie pas la variable d'environnement");
  } else {
    ok("l'adresse du site est normalisee en un seul endroit");
  }

  // Toute lecture directe de la variable ailleurs rouvre la porte au bug.
  const suspects = [...fichiers("app", /\.tsx?$/), ...fichiers("lib", /\.tsx?$/)].filter(
    (f) => !f.endsWith("lib/site-url.ts") && /NEXT_PUBLIC_SITE_URL/.test(lire(f)),
  );
  for (const f of suspects) {
    echec(
      "adresse",
      `${court(f)} lit NEXT_PUBLIC_SITE_URL directement — importer SITE_URL depuis lib/site-url`,
    );
  }
  if (!suspects.length) ok("aucune lecture sauvage de NEXT_PUBLIC_SITE_URL");
}

function controlerDonneesStructurees() {
  const cibles = fichiers("components", /\.tsx$/).concat(fichiers("lib", /\.ts$/));
  let trouve = false;

  for (const f of cibles) {
    const source = lire(f);
    if (!/schema\.org/.test(source)) continue;
    trouve = true;

    if (/["']price["']\s*:\s*["']0["']/.test(source)) {
      echec(
        "donnees-structurees",
        `${court(f)} declare un prix de 0 alors que le produit est payant — balisage trompeur au sens des regles Google`,
      );
    }
    if (/aggregateRating/i.test(source) && !/avis|review|verifie/i.test(source)) {
      alerte(
        "donnees-structurees",
        `${court(f)} declare un aggregateRating : il doit reposer sur des avis reels et visibles sur la page`,
      );
    }
  }
  if (trouve) ok("donnees structurees inspectees");
  else alerte("donnees-structurees", "aucun JSON-LD trouve dans le depot");
}

function controlerSitemapEtRobots() {
  for (const nom of ["app/sitemap.ts", "app/robots.ts"]) {
    const chemin = join(RACINE, nom);
    if (!existsSync(chemin)) {
      echec("sitemap", `${nom} est absent`);
      continue;
    }
    const source = lire(chemin);
    if (/process\.env\.NEXT_PUBLIC_SITE_URL/.test(source)) {
      echec("sitemap", `${nom} lit l'environnement sans le normaliser`);
    }
  }
  const sitemap = join(RACINE, "app/sitemap.ts");
  if (existsSync(sitemap) && !/alternates/.test(lire(sitemap))) {
    alerte("sitemap", "app/sitemap.ts ne declare pas les alternates de langue (hreflang par sitemap)");
  }
  ok("sitemap et robots inspectes");
}

function controlerFichiersAttendus() {
  const attendus = [
    ["app/manifest.ts", "manifeste d'application"],
    ["app/[locale]/not-found.tsx", "page 404 localisee"],
    ["app/not-found.tsx", "page 404 racine"],
  ];
  for (const [chemin, quoi] of attendus) {
    if (!existsSync(join(RACINE, chemin))) {
      alerte("fichiers", `${chemin} manque (${quoi})`);
    }
  }
  ok("presence des fichiers structurants verifiee");
}

function controlerTextesAlternatifs() {
  const vues = fichiers("components", /\.tsx$/).concat(fichiers("app", /\.tsx$/));
  let manquants = 0;
  for (const f of vues) {
    const source = lire(f);
    // On cherche une balise Image/img dont le bloc d'attributs ne contient pas alt=.
    const balises = source.match(/<(?:Image|img)\s[^>]*?\/?>/gs) || [];
    for (const balise of balises) {
      if (!/\balt\s*=/.test(balise)) {
        manquants += 1;
        alerte("accessibilite", `${court(f)} : une image sans attribut alt`);
      }
    }
  }
  if (!manquants) ok("toutes les images portent un attribut alt");
}


/**
 * Les liens internes du contenu editorial.
 *
 * Un lien casse dans un article n'echoue nulle part : la page se construit,
 * elle s'affiche, et seul le lecteur qui clique tombe sur un 404. Or ces liens
 * sont ecrits a la main dans du MDX, souvent par quelqu'un — ou quelque chose
 * — qui n'a pas la carte du site en tete.
 *
 * Le prefixe de langue est verifie au passage : `/docs/x` sans prefixe repond
 * 307, ce qui dilue le lien et coute un aller-retour au lecteur.
 */
function controlerLiensInternes() {
  const routesFixes = new Set([
    "/fr", "/en",
    "/fr/universite", "/en/universite",
    "/fr/college", "/en/college",
    "/fr/lms", "/en/lms",
    "/fr/blog", "/fr/docs", "/en/docs",
    "/fr/inscription", "/en/inscription",
  ]);

  const ajouterDepuis = (dossier, prefixe, langues) => {
    for (const fichier of fichiers(dossier, /\.mdx$/)) {
      const relatif = relative(join(RACINE, dossier), fichier)
        .split(sepChemin)
        .join("/")
        .replace(/\.en\.mdx$/, "")
        .replace(/\.mdx$/, "")
        .replace(/\/index$/, "");
      for (const langue of langues) {
        routesFixes.add(`/${langue}${prefixe}${relatif ? `/${relatif}` : ""}`);
      }
    }
  };
  ajouterDepuis("content/docs", "/docs", ["fr", "en"]);
  ajouterDepuis("content/blog", "/blog", ["fr"]);
  ajouterDepuis("content/institutionnel", "", ["fr", "en"]);

  let casses = 0;
  let liensVerifies = 0;
  let actifsVerifies = 0;

  for (const fichier of [
    ...fichiers("content/blog", /\.mdx$/),
    ...fichiers("content/docs", /\.mdx$/),
  ]) {
    const source = lire(fichier);

    for (const trouve of source.matchAll(/(!?)\[[^\]]*\]\((\/[^)#\s]*)(#[^)]*)?\)/g)) {
      const estImage = trouve[1] === "!";
      const cible = trouve[2].replace(/\/$/, "");

      // Une ressource — image, video, fichier — se verifie sur le disque, pas
      // dans la table des routes. Une capture manquante dans un guide est un
      // cadre vide chez le lecteur, et rien ne l'aurait signale.
      if (estImage || /\.(png|jpe?g|svg|webp|avif|gif|pdf|mp4|xlsx?|csv)$/i.test(cible)) {
        actifsVerifies += 1;
        if (!existsSync(join(RACINE, "public", cible))) {
          casses += 1;
          echec("liens", `${court(fichier)} affiche ${cible}, absent de public/`);
        }
        continue;
      }

      liensVerifies += 1;
      if (!routesFixes.has(cible)) {
        casses += 1;
        echec("liens", `${court(fichier)} pointe vers ${cible}, qui ne correspond a aucune page`);
      }
    }
  }

  if (!casses) {
    ok(`${liensVerifies} liens internes et ${actifsVerifies} ressources du contenu resolvent tous`);
  }
}

/* ------------------------------------------------------ controles en ligne */

async function recuperer(url) {
  const reponse = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "verifier-seo-klassci/1.0" },
  });
  const corps = reponse.status < 400 ? await reponse.text() : "";
  return { statut: reponse.status, entetes: reponse.headers, corps, url };
}

function extraire(html, motif) {
  const trouve = html.match(motif);
  return trouve ? trouve[1] : null;
}

async function controlerEnLigne(base) {
  const origine = new URL(base).origin;
  console.log(`\n  Verification en ligne de ${origine}\n`);

  /* robots.txt */
  const robots = await recuperer(`${origine}/robots.txt`);
  if (robots.statut !== 200) {
    echec("en-ligne", `robots.txt repond ${robots.statut}`);
  } else {
    const ligne = robots.corps.split("\n").find((l) => /^sitemap:/i.test(l.trim()));
    if (!ligne) {
      echec("en-ligne", "robots.txt ne declare aucun sitemap");
    } else {
      const adresse = ligne.split(/:\s*/).slice(1).join(":").trim();
      let valide = false;
      try {
        new URL(adresse);
        valide = true;
      } catch {
        echec(
          "en-ligne",
          `l'adresse du sitemap dans robots.txt est invalide : ${JSON.stringify(adresse)}`,
        );
      }

      // Une adresse syntaxiquement valide ne suffit pas. En production, la
      // directive valait `Sitemap: https://klassci.com` suivie, a la ligne, de
      // `/sitemap.xml` : la premiere partie passait le controle, et Google
      // recuperait la page d'accueil au lieu du plan du site. On va donc
      // chercher l'adresse declaree et on regarde ce qu'elle renvoie.
      if (valide) {
        const cible = await recuperer(adresse);
        const type = cible.entetes.get("content-type") ?? "";
        if (cible.statut !== 200) {
          echec("en-ligne", `le sitemap declare dans robots.txt repond ${cible.statut} : ${adresse}`);
        } else if (!/xml/i.test(type) && !cible.corps.trimStart().startsWith("<?xml")) {
          echec(
            "en-ligne",
            `l'adresse declaree comme sitemap ne renvoie pas du XML (${type || "type inconnu"}) : ${adresse}`,
          );
        } else {
          ok("robots.txt declare un sitemap qui repond bien un plan de site");
        }
      }
    }
  }

  /* sitemap.xml */
  const sitemap = await recuperer(`${origine}/sitemap.xml`);
  let adresses = [];
  if (sitemap.statut !== 200) {
    echec("en-ligne", `sitemap.xml repond ${sitemap.statut}`);
  } else {
    const locs = [...sitemap.corps.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) => m[1]);
    if (!locs.length) echec("en-ligne", "le sitemap ne contient aucune adresse");

    for (const loc of locs) {
      if (loc !== loc.trim() || /\s/.test(loc)) {
        echec("en-ligne", `adresse du sitemap contenant un espace ou un saut de ligne : ${JSON.stringify(loc)}`);
        continue;
      }
      try {
        const u = new URL(loc);
        if (u.origin !== origine) {
          alerte("en-ligne", `${loc} pointe vers une autre origine que ${origine}`);
        }
        adresses.push(loc);
      } catch {
        echec("en-ligne", `adresse invalide dans le sitemap : ${JSON.stringify(loc)}`);
      }
    }
    if (adresses.length) ok(`${adresses.length} adresses valides dans le sitemap`);
  }

  /* pages */
  const aVisiter = adresses.length ? adresses : [`${origine}/fr`];
  const echantillon = aVisiter.slice(0, Number(process.env.SEO_MAX_PAGES || 40));

  for (const adresse of echantillon) {
    const page = await recuperer(adresse);
    const nom = new URL(adresse).pathname;

    if (page.statut !== 200) {
      echec("page", `${nom} repond ${page.statut}`);
      continue;
    }

    const titre = extraire(page.corps, /<title>([^<]*)<\/title>/);
    if (!titre) echec("page", `${nom} n'a pas de titre`);
    else if (titre.length > 65) alerte("page", `${nom} : titre de ${titre.length} caracteres (au-dela de 65 il est tronque)`);

    const description = extraire(page.corps, /<meta name="description" content="([^"]*)"/);
    if (!description) echec("page", `${nom} n'a pas de meta description`);
    else if (description.length < 50 || description.length > 165) {
      alerte("page", `${nom} : description de ${description.length} caracteres (viser 50 a 165)`);
    }

    const canonical = extraire(page.corps, /<link rel="canonical" href="([^"]*)"/);
    if (!canonical) {
      echec("page", `${nom} n'a pas de canonical`);
    } else {
      const attendu = new URL(adresse).pathname.replace(/\/$/, "");
      const obtenu = new URL(canonical).pathname.replace(/\/$/, "");
      if (attendu !== obtenu) {
        echec("page", `${nom} se canonicalise vers ${obtenu} — la page se declare doublon d'une autre`);
      }
      if (new URL(canonical).origin !== origine) {
        echec("page", `${nom} : canonical sur ${new URL(canonical).origin} alors que la page est servie sur ${origine}`);
      }
    }

    const alternates = [...page.corps.matchAll(/<link rel="alternate" href(?:Lang|lang)="([^"]*)" href="([^"]*)"/g)];
    const langues = alternates.map((m) => m[1]);
    if (!langues.includes("x-default")) {
      alerte("page", `${nom} ne declare pas de x-default`);
    }

    const h1 = (page.corps.match(/<h1[\s>]/g) || []).length;
    if (h1 === 0) alerte("page", `${nom} n'a aucun h1`);
    if (h1 > 1) alerte("page", `${nom} contient ${h1} balises h1`);

    const jsonld = [...page.corps.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    for (const [, brut] of jsonld) {
      try {
        JSON.parse(brut);
      } catch (e) {
        echec("page", `${nom} : JSON-LD illisible (${e.message})`);
      }
    }
  }
  ok(`${echantillon.length} pages inspectees en ligne`);
}

/* ------------------------------------------------------------------ sortie */

async function principal() {
  const args = process.argv.slice(2);
  const indexUrl = args.indexOf("--url");
  const base = indexUrl !== -1 ? args[indexUrl + 1] : null;

  console.log("\n  Verificateur SEO KLASSCI\n  " + "-".repeat(40));

  controlerMetadonnees();
  controlerAdresseDuSite();
  controlerDonneesStructurees();
  controlerSitemapEtRobots();
  controlerFichiersAttendus();
  controlerTextesAlternatifs();
  controlerLiensInternes();

  if (base) await controlerEnLigne(base);

  console.log(`\n  ${reussites.length} controles passes`);
  for (const r of reussites) console.log(`    ok   ${r}`);

  if (avertissements.length) {
    console.log(`\n  ${avertissements.length} avertissements`);
    for (const a of avertissements) console.log(`    !    [${a.regle}] ${a.detail}`);
  }

  if (anomalies.length) {
    console.log(`\n  ${anomalies.length} anomalies bloquantes`);
    for (const a of anomalies) console.log(`    X    [${a.regle}] ${a.detail}`);
    console.log("");
    process.exit(1);
  }

  console.log("\n  Aucune anomalie bloquante.\n");
}

principal().catch((e) => {
  console.error("\n  Le verificateur a echoue :", e);
  process.exit(1);
});
