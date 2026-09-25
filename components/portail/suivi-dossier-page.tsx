"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Carte } from "./pieces";
import { RendezVousFlow } from "./rendez-vous-flow";
import { SuiviDossierFlow } from "./suivi-dossier-flow";

type Ecole = { code: string; libelle: string };

/**
 * La page « Suivre mon dossier », ouverte depuis le lien d'un e-mail : le suivi,
 * et le rendez-vous sur la meme page, sans faire ressaisir l'identite.
 */
export function SuiviDossierPage({ etablissement }: { etablissement: Ecole }) {
  const t = useTranslations("inscription.rdv");
  const [rdv, setRdv] = useState<{ reference: string; naissance: string } | null>(null);

  return (
    <>
      <div hidden={rdv !== null}>
        <Carte>
          <SuiviDossierFlow
            etablissement={etablissement}
            onOuvrirRdv={(reference, naissance) => setRdv({ reference, naissance })}
            sansTitre
          />
        </Carte>
      </div>
      {rdv !== null && (
        <>
          <Carte>
            <RendezVousFlow etablissement={etablissement} referenceInitiale={rdv.reference} naissanceInitiale={rdv.naissance} />
          </Carte>
          <p className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setRdv(null)}
              className="min-h-[40px] px-3 text-sm text-text-muted underline-offset-4 transition-colors duration-200 hover:text-text hover:underline"
            >
              {t("retour")}
            </button>
          </p>
        </>
      )}
    </>
  );
}
