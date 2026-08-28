/**
 * Vérifie l'amortisseur du relais, en l'exécutant.
 *
 *   node --experimental-strip-types --conditions=react-server scripts/verifier-amortisseur.mjs
 *
 * Ce dépôt n'a aucun lanceur de tests, et l'amortisseur est la pièce qui empêche
 * le relais de devenir un amplificateur vers les instances des écoles. La laisser
 * sans vérification au motif qu'il n'y a pas de cadre pour en écrire une revenait
 * à ne pas la vérifier du tout. Node suffit : le module est pur, sans dépendance
 * et sans état partagé hors de sa mémoire.
 *
 * `--conditions=react-server` est nécessaire : le module porte `server-only`, dont
 * la résolution par défaut, hors serveur, refuse l'import. C'est le marqueur qui
 * fait son travail — on lui dit ici qu'on est bien côté serveur.
 *
 * Ce script ne remplace pas un cadre de tests. Il évite qu'une pièce chargée
 * d'absorber une rafale ne soit jamais exercée avant de la rencontrer.
 */

import assert from "node:assert/strict";

const { debitDepasse, lectureEnCache, retenirLecture, tailleRetenue } = await import(
  "../lib/portail/amortisseur.ts"
);

const verifs = [];
const verifier = (nom, corps) => verifs.push([nom, corps]);

// Un instant fixe : le module reçoit l'heure en paramètre, jamais de `Date.now()`
// interne. C'est ce qui rend ces vérifications possibles sans attendre.
const T = 1_000_000;

verifier("le plafond laisse passer N appels et refuse le suivant", () => {
  let refuses = 0;

  for (let i = 0; i <= 30; i++) {
    if (debitDepasse("choix:1.2.3.4", 30, T)) refuses += 1;
  }

  assert.equal(refuses, 1);
});

verifier("la fenêtre se rouvre à la minute suivante", () => {
  assert.equal(debitDepasse("choix:1.2.3.4", 30, T + 60_001), false);
});

verifier("chaque adresse a son propre seau", () => {
  assert.equal(debitDepasse("choix:9.9.9.9", 30, T), false);
});

verifier("un échec de l'école n'est jamais mis en cache", () => {
  retenirLecture("ecole:choix", { statut: 503, corps: "{}", type: "application/json" }, T);
  assert.equal(lectureEnCache("ecole:choix", T), null);
});

verifier("un succès est resservi, puis expire", () => {
  retenirLecture("ecole:choix", { statut: 200, corps: '{"ok":1}', type: "application/json" }, T);
  assert.equal(lectureEnCache("ecole:choix", T)?.corps, '{"ok":1}');
  assert.equal(lectureEnCache("ecole:choix", T + 60_001), null);
});

verifier("au-dessus du seuil, la purge s'espace mais finit par rendre la mémoire", () => {
  // Deux propriétés opposées, et il faut les deux : une purge conditionnée à la
  // seule taille balayait toute la table à CHAQUE appel une fois le seuil
  // franchi — donc au moment précis où l'amortisseur sert ; un intervalle réglé
  // trop large, lui, laisserait la table ne jamais redescendre.
  for (let i = 0; i < 6_000; i++) debitDepasse(`charge:${i}`, 30, T);

  const remplie = tailleRetenue().seaux;
  assert.ok(remplie >= 6_000, `table remplie : ${remplie} entrées`);

  // Juste après, rien n'a expiré : la table ne doit pas maigrir.
  debitDepasse("charge:0", 30, T + 1);
  assert.equal(tailleRetenue().seaux, remplie, "aucune entrée ne disparaît avant son expiration");

  // Une fois les fenêtres expirées ET l'intervalle de purge écoulé, un seul
  // appel suffit à rendre la mémoire.
  debitDepasse("declencheur", 30, T + 120_000);

  const apres = tailleRetenue().seaux;
  assert.ok(apres < 100, `table purgée : ${apres} entrées restantes`);
});

let echecs = 0;

for (const [nom, corps] of verifs) {
  try {
    corps();
    console.log(`ok   ${nom}`);
  } catch (erreur) {
    echecs += 1;
    console.error(`ÉCHEC ${nom}\n     ${erreur.message}`);
  }
}

console.log(`\n${verifs.length - echecs}/${verifs.length} vérifications passent.`);
process.exit(echecs === 0 ? 0 : 1);
