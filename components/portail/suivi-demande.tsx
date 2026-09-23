"use client";

import { useCallback, useState } from "react";

import { lireAboutissement, type Physiques } from "@/lib/portail/aboutissement";
import { lireDemandeVerification, type DemandeVerification } from "@/lib/portail/verification";

import { chargerCreneau, type CreneauAttribue } from "./candidature-ecrans";
import { VerificationCode } from "./verification-code";

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
  /** La réponse d'un envoi accepté (2xx) : vérification demandée, ou dossier enregistré. */
  recevoir: (corps: Record<string, unknown>) => Promise<void>;
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

  const conclure = useCallback(
    async (corps: Record<string, unknown>) => {
      const { reference, physiques } = lireAboutissement(corps);
      const creneau = reference === null ? null : await chargerCreneau(ecole, reference, dateNaissance);

      setVerification(null);
      setAbouti({ reference, physiques, creneau });
      onAbouti();
    },
    [dateNaissance, ecole, onAbouti],
  );

  const recevoir = useCallback(
    async (corps: Record<string, unknown>) => {
      const demande = lireDemandeVerification(corps);

      if (demande !== null) {
        setVerification(demande);
        return;
      }

      await conclure(corps);
    },
    [conclure],
  );

  const abandonnerVerification = useCallback(() => setVerification(null), []);
  const reinitialiser = useCallback(() => {
    setVerification(null);
    setAbouti(null);
  }, []);

  return { verification, abouti, recevoir, conclure, abandonnerVerification, reinitialiser };
}

/**
 * L'écran de vérification, branché sur le suivi d'une demande.
 *
 * `onModifier` est absent en réinscription : l'adresse y vient du dossier de
 * l'école, pas d'une saisie qu'on pourrait corriger.
 */
export function EtapeVerification({
  ecole,
  demande,
  suivi,
  onModifier,
}: {
  ecole: string;
  demande: DemandeVerification;
  suivi: SuiviDemande;
  onModifier?: () => void;
}) {
  return (
    <VerificationCode
      ecole={ecole}
      demande={demande}
      onVerifie={(corps) => void suivi.conclure(corps)}
      onModifier={onModifier}
    />
  );
}
