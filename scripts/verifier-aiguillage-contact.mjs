#!/usr/bin/env node
/**
 * Vérifie le tri du formulaire de contact, en exécutant le code.
 *
 *   node --experimental-strip-types scripts/verifier-aiguillage-contact.mjs
 *
 * Deux erreurs coûtent, et pas le même prix : un étudiant qui passe écrit à
 * KLASSCI et attend une réponse qui ne viendra pas ; un directeur arrêté perd
 * un clic. Les deux listes ci-dessous tiennent les deux bords.
 */

import { semblePortailEtudiant } from "../lib/contact-aiguillage.ts";

const ETUDIANTS = [
  "Bonjour je veux faire mon inscription en BTS",
  "Je n'ai pas reçu ma convocation",
  "Comment retrouver mon rendez-vous ?",
  "Je suis déjà inscrit mais je ne vois pas mon matricule",
  "Je voudrais m’inscrire en licence 1",
  "Pour ma réinscription en deuxième année",
  "Mon fils veut s'inscrire",
  "Je suis étudiant à l'ESBTP",
  "I am a student, where is my appointment?",
];

const ETABLISSEMENTS = [
  "Nous souhaitons une démonstration pour la gestion des inscriptions et des notes.",
  "Groupe scolaire de 1200 élèves, intéressé par le module de réinscription en ligne.",
  "Combien coûte la licence pour une école de BTS ?",
  "Nous gérons les convocations et rendez-vous de nos étudiants à la main.",
  "",
  "We would like a demo for our university.",
];

const ennuis = [];
for (const texte of ETUDIANTS) {
  if (!semblePortailEtudiant(texte)) ennuis.push(`non reconnu comme étudiant : « ${texte} »`);
}
for (const texte of ETABLISSEMENTS) {
  if (semblePortailEtudiant(texte)) ennuis.push(`établissement arrêté à tort : « ${texte} »`);
}

if (ennuis.length > 0) {
  console.error("✗ Aiguillage du contact :\n  " + ennuis.join("\n  "));
  process.exit(1);
}
console.log(`✓ Aiguillage du contact : ${ETUDIANTS.length} messages d'étudiants reconnus, ${ETABLISSEMENTS.length} d'établissements laissés passer.`);
