#!/usr/bin/env node
/**
 * Vérifie la saisie d'e-mail et la vérification des demandes, en exécutant le code.
 *
 *   node --experimental-strip-types scripts/verifier-email.mjs
 *
 * Ce dépôt n'a pas de lanceur de tests : comme les autres vérificateurs, ce
 * script appelle les fonctions réelles et compare ce qu'elles rendent. Une
 * faute de frappe laissée passer ici, c'est une convocation envoyée à une
 * boîte que personne ne lit.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { filtrerEvenement, filtrerMesureVercel, nettoyerUrl, pageNonMesuree } from "../lib/analytics/confidentialite.ts";
import { CORRECTIONS_CONNUES } from "../lib/email/domaines-suspects.ts";
import { normaliserWhatsapp } from "../lib/email/telephone-whatsapp.ts";
import { verifierCanal } from "../lib/email/verifier-canal.ts";
import { analyserEmail, distanceEdition, emailBloque } from "../lib/email/verifier-email.ts";
import { lireAboutissement, suiteSurPlace } from "../lib/portail/aboutissement.ts";
import { lireDemandeVerification, lireMotif, nettoyerCode, renvoyer, verifier as verifierCode } from "../lib/portail/verification.ts";
import { preparerVerification } from "../lib/portail/verification-relais.ts";

/**
 * Empreinte du fichier de données, partagée avec KLASSCIv2 : SHA-256 du JSON
 * compact, clés dans l'ordre du fichier. Si elle change ici, elle change là-bas.
 */
const EMPREINTE_DONNEES = "3c28ba33a7e1128c1890df821460348f1abf08180822ce4cac5e51b085357eff";

/** La suggestion proposée sous le champ, ou `null`. */
function suggererEmail(brut) {
  const analyse = analyserEmail(brut);
  return analyse.statut === "faute" ? analyse.suggestion : null;
}

let echecs = 0;
let total = 0;

function verifier(intention, obtenu, attendu) {
  total += 1;
  if (JSON.stringify(obtenu) === JSON.stringify(attendu)) {
    console.log(`  ok   ${intention}`);
    return;
  }
  echecs += 1;
  console.log(`  X    ${intention}`);
  console.log(`         attendu : ${JSON.stringify(attendu)}`);
  console.log(`         obtenu  : ${JSON.stringify(obtenu)}`);
}

console.log("Parité du fichier de données avec KLASSCIv2");
const donnees = JSON.parse(readFileSync(new URL("../lib/email/domaines-suspects.json", import.meta.url), "utf8"));
verifier("empreinte SHA-256 du JSON compact", createHash("sha256").update(JSON.stringify(donnees)).digest("hex"), EMPREINTE_DONNEES);
verifier("le fichier reste en ASCII (même octets en PHP)", /^[\x00-\x7f]*$/.test(JSON.stringify(donnees)), true);

console.log("\nSuggestion : fautes connues");
for (const [fautif, voulu] of Object.entries(CORRECTIONS_CONNUES)) {
  verifier(`k.yao@${fautif} → k.yao@${voulu}`, suggererEmail(`k.yao@${fautif}`), `k.yao@${voulu}`);
}
verifier("la liste canonique compte 27 fautes", Object.keys(CORRECTIONS_CONNUES).length, 27);
verifier("une faute connue est certaine", analyserEmail("awa@gmail.con").certitude, "certaine");
verifier("le domaine se compare sans casse, la partie locale est gardée", suggererEmail("Kone.Awa@GMAIL.CON"), "Kone.Awa@gmail.com");
verifier("les espaces autour sont ignorés", suggererEmail("  awa@gmial.com "), "awa@gmail.com");

console.log("\nSuggestion : nom et extension séparés");
verifier("gmaill.com (1 lettre) → gmail.com", suggererEmail("a@gmaill.com"), "a@gmail.com");
verifier("hotmai.fr → hotmail.fr (même extension)", suggererEmail("a@hotmai.fr"), "a@hotmail.fr");
verifier("icoud.com → icloud.com", suggererEmail("a@icoud.com"), "a@icloud.com");
verifier("une faute sur le nom est seulement probable", analyserEmail("a@gmaill.com").certitude, "probable");
verifier("inversion gmali.com → gmail.com (distance 1)", suggererEmail("a@gmali.com"), "a@gmail.com");
verifier("distance OSA : une inversion compte 1", distanceEdition("gmali", "gmail"), 1);
verifier("distance OSA : gmaiiil / gmail = 2", distanceEdition("gmaiiil", "gmail"), 2);
verifier("gmaiiil.com (2) → gmail.com", suggererEmail("a@gmaiiil.com"), "a@gmail.com");
verifier("gmaiiiil.com (3) : trop loin, rien", suggererEmail("a@gmaiiiil.com"), null);
verifier("extension par table : outlook.fe → outlook.fr, certaine", analyserEmail("a@outlook.fe").certitude, "certaine");
verifier("extension par table : hotmail.frr → hotmail.fr", suggererEmail("a@hotmail.frr"), "a@hotmail.fr");
verifier("extension et nom : gmial.con → gmail.com", suggererEmail("a@gmial.con"), "a@gmail.com");
verifier("inconnu.con → inconnu.com (table d'extensions)", suggererEmail("a@inconnu.con"), "a@inconnu.com");

console.log("\nPas de faux positif, jamais de pays remplacé");
for (const reel of ["gmail.com", "yahoo.fr", "outlook.com", "ymail.com", "mail.com", "email.com", "gmx.com", "live.com", "live.ca", "yahoo.de", "hotmail.be", "outlook.es", "orange.ci", "univ-fhb.edu.ci", "klassci.com", "aol.com"]) {
  verifier(`${reel} est valide`, analyserEmail(`a@${reel}`).statut, "valide");
}
verifier("gmail.de n'est pas « corrigé » en gmail.com", suggererEmail("a@gmail.de"), null);
verifier("a@orange.cm (Cameroun) est valide", analyserEmail("a@orange.cm").statut, "valide");
verifier("a@camtel.cm (Cameroun) est valide", analyserEmail("a@camtel.cm").statut, "valide");
verifier("gmail.cm reste une faute connue → gmail.com", suggererEmail("a@gmail.cm"), "a@gmail.com");

console.log("\nDomaines factices et forme");
for (const factice of ["esbtp.edu.ci", "example.com", "example.org", "test.com", "mail.example.com", "ESBTP.EDU.CI"]) {
  verifier(`${factice} est refusé`, analyserEmail(`etudiant@${factice}`).statut, "factice");
}
verifier("latest.com n'est pas pris pour test.com", analyserEmail("a@latest.com").statut, "valide");
verifier("vide", analyserEmail("   ").statut, "vide");
for (const casse of ["awa", "awa@", "awa@gmail", "@gmail.com", "a wa@gmail.com", "awa@gmail.c", "awa@gmail.com.", "awa@gmail..com"]) {
  verifier(`« ${casse} » est invalide`, analyserEmail(casse).statut, "invalide");
}

console.log("\nBlocage (emailBloque), règle commune au champ et au serveur");
verifier("vide : ne bloque pas (le formulaire décide du requis)", emailBloque(analyserEmail(""), false), null);
verifier("invalide bloque", emailBloque(analyserEmail("awa@"), true), "invalide");
verifier("factice bloque même confirmé", emailBloque(analyserEmail("a@test.com"), true), "factice");
verifier("faute certaine bloque même confirmée", emailBloque(analyserEmail("a@gmail.con"), true), "faute_de_frappe");
verifier("faute probable bloque tant qu'elle n'est pas confirmée", emailBloque(analyserEmail("a@gmaill.com"), false), "faute_de_frappe");
verifier("faute probable confirmée passe", emailBloque(analyserEmail("a@gmaill.com"), true), null);
verifier("adresse correcte passe", emailBloque(analyserEmail("a@gmail.com"), false), null);
verifier("serveur : faute probable confirmée acceptée",
  verifierCanal({ email: "a@gmaill.com", telephone: "0707121234", emailConfirme: true }), { telephone: "0707121234" });
verifier("serveur : faute probable non confirmée refusée",
  Object.keys(verifierCanal({ email: "a@gmaill.com", telephone: "0707121234", emailConfirme: false }).erreurs ?? {}), ["email"]);

console.log("\nWhatsApp ivoirien");
verifier("07 07 12 12 34 → +2250707121234", normaliserWhatsapp("07 07 12 12 34"), "+2250707121234");
verifier("+225 05.44.55.66.77 accepté", normaliserWhatsapp("+225 05.44.55.66.77"), "+2250544556677");
verifier("00225 01 02 03 04 05 accepté", normaliserWhatsapp("00225 01 02 03 04 05"), "+2250102030405");
verifier("un fixe (27…) refusé", normaliserWhatsapp("27 22 44 55 66"), null);
verifier("un ancien numéro à 8 chiffres refusé", normaliserWhatsapp("07 12 12 34"), null);

console.log("\nCanal de la candidature (route serveur)");
verifier("e-mail fautif → erreurs sur email",
  Object.keys(verifierCanal({ email: "a@gmail.con", telephone: "0707121234", emailConfirme: false }).erreurs ?? {}), ["email"]);
verifier("e-mail correct → téléphone transmis tel quel",
  verifierCanal({ email: "a@gmail.com", telephone: "27 22 44 55 66", emailConfirme: false }), { telephone: "27 22 44 55 66" });
verifier("sans e-mail, mobile → format international",
  verifierCanal({ telephone: "07 07 12 12 34", emailConfirme: false }), { telephone: "+2250707121234" });
verifier("e-mail vide : le téléphone devient le canal",
  Object.keys(verifierCanal({ email: "  ", telephone: "27 22 44 55 66", emailConfirme: false }).erreurs ?? {}), ["telephone"]);

console.log("\nVérification : lecture des réponses");
verifier("statut e-mail lu",
  lireDemandeVerification({ statut: "verification_email_requise", demande_id: "d1", email_masque: "k***@gmail.com" }),
  { canal: "email", demandeId: "d1", destination: "k***@gmail.com" });
verifier("statut téléphone lu",
  lireDemandeVerification({ statut: "verification_telephone_requise", demande_id: "d2", telephone_masque: "+225 07 ** ** 34" }),
  { canal: "telephone", demandeId: "d2", destination: "+225 07 ** ** 34" });
verifier("réponse d'enregistrement classique : pas de vérification", lireDemandeVerification({ enregistre: true }), null);
verifier("statut sans demande_id : ignoré", lireDemandeVerification({ statut: "verification_email_requise", email_masque: "x" }), null);
verifier("motif connu", lireMotif({ verifie: false, motif: "expire" }), "expire");
verifier("motif inconnu → null", lireMotif({ motif: "autre" }), null);
verifier("code collé avec espaces", nettoyerCode(" 123 456 "), "123456");
verifier("code tronqué à 6 chiffres", nettoyerCode("12345678"), "123456");
verifier("aboutissement lu sans transtypage",
  lireAboutissement({ reference_publique: "C-12", inscriptions_physiques: { debut: "2026-10-01", ouvertes: false } }),
  { reference: "C-12", physiques: { debut: "2026-10-01", ouvertes: false } });
verifier("aboutissement mal formé : rien n'est cru",
  lireAboutissement({ reference_publique: 12, inscriptions_physiques: { debut: 3, ouvertes: "oui" } }),
  { reference: null, physiques: null });
verifier("date d'accueil mal formée : ignorée",
  lireAboutissement({ inscriptions_physiques: { debut: "1er octobre", ouvertes: false } }).physiques, null);
verifier("date d'accueil avec heure : ignorée",
  lireAboutissement({ inscriptions_physiques: { debut: "2026-10-01T08:00:00Z", ouvertes: false } }).physiques, null);
verifier("suite sur place, guichet ouvert", suiteSurPlace({ debut: "2026-10-01", ouvertes: true }, "fr").cle, "surPlaceOuvert");

console.log("\nVérification : corps relayé à l'école");
verifier("code : seuls demande_id, code et canal passent",
  preparerVerification("verifier", { demande_id: "abc-1", code: "123456", canal: "telephone", intrus: "x" }),
  { chemin: "api/portail/email/verifier", corps: { demande_id: "abc-1", code: "123456", canal: "telephone" } });
verifier("canal absent → email",
  preparerVerification("verifier", { jeton: "Abcdefghijklmnop.qrst" }),
  { chemin: "api/portail/email/verifier", corps: { jeton: "Abcdefghijklmnop.qrst", canal: "email" } });
verifier("canal hors énumération → refusé, sans repli",
  preparerVerification("verifier", { jeton: "Abcdefghijklmnop.qrst", canal: "sms" }), { erreur: "corps_invalide" });
verifier("code à 5 chiffres refusé avant l'école", preparerVerification("verifier", { demande_id: "a", code: "12345" }), { erreur: "corps_invalide" });
verifier("jeton trop court refusé", preparerVerification("verifier", { jeton: "court" }), { erreur: "corps_invalide" });
verifier("renvoi", preparerVerification("renvoyer", { demande_id: "abc-1" }),
  { chemin: "api/portail/email/renvoyer", corps: { demande_id: "abc-1", canal: "email" } });
verifier("action inconnue", preparerVerification("supprimer", { demande_id: "a" }), { erreur: "action_inconnue" });

console.log("\nVérification : appels réseau (fetch simulé)");
const appels = [];
function simuler(statut, corps) {
  globalThis.fetch = async (url, init) => {
    appels.push({ url, corps: JSON.parse(init.body) });
    if (statut === "panne") throw new TypeError("réseau coupé");
    return new Response(corps === undefined ? "" : JSON.stringify(corps), { status: statut });
  };
}
simuler(200, { verifie: true, type: "candidature" });
verifier("code juste → vérifié", (await verifierCode("esbtp", "email", { demande_id: "d1", code: "123456" })).genre, "verifie");
verifier("l'appel part au relais du site, canal dans le corps",
  appels.at(-1), { url: "/api/verification/esbtp/verifier", corps: { demande_id: "d1", code: "123456", canal: "email" } });
simuler(422, { verifie: false, motif: "expire", demande_id: "d1" });
verifier("expiré → motif et demandeId exposés",
  await verifierCode("esbtp", "email", { jeton: "x".repeat(20) }), { genre: "refuse", motif: "expire", demandeId: "d1" });
simuler(422, { verifie: false, motif: "nouveau_motif" });
verifier("motif inconnu → null", (await verifierCode("esbtp", "email", { demande_id: "d1", code: "111111" })).motif, null);
simuler(429, {});
verifier("429 → trop de tentatives", (await verifierCode("esbtp", "telephone", { demande_id: "d1", code: "111111" })).genre, "tropDeTentatives");
simuler(200, { verifie: false });
verifier("200 sans verifie:true n'est pas un succès", (await verifierCode("esbtp", "email", { demande_id: "d1", code: "111111" })).genre, "indisponible");
simuler("panne");
verifier("réseau coupé → indisponible", (await verifierCode("esbtp", "email", { demande_id: "d1", code: "111111" })).genre, "indisponible");
simuler(202);
verifier("renvoi accepté (202)", await renvoyer("esbtp", "telephone", "d1"), "envoye");
verifier("renvoi : canal transmis", appels.at(-1).corps, { demande_id: "d1", canal: "telephone" });
simuler(429);
verifier("renvoi trop tôt (429)", await renvoyer("esbtp", "email", "d1"), "tropTot");
simuler(503);
verifier("renvoi en panne", await renvoyer("esbtp", "email", "d1"), "indisponible");

console.log("\nMesure d'audience : rien de sensible ne sort");
verifier("la page de vérification n'est pas mesurée", pageNonMesuree("/verification-email"), true);
verifier("ni sa version anglaise", pageNonMesuree("/en/verification-email"), true);
verifier("les autres pages le sont", pageNonMesuree("/inscription/universite/esbtp"), false);
verifier("jeton et fragment retirés d'une adresse",
  nettoyerUrl("https://www.klassci.com/x?ecole=a&jeton=secret&code=123456#jeton=secret"), "https://www.klassci.com/x?ecole=a");
verifier("$pageleave de la page de vérification jeté",
  filtrerEvenement({ properties: { $current_url: "https://www.klassci.com/verification-email?ecole=a", $pathname: "/verification-email" } }), null);
verifier("référent nettoyé sur les autres pages",
  filtrerEvenement({ properties: { $current_url: "https://www.klassci.com/", $referrer: "https://www.klassci.com/x?jeton=s" } }).properties.$referrer,
  "https://www.klassci.com/x");

verifier("Vercel : la page de vérification n'est pas mesurée",
  filtrerMesureVercel({ type: "pageview", url: "https://www.klassci.com/en/verification-email?ecole=a#jeton=s" }), null);
verifier("Vercel : les autres adresses partent nettoyées",
  filtrerMesureVercel({ type: "pageview", url: "https://www.klassci.com/x?jeton=s&a=1" }), { type: "pageview", url: "https://www.klassci.com/x?a=1" });
verifier("une adresse illisible ne fait pas planter le filtre",
  filtrerMesureVercel({ type: "pageview", url: "http://[" }) !== undefined, true);

console.log(`\n${total - echecs}/${total} vérifications passées`);
if (echecs > 0) {
  process.exit(1);
}
