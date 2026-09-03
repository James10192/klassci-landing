#!/usr/bin/env node
/**
 * Le controle des donnees structurees, en integration continue.
 *
 * Le test de resultats enrichis de Google ne verifie qu'une page a la fois, a
 * la main, et seulement une fois le site en ligne. Ce script fait ce que lui ne
 * fait pas : il relit TOUTES les pages construites, extrait chaque balise
 * `application/ld+json`, et refuse la livraison si l'un des invariants
 * ci-dessous est rompu.
 *
 * Ces invariants ne sont pas des preferences de style. Chacun correspond a une
 * panne deja constatee sur ce site, ou a une regle explicite de Google :
 *
 *   1. JSON valide, echappement intact, un seul graphe par page.
 *   2. Une seule entite Organization par identifiant, un seul KLASSCI.
 *   3. Tout `@id` reference existe dans le meme graphe. Une reference orpheline
 *      n'est pas une erreur de syntaxe : elle est silencieuse.
 *   4. Aucun prix a zero, aucune devise manquante, fourchette coherente.
 *      Le balisage precedent annoncait « 0 FCFA » a trois centimetres d'un
 *      texte qui disait « 4,8 M FCFA / an ».
 *   5. `inLanguage` conforme au prefixe de langue de l'adresse.
 *   6. Aucune note ni avis auto-decerne.
 *   7. Aucune adresse relative dans le graphe.
 *
 * Usage :
 *   node scripts/verifier-donnees-structurees.mjs
 *   node scripts/verifier-donnees-structurees.mjs --racine .next/server/app
 *   node scripts/verifier-donnees-structurees.mjs --url https://www.klassci.com/fr
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const SORTIE = { graphes: 0, avertissements: 0, erreurs: 0 };

/** La meme valeur de repli que `lib/site-url.ts`, pour les memes raisons. */
const SITE_PAR_DEFAUT = "https://www.klassci.com";
const RAPPORT = [];

const LANGUES = { fr: ["fr-FR", "fr", "fr-CI"], en: ["en-US", "en", "en-GB"] };
const TYPES_TARIFAIRES = new Set([
  "Offer",
  "AggregateOffer",
  "UnitPriceSpecification",
]);

function signaler(niveau, page, message) {
  RAPPORT.push({ niveau, page, message });
  if (niveau === "ERREUR") SORTIE.erreurs += 1;
  else SORTIE.avertissements += 1;
}

function typesDe(noeud) {
  const type = noeud["@type"];
  return Array.isArray(type) ? type : type ? [type] : [];
}

function extraireJsonLd(html) {
  const blocs = [];
  const motif =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let trouve;
  while ((trouve = motif.exec(html)) !== null) blocs.push(trouve[1]);
  return blocs;
}

/**
 * Les proprietes dont la valeur DOIT pouvoir designer un autre domaine.
 *
 * `citation` porte les sources d'un article : sur un texte reglementaire, ce
 * sont les adresses du Journal officiel, du CAMES, d'un quotidien. Les
 * signaler comme « hors domaine » revenait a reprocher a l'article d'etre
 * source — 106 avertissements sur les seuls articles du blog, qui noyaient
 * les vrais.
 *
 * `sameAs` designe les profils publics de l'organisation, `isBasedOn` et
 * `subjectOf` d'autres travaux : meme raison.
 */
const PROPRIETES_EXTERNES = new Set([
  "citation",
  "sameAs",
  "isBasedOn",
  "subjectOf",
  "significantLink",
]);

/**
 * Parcourt le graphe en signalant les noeuds atteints par une propriete dont
 * la valeur vise legitimement l'exterieur.
 *
 * @param externe Vrai des qu'on est passe par une de ces proprietes : un
 *   sous-noeud de `citation` reste externe, quelle que soit sa profondeur.
 */
function* parcourir(valeur, externe = false) {
  if (Array.isArray(valeur)) {
    for (const element of valeur) yield* parcourir(element, externe);
    return;
  }
  if (valeur && typeof valeur === "object") {
    yield externe ? Object.assign(Object.create(MARQUE_EXTERNE), valeur) : valeur;
    for (const [cle, enfant] of Object.entries(valeur)) {
      yield* parcourir(enfant, externe || PROPRIETES_EXTERNES.has(cle));
    }
  }
}

/**
 * Le marqueur « ce noeud vient de l'exterieur ».
 *
 * Pose sur le prototype plutot que dans l'objet : les autres controles
 * enumerent les cles du noeud (`Object.keys(n).length > 1` pour distinguer une
 * organisation d'une simple reference), et une cle de plus les aurait fausses.
 */
const MARQUE_EXTERNE = { __externe: true };

function verifierGraphe(page, racine, langue, origine) {
  const noeuds = [...parcourir(racine)];

  /* 2. Organisations */
  const organisations = noeuds.filter(
    (n) => typesDe(n).includes("Organization") && Object.keys(n).length > 1,
  );
  const ids = organisations
    .map((n) => n["@id"])
    .filter((id) => typeof id === "string");

  if (ids.length !== organisations.length) {
    signaler(
      "ERREUR",
      page,
      "Organization sans @id : elle ne peut ni etre referencee, ni etre reconnue comme la meme d'une page a l'autre.",
    );
  }
  const doublons = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (doublons.length > 0) {
    signaler("ERREUR", page, `Organization declaree deux fois : ${doublons.join(", ")}`);
  }
  if (organisations.filter((n) => n.name === "KLASSCI").length > 1) {
    signaler("ERREUR", page, "Plusieurs noeuds Organization nommes KLASSCI.");
  }

  /* 3. References @id */
  const declares = new Set();
  const references = new Set();
  for (const noeud of noeuds) {
    const id = noeud["@id"];
    if (typeof id !== "string") continue;
    if (Object.keys(noeud).length === 1) references.add(id);
    else declares.add(id);
  }
  for (const reference of references) {
    if (!declares.has(reference)) {
      signaler(
        "ERREUR",
        page,
        `Reference @id orpheline : ${reference} n'est declare nulle part dans ce graphe.`,
      );
    }
  }

  /* 4. Prix */
  for (const noeud of noeuds) {
    const types = typesDe(noeud);
    if (!types.some((t) => TYPES_TARIFAIRES.has(t))) continue;

    const montants = [noeud.price, noeud.lowPrice, noeud.highPrice].filter(
      (v) => v !== undefined && v !== null,
    );
    for (const montant of montants) {
      const nombre = Number(montant);
      if (Number.isNaN(nombre)) {
        signaler("ERREUR", page, `Prix non numerique : ${JSON.stringify(montant)}`);
      } else if (nombre === 0) {
        signaler(
          "ERREUR",
          page,
          `Prix a 0 dans ${types.join("+")}. KLASSCI n'est pas gratuit : ce balisage est trompeur et expose a une action manuelle.`,
        );
      }
    }
    if (montants.length > 0 && !noeud.priceCurrency) {
      signaler("ERREUR", page, `${types.join("+")} porte un prix sans priceCurrency.`);
    }
    if (noeud.priceCurrency && noeud.priceCurrency !== "XOF") {
      signaler("AVERTIR", page, `Devise inattendue : ${noeud.priceCurrency}.`);
    }
    if (
      noeud.lowPrice !== undefined &&
      noeud.highPrice !== undefined &&
      Number(noeud.lowPrice) > Number(noeud.highPrice)
    ) {
      signaler("ERREUR", page, "AggregateOffer : lowPrice superieur a highPrice.");
    }
    if (noeud.priceValidUntil === undefined && noeud["@type"] === "Offer") {
      // Simple rappel : un prix promotionnel sans date de fin se perime seul.
    }
  }

  /* 5. Langue */
  if (langue) {
    const admises = LANGUES[langue] ?? [];
    for (const noeud of noeuds) {
      if (noeud.inLanguage === undefined) continue;
      const valeurs = Array.isArray(noeud.inLanguage)
        ? noeud.inLanguage
        : [noeud.inLanguage];
      // Un noeud qui declare les deux langues decrit le site, pas la page.
      if (valeurs.length > 1) continue;
      if (!admises.includes(valeurs[0])) {
        signaler("ERREUR", page, `inLanguage "${valeurs[0]}" sur une page /${langue}/.`);
      }
    }
  }

  /* 6. Avis auto-decernes */
  for (const noeud of noeuds) {
    const types = typesDe(noeud).join("+") || "noeud";
    if (noeud.aggregateRating !== undefined || typesDe(noeud).includes("AggregateRating")) {
      signaler(
        "ERREUR",
        page,
        `aggregateRating sur ${types}. Google exclut du resultat « etoiles » toute organisation qui controle les avis publies sur elle-meme.`,
      );
    }
    if (noeud.review !== undefined || typesDe(noeud).includes("Review")) {
      signaler(
        "ERREUR",
        page,
        `review sur ${types}. Un temoignage recueilli et publie par KLASSCI n'est pas un avis eligible.`,
      );
    }
  }

  /* 7. Adresses */
  for (const noeud of noeuds) {
    for (const cle of ["@id", "url", "contentUrl", "embedUrl", "thumbnailUrl", "item"]) {
      const valeur = noeud[cle];
      if (typeof valeur !== "string") continue;
      if (valeur.startsWith("https://schema.org/")) continue;
      if (!/^https?:\/\//.test(valeur)) {
        signaler(
          "ERREUR",
          page,
          `${cle} relatif : "${valeur}". Un graphe se lit hors contexte : toute adresse doit etre absolue.`,
        );
      } else if (
        origine &&
        !noeud.__externe &&
        !valeur.startsWith(origine) &&
        !/\.klassci\.com/.test(valeur)
      ) {
        signaler("AVERTIR", page, `${cle} hors domaine : ${valeur}`);
      }
    }
  }

  /* Regles propres a certains types */
  for (const noeud of noeuds) {
    const types = typesDe(noeud);

    if (types.includes("BreadcrumbList")) {
      const elements = noeud.itemListElement ?? [];
      if (elements.length < 2) {
        signaler("ERREUR", page, "BreadcrumbList de moins de deux elements.");
      }
      elements.forEach((element, index) => {
        if (element.position !== index + 1) {
          signaler("ERREUR", page, `BreadcrumbList : position ${element.position} a l'index ${index}.`);
        }
      });
    }

    if (types.includes("FAQPage") && !Array.isArray(noeud.mainEntity)) {
      signaler("ERREUR", page, "FAQPage sans mainEntity.");
    }

    if (types.includes("VideoObject")) {
      for (const requis of ["name", "thumbnailUrl", "uploadDate"]) {
        if (!noeud[requis]) signaler("ERREUR", page, `VideoObject sans ${requis}.`);
      }
      if (!noeud.contentUrl && !noeud.embedUrl) {
        signaler("ERREUR", page, "VideoObject sans contentUrl ni embedUrl.");
      }
    }

    for (const cle of ["datePublished", "dateModified"]) {
      const brut = noeud[cle];
      if (typeof brut !== "string") continue;
      const date = new Date(brut);
      if (Number.isNaN(date.getTime())) {
        signaler("ERREUR", page, `${cle} illisible : ${brut}`);
      } else if (date.getTime() > Date.now() + 86_400_000) {
        signaler("ERREUR", page, `${cle} dans le futur : ${brut}`);
      }
    }
  }
}

function verifierDocument(page, html, origine) {
  const blocs = extraireJsonLd(html);
  if (blocs.length === 0) return; // Toutes les pages n'ont pas vocation a en porter.
  if (blocs.length > 1) {
    signaler(
      "AVERTIR",
      page,
      `${blocs.length} balises JSON-LD. Un graphe unique se verifie d'un coup d'oeil ; plusieurs finissent par se contredire.`,
    );
  }

  const langue = /(?:^|\/)(fr|en)(?:\/|\.html$|$)/.exec(page)?.[1];

  for (const bloc of blocs) {
    if (/<\/script/i.test(bloc)) {
      signaler(
        "ERREUR",
        page,
        "La balise contient un </script litteral : echappement defaillant, injection possible via une chaine traduite.",
      );
    }
    let donnees;
    try {
      donnees = JSON.parse(bloc);
    } catch (erreur) {
      signaler("ERREUR", page, `JSON invalide : ${erreur.message}`);
      continue;
    }
    if (donnees["@context"] !== "https://schema.org") {
      signaler("AVERTIR", page, `@context inattendu : ${JSON.stringify(donnees["@context"])}`);
    }
    verifierGraphe(page, donnees, langue, origine);
    SORTIE.graphes += 1;
  }
}

async function* fichiersHtml(racine) {
  for (const entree of await readdir(racine, { withFileTypes: true })) {
    const chemin = join(racine, entree.name);
    if (entree.isDirectory()) yield* fichiersHtml(chemin);
    else if (entree.name.endsWith(".html")) yield chemin;
  }
}

async function principal() {
  const args = process.argv.slice(2);
  const urls = args.filter((_, i) => args[i - 1] === "--url");
  const racine = args.includes("--racine")
    ? args[args.indexOf("--racine") + 1]
    : ".next/server/app";
  // Sans origine connue, les controles d'adresse ne s'executent pas. Le
  // script annoncait alors « 0 avertissement », ce qui se lit « rien a
  // signaler » alors que cela voulait dire « rien verifie » — le pire des
  // deux mondes. On retombe donc sur la meme valeur sure que l'application,
  // et on le dit.
  const brut = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const origine = brut || SITE_PAR_DEFAUT;
  if (!brut) {
    console.log(
      `  NEXT_PUBLIC_SITE_URL absente : les adresses sont controlees contre ${SITE_PAR_DEFAUT}.`,
    );
  }

  if (urls.length > 0) {
    for (const url of urls) {
      const reponse = await fetch(url, { redirect: "follow" });
      if (!reponse.ok) {
        signaler("ERREUR", url, `HTTP ${reponse.status}`);
        continue;
      }
      verifierDocument(url, await reponse.text(), origine);
    }
  } else {
    let nombre = 0;
    try {
      for await (const fichier of fichiersHtml(racine)) {
        nombre += 1;
        verifierDocument(
          relative(racine, fichier).split(sep).join("/"),
          await readFile(fichier, "utf8"),
          origine,
        );
      }
    } catch (erreur) {
      console.error(`Impossible de lire ${racine} : ${erreur.message}`);
      console.error("Lancez `pnpm build` d'abord, ou passez --racine / --url.");
      process.exit(2);
    }
    if (nombre === 0) {
      console.error(`Aucun fichier .html sous ${racine}. Le build est-il termine ?`);
      process.exit(2);
    }
  }

  for (const ligne of RAPPORT) {
    const marque = ligne.niveau === "ERREUR" ? "ERREUR " : "AVERTIR";
    console.log(`  ${marque}  ${ligne.page}\n           ${ligne.message}`);
  }

  console.log(
    `\n  ${SORTIE.graphes} graphe(s) analyse(s) — ${SORTIE.erreurs} erreur(s), ${SORTIE.avertissements} avertissement(s).\n`,
  );
  process.exit(SORTIE.erreurs > 0 ? 1 : 0);
}

principal();
