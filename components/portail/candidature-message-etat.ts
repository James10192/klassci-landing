"use client";

import { useLocale, useTranslations } from "next-intl";

import { dateLisible, type Physiques } from "@/lib/portail/aboutissement";

import type { CleEtat } from "./candidature-ecrans";

/**
 * Les deux refus qui envoient SUR PLACE, et qui méritent donc la date.
 *
 * Ils s'adressent à quelqu'un dont le dossier est déjà accepté, l'audience
 * exacte de cette date. Le serveur la joint à ces deux réponses-là et à aucune
 * autre ; la liste est ici pour que l'ajout d'un troisième se voie.
 */
const REFUS_SUR_PLACE: readonly CleEtat[] = ["dejaTraitee", "accepteePourUnAutre"];

/**
 * Le bandeau d'état de la candidature, résolu dans l'espace `inscription`.
 *
 * Résolu ici, où l'espace de messages est écrit en dur : c'est la seule façon
 * pour next-intl de vérifier que la clé existe vraiment.
 *
 * La date d'accueil n'est ajoutée qu'aux deux refus « déjà accepté », et SANS
 * l'impératif de l'écran de confirmation. Ces refus parlent à deux personnes :
 * celle dont c'est le dossier, et le cadet qui emprunte le téléphone du foyer.
 * L'impératif enverrait le second se déplacer pour rien.
 */
export function useMessageEtat(
  etat: CleEtat | null,
  physiques: Physiques | null,
): { cle: string; titre: string; texte: string } | null {
  const t = useTranslations("inscription");
  const locale = useLocale();

  if (etat === null) return null;

  const texte = t(`etats.${etat}.texte`);
  if (!REFUS_SUR_PLACE.includes(etat) || physiques === null || physiques.debut === null) {
    return { cle: etat, titre: t(`etats.${etat}.titre`), texte };
  }

  const constat = physiques.ouvertes
    ? t("etats.surPlaceOuvert")
    : t("etats.surPlaceDate", { date: dateLisible(physiques.debut, locale) });

  return { cle: etat, titre: t(`etats.${etat}.titre`), texte: `${texte} ${constat}` };
}
