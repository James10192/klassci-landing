"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

import type { CreneauAttribue } from "./candidature-ecrans";
import { Carte, PastilleSucces, entree } from "./pieces";

/**
 * L'écran de fin de la réinscription.
 *
 * Sorti du parcours, qui passait la limite de taille de ce dépôt : cet écran
 * ne lit aucun état, il affiche ce que le parcours lui passe.
 */
export function ReinscriptionSucces({
  suiteDuParcours,
  reference,
  creneau,
  onChoisirCreneau,
  onRecommencer,
}: {
  suiteDuParcours: string;
  reference: string | null;
  creneau: CreneauAttribue | null;
  onChoisirCreneau?: () => void;
  onRecommencer: () => void;
}) {
  const t = useTranslations("reinscription");

  return (
    <Carte>
      <PastilleSucces />

      <m.h2
        {...entree(1)}
        className="mt-5 text-balance text-center text-xl font-semibold tracking-tight text-text"
      >
        {t("succes.titre")}
      </m.h2>
      <m.p
        {...entree(2)}
        className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary"
      >
        {t("succes.texte")}
      </m.p>
      {/* Ce qui reste à faire, et il en reste. La phrase précédente
          disait « aucune démarche supplémentaire n'est nécessaire » :
          c'était faux, les frais se règlent au guichet. */}
      <m.p
        {...entree(2)}
        className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary"
      >
        {suiteDuParcours}
      </m.p>
      {reference !== null && (
        <m.p {...entree(3)} className="mt-4 text-center text-sm font-semibold tracking-wide">
          {t("succes.reference", { reference })}
        </m.p>
      )}
      {creneau !== null && creneau.date !== "" && (
        <m.p {...entree(4)} className="mt-4 text-center text-sm font-semibold tracking-wide">
          {t("succes.creneau", {
            jour: creneau.date,
            debut: creneau.heure_debut,
            fin: creneau.heure_fin,
          })}
        </m.p>
      )}
      {creneau !== null && (
        <m.p {...entree(5)} className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary">
          {t("succes.mail")}
        </m.p>
      )}
      {onChoisirCreneau !== undefined && (
        <m.p {...entree(6)} className="mt-4 text-center">
          <button
            type="button"
            onClick={onChoisirCreneau}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white"
          >
            {t("succes.rdv")}
          </button>
        </m.p>
      )}
      <m.p
        {...entree(5)}
        className="mt-4 rounded-xl bg-bg-alt p-3 text-pretty text-center text-xs leading-relaxed text-text-muted"
      >
        {t("succes.rappel")}
      </m.p>

      <m.div {...entree(4)} className="mt-5 text-center">
        <button
          type="button"
          onClick={onRecommencer}
          className="min-h-[44px] px-3 text-sm text-accent underline-offset-4 transition-colors duration-200 hover:underline"
        >
          {t("succes.action")}
        </button>
      </m.div>
    </Carte>
  );
}
