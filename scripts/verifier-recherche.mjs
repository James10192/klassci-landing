#!/usr/bin/env node
/**
 * Vérifie la règle de recherche du sélecteur d'établissement, en l'exécutant.
 *
 *   node --experimental-strip-types scripts/verifier-recherche.mjs
 *
 * Ce dépôt n'a pas de lanceur de tests, et cette règle a déjà produit un défaut
 * visible : chercher « universite » ramenait une école nommée « AZERTY », parce
 * que le code technique de l'établissement était indexé alors qu'il n'apparaît
 * nulle part à l'écran. Le vérifier en pilotant un navigateur à la main marche
 * une fois ; il fallait que ça marche à chaque construction.
 *
 * Le module est pur : Node suffit, comme pour l'amortisseur du relais.
 */

import { acronyme, filtrer } from "../lib/portail/recherche.ts";

let echecs = 0;

function verifier(intention, obtenu, attendu) {
  const memeChose = JSON.stringify(obtenu) === JSON.stringify(attendu);
  if (memeChose) {
    console.log(`  ok   ${intention}`);
    return;
  }
  echecs += 1;
  console.log(`  X    ${intention}`);
  console.log(`         attendu : ${JSON.stringify(attendu)}`);
  console.log(`         obtenu  : ${JSON.stringify(obtenu)}`);
}

/** Les écoles réellement servies, avec le nom et la ville qu'elles déclarent. */
const ECOLES = [
  { nom: "Ecole Spéciale du Bâtiment et des Travaux Publics", ville: "ABIDJAN" },
  { nom: "ÉCOLE SPÉCIALE DU BÂTIMENT ET DES TRAVAUX PUBLICS", ville: "Yamoussoukro" },
  { nom: "Institut Supérieur Louis Le Grand", ville: "Bouaké" },
  { nom: "Ephrata", ville: "Yamoussoukro" },
  { nom: "AZERTY", ville: "BOUAKE" },
  {
    nom: "Université internationale des Sciences Agronomiques et Technologies - USAT Bouaké",
    ville: "Bouaké",
  },
];

const noms = (requete) => filtrer(ECOLES, requete).map((e) => e.nom);

console.log("");
console.log("  Recherche d'etablissement");
console.log("  " + "-".repeat(40));

/* L'acronyme se derive du nom affiche, pas d'un champ separe. */
verifier(
  "l'acronyme ignore les articles",
  acronyme("Ecole Spéciale du Bâtiment et des Travaux Publics"),
  "esbtp",
);
verifier(
  "l'acronyme est insensible a la casse et aux accents",
  acronyme("ÉCOLE SPÉCIALE DU BÂTIMENT ET DES TRAVAUX PUBLICS"),
  "esbtp",
);
verifier("l'acronyme d'ISLG", acronyme("Institut Supérieur Louis Le Grand"), "islg");
verifier("un nom d'un seul mot n'a pas d'acronyme", acronyme("Ephrata"), "");

/* Le defaut signale : un resultat qu'on ne peut pas expliquer. */
verifier(
  "« universite » ne rend que l'universite",
  noms("universite"),
  ["Université internationale des Sciences Agronomiques et Technologies - USAT Bouaké"],
);

/* Ce qu'un etudiant tape reellement. */
verifier("« esbtp » rend les deux ESBTP", noms("esbtp").length, 2);
verifier(
  "« esbtp abidjan » ne rend que celle d'Abidjan",
  noms("esbtp abidjan"),
  ["Ecole Spéciale du Bâtiment et des Travaux Publics"],
);
verifier(
  "« abidjan esbtp » rend la meme, l'ordre ne compte pas",
  noms("abidjan esbtp"),
  ["Ecole Spéciale du Bâtiment et des Travaux Publics"],
);
verifier("« islg » trouve l'institut", noms("islg"), ["Institut Supérieur Louis Le Grand"]);

/* Les accents, sur un site francophone. */
verifier("« ecole » trouve « ÉCOLE » malgre l'accent", noms("ecole").length, 2);
verifier("« bouake » trouve les villes accentuees", noms("bouake").length, 3);
verifier("« BOUAKÉ » en majuscules accentuees aussi", noms("BOUAKÉ").length, 3);

/* Les bords. */
verifier("une requete vide rend tout", noms("").length, ECOLES.length);
verifier("des espaces seuls rendent tout", noms("   ").length, ECOLES.length);
verifier("une requete sans reponse rend rien", noms("zzz"), []);

console.log("");
if (echecs === 0) {
  console.log("  La regle de recherche se comporte comme prevu.");
} else {
  console.log(`  ${echecs} verification(s) en echec.`);
}
console.log("");

process.exit(echecs > 0 ? 1 : 0);
