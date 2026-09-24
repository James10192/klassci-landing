"use client";

import { useCallback, useRef, useState } from "react";

import { lireAboutissement, type Physiques } from "@/lib/portail/aboutissement";
import { suiteReponse, type DemandeVerification } from "@/lib/portail/verification";

import { chargerCreneau, type CreneauAttribue } from "./candidature-ecrans";

/**
 * Ce qui suit l'envoi d'une demande, commun à la candidature et à la réinscription.
 *
 * L'école répond de deux façons à une demande acceptée : elle l'enregistre, ou
 * elle exige d'abord que le contact soit vérifié (code par e-mail ou WhatsApp).
 * Dans les deux cas, la fin est la même : une référence, des dates d'accueil,
 * éventuellement un créneau. Les deux parcours écrivaient cette fin chacun de
 * son côté ; elle ne vit plus qu'ici.
 */

export type Abouti = { reference: string | null; physiques: Physiques | null; creneau: CreneauAttribue | null };

export type SuiviDemande = {
  verification: DemandeVerification | null;
  abouti: Abouti | null;
  /**
   * La réponse d'un envoi accepté (2xx). Rend `true` si elle a été prise en
   * charge : vérification demandée, ou dossier enregistré (`enregistre`).
   * `false` laisse le parcours dire ce qu'il sait d'un refus.
   */
  recevoir: (corps: Record<string, unknown>, enregistre: boolean) => Promise<boolean>;
  /** Le dossier est enregistré : directement, ou après vérification. */
  conclure: (corps: Record<string, unknown>) => Promise<void>;
  /** Abandonne la vérification en cours, pour corriger l'adresse ou le numéro. */
  abandonnerVerification: () => void;
  reinitialiser: () => void;
};

export function useSuiviDemande({
  ecole,
  dateNaissance,
  onAbouti,
}: {
  ecole: string;
  /** Date ISO : le créneau attribué se lit avec la référence ET la date de naissance. */
  dateNaissance: string;
  onAbouti: () => void;
}): SuiviDemande {
  const [verification, setVerification] = useState<DemandeVerification | null>(null);
  const [abouti, setAbouti] = useState<Abouti | null>(null);
  // La réponse de création, gardée pendant la vérification : la demande est
  // déjà chez l'école et c'est elle qui porte la référence publique.
  const creation = useRef<Record<string, unknown>>({});

  const conclure = useCallback(
    async (corps: Record<string, unknown>) => {
      const { reference, physiques } = lireAboutissement({ ...creation.current, ...corps });
      const creneau = reference === null ? null : await chargerCreneau(ecole, reference, dateNaissance);

      setVerification(null);
      setAbouti({ reference, physiques, creneau });
      onAbouti();
    },
    [dateNaissance, ecole, onAbouti],
  );

  const recevoir = useCallback(
    async (corps: Record<string, unknown>, enregistre: boolean) => {
      const suite = suiteReponse(corps, enregistre);

      if (suite.genre === "nonTraitee") return false;

      if (suite.genre === "verification") {
        creation.current = corps;
        setVerification(suite.demande);
        return true;
      }

      await conclure(corps);

      return true;
    },
    [conclure],
  );

  const abandonnerVerification = useCallback(() => setVerification(null), []);
  const reinitialiser = useCallback(() => {
    creation.current = {};
    setVerification(null);
    setAbouti(null);
  }, []);

  return { verification, abouti, recevoir, conclure, abandonnerVerification, reinitialiser };
}

