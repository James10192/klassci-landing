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

import { CORRECTIONS_CONNUES } from "../lib/email/domaines-suspects.ts";
import { normaliserWhatsapp } from "../lib/email/telephone-whatsapp.ts";
import { verifierCanal } from "../lib/email/verifier-canal.ts";
import { analyserEmail, distanceEdition, refusServeur, suggererEmail } from "../lib/email/verifier-email.ts";
import { lireDemandeVerification, lireMotif, nettoyerCode } from "../lib/portail/verification.ts";
import { preparerVerification } from "../lib/portail/verification-relais.ts";

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

console.log("Suggestion : fautes connues");
for (const [fautif, voulu] of Object.entries(CORRECTIONS_CONNUES)) {
  verifier(`k.yao@${fautif} → k.yao@${voulu}`, suggererEmail(`k.yao@${fautif}`), `k.yao@${voulu}`);
}
verifier("la liste canonique compte 27 fautes", Object.keys(CORRECTIONS_CONNUES).length, 27);
verifier("une faute connue est certaine", analyserEmail("awa@gmail.con").certitude, "certaine");
verifier("le domaine se compare sans casse, la partie locale est gardée", suggererEmail("Kone.Awa@GMAIL.CON"), "Kone.Awa@gmail.com");
verifier("les espaces autour sont ignorés", suggererEmail("  awa@gmial.com "), "awa@gmail.com");

console.log("\nSuggestion : distance d'édition");
verifier("gmaill.com (1 lettre) → gmail.com", suggererEmail("a@gmaill.com"), "a@gmail.com");
verifier("hotmai.fr (1 lettre) → hotmail.fr", suggererEmail("a@hotmai.fr"), "a@hotmail.fr");
verifier("icoud.com (1 lettre) → icloud.com", suggererEmail("a@icoud.com"), "a@icloud.com");
verifier("outlook.fe (1 lettre) → outlook.fr", suggererEmail("a@outlook.fe"), "a@outlook.fr");
verifier("une faute par distance est seulement probable", analyserEmail("a@gmaill.com").certitude, "probable");
verifier("gmaiiil.com (2 lettres) → gmail.com", suggererEmail("a@gmaiiil.com"), "a@gmail.com");
verifier("gmaiiiil.com (3 lettres) : trop loin, rien", suggererEmail("a@gmaiiiil.com"), null);
verifier("distanceEdition(gmail.com, gmial.com) = 2", distanceEdition("gmail.com", "gmial.com"), 2);
verifier("distanceEdition bornée rend plafond + 1", distanceEdition("abcdefgh", "a", 2), 3);

console.log("\nPas de faux positif");
for (const reel of ["gmail.com", "yahoo.fr", "outlook.com", "ymail.com", "mail.com", "email.com", "live.com", "orange.ci", "univ-fhb.edu.ci", "klassci.com"]) {
  verifier(`${reel} est valide`, analyserEmail(`a@${reel}`).statut, "valide");
}

console.log("\nDomaines factices et forme");
for (const factice of ["esbtp.edu.ci", "example.com", "example.org", "test.com", "mail.example.com", "ESBTP.EDU.CI"]) {
  verifier(`${factice} est refusé`, analyserEmail(`etudiant@${factice}`).statut, "factice");
}
verifier("latest.com n'est pas pris pour test.com", analyserEmail("a@latest.com").statut, "valide");
verifier("vide", analyserEmail("   ").statut, "vide");
for (const casse of ["awa", "awa@", "awa@gmail", "@gmail.com", "a wa@gmail.com", "awa@gmail.c"]) {
  verifier(`« ${casse} » est invalide`, analyserEmail(casse).statut, "invalide");
}

console.log("\nRefus côté serveur");
verifier("faute connue refusée", refusServeur("a@yahoo.con"), "faute_de_frappe");
verifier("faute probable acceptée (la personne a pu confirmer)", refusServeur("a@gmaill.com"), null);
verifier("factice refusé", refusServeur("a@esbtp.edu.ci"), "factice");
verifier("adresse correcte acceptée", refusServeur("a@gmail.com"), null);

console.log("\nWhatsApp ivoirien");
verifier("07 07 12 12 34 → +2250707121234", normaliserWhatsapp("07 07 12 12 34"), "+2250707121234");
verifier("+225 05.44.55.66.77 accepté", normaliserWhatsapp("+225 05.44.55.66.77"), "+2250544556677");
verifier("00225 01 02 03 04 05 accepté", normaliserWhatsapp("00225 01 02 03 04 05"), "+2250102030405");
verifier("un fixe (27…) refusé", normaliserWhatsapp("27 22 44 55 66"), null);
verifier("un ancien numéro à 8 chiffres refusé", normaliserWhatsapp("07 12 12 34"), null);

console.log("\nCanal de la candidature (route serveur)");
verifier("e-mail fautif → erreur sur email", verifierCanal({ email: "a@gmail.con", telephone: "0707121234" }), {
  email: ["Cette adresse contient une faute de frappe. Vérifiez le domaine après le @."],
});
verifier("e-mail correct → rien", verifierCanal({ email: "a@gmail.com", telephone: "27 22 44 55 66" }), null);
const sansEmail = { telephone: "07 07 12 12 34" };
verifier("sans e-mail, mobile valide → rien", verifierCanal(sansEmail), null);
verifier("sans e-mail, numéro réécrit au format international", sansEmail.telephone, "+2250707121234");
verifier("sans e-mail, fixe refusé", Object.keys(verifierCanal({ telephone: "27 22 44 55 66" }) ?? {}), ["telephone"]);

console.log("\nVérification : lecture des réponses");
verifier(
  "statut e-mail lu",
  lireDemandeVerification({ statut: "verification_email_requise", demande_id: "d1", email_masque: "k***@gmail.com" }),
  { canal: "email", demandeId: "d1", destination: "k***@gmail.com" },
);
verifier(
  "statut téléphone lu",
  lireDemandeVerification({ statut: "verification_telephone_requise", demande_id: "d2", telephone_masque: "+225 07 ** ** 34" }),
  { canal: "telephone", demandeId: "d2", destination: "+225 07 ** ** 34" },
);
verifier("réponse d'enregistrement classique : pas de vérification", lireDemandeVerification({ enregistre: true }), null);
verifier("statut sans demande_id : ignoré", lireDemandeVerification({ statut: "verification_email_requise", email_masque: "x" }), null);
verifier("motif connu", lireMotif({ verifie: false, motif: "expire" }), "expire");
verifier("motif inconnu → null", lireMotif({ motif: "autre" }), null);
verifier("code collé avec espaces", nettoyerCode(" 123 456 "), "123456");
verifier("code tronqué à 6 chiffres", nettoyerCode("12345678"), "123456");

console.log("\nVérification : corps relayé à l'école");
verifier(
  "code : seuls demande_id, code et canal passent",
  preparerVerification("verifier", { demande_id: "abc-1", code: "123456", canal: "telephone", intrus: "x" }),
  { cle: "verificationVerifier", corps: { demande_id: "abc-1", code: "123456", canal: "telephone" } },
);
verifier(
  "jeton : canal e-mail par défaut",
  preparerVerification("verifier", { jeton: "Abcdefghijklmnop.qrst" }),
  { cle: "verificationVerifier", corps: { jeton: "Abcdefghijklmnop.qrst", canal: "email" } },
);
verifier("code à 5 chiffres refusé avant l'école", preparerVerification("verifier", { demande_id: "a", code: "12345" }), { erreur: "corps_invalide" });
verifier("jeton trop court refusé", preparerVerification("verifier", { jeton: "court" }), { erreur: "corps_invalide" });
verifier(
  "renvoi",
  preparerVerification("renvoyer", { demande_id: "abc-1" }),
  { cle: "verificationRenvoyer", corps: { demande_id: "abc-1", canal: "email" } },
);
verifier("action inconnue", preparerVerification("supprimer", { demande_id: "a" }), { erreur: "action_inconnue" });

console.log(`\n${total - echecs}/${total} vérifications passées`);
if (echecs > 0) {
  process.exit(1);
}
