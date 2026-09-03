#!/usr/bin/env node
/**
 * Les sources citees repondent-elles encore ?
 *
 * Un article de reglementation vaut ce que valent ses sources. Quatre des cinq
 * articles fondateurs citaient des adresses de l'ARTCI qui renvoyaient 404 le
 * jour de leur publication : l'autorite avait refondu son site, et le lien
 * mort etait la premiere chose qu'un lecteur mefiant — ou un evaluateur de
 * qualite — serait alle verifier.
 *
 * Ce controle n'appartient pas au portail de construction : il depend du
 * reseau et de sites tiers qui tombent pour des raisons qui ne nous regardent
 * pas. Une panne chez le CAMES ne doit pas empecher un deploiement. Il se
 * lance donc a la main, ou par la veille periodique.
 *
 *   node scripts/verifier-citations.mjs
 *   node scripts/verifier-citations.mjs --json    (sortie exploitable)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RACINE = process.cwd();
const JSON_SEUL = process.argv.includes("--json");
const DELAI = 20_000;
const PARALLELE = 6;

/**
 * Trois verdicts, pas deux.
 *
 * « Injoignable depuis ici » et « cette page n'existe plus » sont deux choses
 * differentes, et les confondre rend le controle inutilisable : Meta repond
 * 400 a toute requete venant d'un centre de donnees, l'AIP repond 500 une fois
 * sur deux. Signaler ces cas comme des liens morts aurait appris a les
 * ignorer, et le jour ou un vrai 404 serait apparu au milieu, personne ne
 * l'aurait vu.
 *
 * Seuls 404 et 410 — les deux codes par lesquels un serveur declare qu'une
 * ressource n'est plus la — et l'impossibilite d'etablir la connexion, font
 * echouer le controle.
 */
const REFUS = new Set([401, 400, 403, 405, 406, 409, 429, 451, 999]);
const DISPARU = new Set([404, 410]);

function fichiersMdx(dossier) {
  const trouves = [];
  const chemin = join(RACINE, dossier);
  try {
    for (const entree of readdirSync(chemin, { withFileTypes: true })) {
      const complet = join(chemin, entree.name);
      if (entree.isDirectory()) {
        trouves.push(...fichiersMdx(join(dossier, entree.name)));
      } else if (/\.mdx?$/.test(entree.name)) {
        trouves.push(complet);
      }
    }
  } catch {
    // Le dossier n'existe pas encore.
  }
  return trouves;
}

/** Chaque adresse externe du contenu, avec l'endroit ou elle est citee. */
function recenser() {
  const parAdresse = new Map();

  for (const dossier of ["content/blog", "content/institutionnel", "content/docs"]) {
    for (const fichier of fichiersMdx(dossier)) {
      const texte = readFileSync(fichier, "utf8");
      const lignes = texte.split("\n");

      lignes.forEach((ligne, index) => {
        // Le nom d'hote doit commencer par une lettre ou un chiffre : sans
        // cette contrainte, le `https://` isole d'un exemple de code ou d'une
        // phrase (« une adresse en https:// ») serait recense comme une source.
        // L'apostrophe n'est pas un delimiteur : elle est licite dans un
        // chemin, et la circulaire du ministere en contient une
        // (« passage_dans_l'enseignement »). L'exclure coupait l'adresse en
        // deux et faisait declarer morte une source qui repond.
        for (const trouve of ligne.matchAll(/https?:\/\/[a-z0-9][^\s)"<>\]`]*/gi)) {
          // Ni la ponctuation finale d'une phrase, ni la fermeture d'un
          // element Markdown, n'appartiennent a l'adresse.
          const adresse = trouve[0].replace(/[.,;:`*_]+$/, "");
          if (adresse.includes("klassci.com")) continue;

          const ou = `${relative(RACINE, fichier)}:${index + 1}`;
          const deja = parAdresse.get(adresse);
          if (deja) deja.add(ou);
          else parAdresse.set(adresse, new Set([ou]));
        }
      });
    }
  }

  return parAdresse;
}

/**
 * Interroge une adresse.
 *
 * On tente `HEAD` d'abord — inutile de telecharger un PDF de trois megaoctets
 * pour savoir qu'il existe — puis `GET` en repli : beaucoup de serveurs
 * institutionnels ne repondent pas correctement a `HEAD`.
 */
async function interroger(adresse, tentative = 0) {
  for (const methode of ["HEAD", "GET"]) {
    try {
      const reponse = await fetch(adresse, {
        method: methode,
        redirect: "follow",
        signal: AbortSignal.timeout(DELAI),
        headers: {
          // Un agent de robot honnete se fait renvoyer 403 ou 500 par
          // plusieurs sites institutionnels ouest-africains — l'AIP a ainsi
          // ete declaree morte alors qu'elle repondait parfaitement a un
          // navigateur. On se presente donc comme un navigateur : le but est
          // de savoir ce que verra le lecteur, pas de tester leur politique
          // d'exploration.
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" +
            " (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
          accept: "text/html,application/xhtml+xml,application/pdf,*/*;q=0.8",
        },
      });
      if (reponse.ok) return { statut: reponse.status, verdict: "vivant" };

      if (REFUS.has(reponse.status)) {
        return { statut: reponse.status, verdict: "refus" };
      }

      if (methode === "GET") {
        // Un 5xx est presque toujours passager. Une seule reprise, apres une
        // pause : deux echecs d'affilee ne sont plus un hasard.
        if (reponse.status >= 500 && tentative === 0) {
          await new Promise((suite) => setTimeout(suite, 2500));
          return interroger(adresse, 1);
        }
        return {
          statut: reponse.status,
          verdict: DISPARU.has(reponse.status) ? "disparu" : "refus",
        };
      }
    } catch (erreur) {
      if (methode === "GET") {
        if (tentative === 0) {
          await new Promise((suite) => setTimeout(suite, 2500));
          return interroger(adresse, 1);
        }
        return {
          statut: 0,
          verdict: "disparu",
          motif: String(erreur.message ?? erreur),
        };
      }
    }
  }
  return { statut: 0, verdict: "disparu" };
}

async function parLots(entrees, taille, action) {
  const resultats = [];
  for (let debut = 0; debut < entrees.length; debut += taille) {
    const lot = entrees.slice(debut, debut + taille);
    resultats.push(...(await Promise.all(lot.map(action))));
  }
  return resultats;
}

const parAdresse = recenser();
const adresses = [...parAdresse.keys()].sort();

if (!JSON_SEUL) {
  console.log("");
  console.log("  Sources citees");
  console.log("  " + "-".repeat(40));
  console.log(`  ${adresses.length} adresses externes a verifier`);
  console.log("");
}

const verdicts = await parLots(adresses, PARALLELE, async (adresse) => ({
  adresse,
  ou: [...parAdresse.get(adresse)],
  ...(await interroger(adresse)),
}));

const morts = verdicts.filter((v) => v.verdict === "disparu");
const refus = verdicts.filter((v) => v.verdict === "refus");

if (JSON_SEUL) {
  console.log(JSON.stringify({ total: verdicts.length, morts, refus }, null, 2));
} else {
  for (const mort of morts) {
    console.log(`  X    ${mort.statut || "injoignable"}  ${mort.adresse}`);
    for (const ou of mort.ou) console.log(`         cite dans ${ou}`);
  }
  if (morts.length) console.log("");

  for (const cas of refus) {
    console.log(`  ?    ${cas.statut}  ${cas.adresse}`);
  }
  if (refus.length) {
    console.log(
      "       refus d'acces, pas disparition : a ouvrir dans un navigateur",
    );
    console.log("");
  }

  if (morts.length === 0) {
    console.log(
      `  Aucune des ${verdicts.length} sources citees n'a disparu` +
        (refus.length ? ` (${refus.length} a verifier a la main).` : "."),
    );
  } else {
    console.log(
      `  ${morts.length} source(s) sur ${verdicts.length} ont disparu.`,
    );
    console.log("  Une citation morte vaut moins que pas de citation :");
    console.log("  retrouver la source a sa nouvelle adresse, ou la remplacer.");
  }
  console.log("");
}

process.exit(morts.length > 0 ? 1 : 0);
