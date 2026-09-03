#!/usr/bin/env node
/**
 * Aucune note interne ne doit se retrouver servie au public.
 *
 * Écrit après avoir découvert que quatre pages institutionnelles étaient en
 * ligne depuis plusieurs jours avec, à l'écran, un encadré adressé à la
 * direction : « les éléments suivants doivent être fournis avant la mise en
 * ligne ». L'application, elle, tournait déjà chez des écoles. Un visiteur qui
 * ouvrait les mentions légales lisait notre liste de courses.
 *
 * Le mécanisme en place à l'époque marquait ces pages `noindex` et les retirait
 * du plan du site. Il protégeait les moteurs. Il ne protégeait pas les
 * visiteurs, qui sont précisément ceux qui ouvrent une page de mentions
 * légales.
 *
 * Ce contrôle ne demande donc pas si la page est indexée : il refuse le texte
 * lui-même. Ce qui manque à une page se dit dans la revue de la modification,
 * jamais dans la page.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RACINE = process.cwd();

/** Les dossiers dont le contenu est servi tel quel au visiteur. */
const DOSSIERS = ["content"];

/**
 * Les tournures d'une note interne. Volontairement peu nombreuses et très
 * spécifiques : un contrôle qui crie pour rien finit désactivé.
 *
 * `mise en ligne` seul ne suffirait pas — un guide peut légitimement parler de
 * la mise en ligne d'un site. C'est la conjonction « quelque chose doit être
 * fait AVANT » qui trahit la note de service.
 *
 * Deux motifs ont été retirés au premier passage parce qu'ils accusaient à
 * tort la documentation d'exploitation : `before going live` seul, qui titre
 * légitimement l'étape de répétition avant l'ouverture d'une école, et
 * `doivent être fournis` seul, qu'un guide d'inscription emploie pour des
 * pièces demandées à un candidat. Un contrôle qui crie pour rien finit
 * désactivé, et ce jour-là il ne protège plus rien.
 */
const MOTIFS = [
  { motif: /<ACompleter/i, dit: "encadré de brouillon <ACompleter>" },
  { motif: /à\s+compl[ée]ter\s+avant/i, dit: "« à compléter avant… »" },
  { motif: /avant\s+(?:la\s+)?mise\s+en\s+ligne/i, dit: "« avant la mise en ligne »" },
  { motif: /to\s+be\s+completed\s+before/i, dit: "« to be completed before… »" },
  {
    motif: /doivent\s+être\s+(?:fournis|renseignés|arrêtés|réglés)\s+par\s+(?:la\s+direction|l'éditeur|le\s+fondateur)/i,
    dit: "consigne adressée à l'éditeur",
  },
  { motif: /\bTODO\b|\bFIXME\b/, dit: "TODO / FIXME" },
  { motif: /\bA\s+CONFIRMER\b|\bÀ\s+CONFIRMER\b/i, dit: "« à confirmer »" },
  { motif: /lorem\s+ipsum/i, dit: "texte de remplissage" },
];

function fichiers(dossier) {
  const trouves = [];

  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);

    if (statSync(chemin).isDirectory()) {
      trouves.push(...fichiers(chemin));
    } else if (/\.mdx?$/.test(entree)) {
      trouves.push(chemin);
    }
  }

  return trouves;
}

const anomalies = [];
let lus = 0;

for (const dossier of DOSSIERS) {
  for (const chemin of fichiers(join(RACINE, dossier))) {
    lus += 1;
    const source = readFileSync(chemin, "utf8");
    const lignes = source.split("\n");

    lignes.forEach((ligne, rang) => {
      for (const { motif, dit } of MOTIFS) {
        if (motif.test(ligne)) {
          anomalies.push({
            fichier: relative(RACINE, chemin),
            ligne: rang + 1,
            dit,
            extrait: ligne.trim().slice(0, 96),
          });
        }
      }
    });
  }
}

if (anomalies.length > 0) {
  console.error(`\n  ${anomalies.length} note(s) interne(s) dans du contenu servi au public :\n`);

  for (const { fichier, ligne, dit, extrait } of anomalies) {
    console.error(`    ${fichier}:${ligne}`);
    console.error(`      ${dit} — ${extrait}`);
  }

  console.error(
    "\n  Ce qui manque à une page se dit dans la revue de la modification,\n" +
      "  pas dans la page. Une page qui n'est pas prête porte `brouillon: true`\n" +
      "  en tête de son fichier, et n'affiche rien de ce qui lui manque.\n",
  );
  process.exit(1);
}

console.log(`\n  ${lus} fichier(s) de contenu — aucune note interne servie au public.\n`);
