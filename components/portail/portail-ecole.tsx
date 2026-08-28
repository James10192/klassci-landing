"use client";

import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { EtablissementVisible } from "@/lib/portail/tenants";

import { Porte, RESSORT } from "./pieces";
import { FORMULAIRE_VIDE, type Formulaire } from "./candidature-champs";
import { CandidatureFlow } from "./candidature-flow";
import { ReinscriptionFlow } from "./reinscription-flow";

/**
 * Le choix qui ouvre le portail d'une école : nouveau, ou déjà étudiant ?
 *
 * Il est posé en premier parce qu'il détermine tout le reste. Un nouveau
 * bachelier n'a pas de matricule et n'en aura un qu'à son inscription ; lui
 * demander de « retrouver son dossier » l'enverrait chercher un numéro qui
 * n'existe pas. Un ancien, à l'inverse, n'a rien à ressaisir : son dossier est
 * là, il suffit de le retrouver.
 *
 * Les deux parcours vivent sur la même page, sans changement d'URL : on peut
 * se tromper de porte et revenir, ce qui arrive plus souvent qu'on ne croit.
 */

type Parcours = "choix" | "nouveau" | "ancien";

export function PortailEcole({
  etablissement,
}: {
  etablissement: EtablissementVisible;
}) {
  const t = useTranslations("inscription.choix");
  const [parcours, setParcours] = useState<Parcours>("choix");

  // La saisie de la candidature vit ICI, un cran au-dessus de la porte qu'on
  // franchit. `AnimatePresence mode="wait"` démonte le parcours à chaque
  // retour au choix ; garder le formulaire à l'intérieur revenait à effacer
  // vingt-quatre champs dès qu'un pouce effleure « Ce n'est pas mon cas »,
  // bouton posé juste sous celui d'envoi.
  const [form, setForm] = useState<Formulaire>(FORMULAIRE_VIDE);
  const [consentement, setConsentement] = useState(false);

  // « Ce n'est pas mon cas » veut dire « je me suis trompé de porte ». Une fois
  // la demande partie, elle ne veut plus rien dire : la candidature est
  // transmise, la réinscription enregistrée, et repasser par l'autre porte ne
  // les annule pas. L'écran de succès de la réinscription propose d'ailleurs
  // déjà sa propre suite. Les deux parcours signalent donc leur aboutissement,
  // et le bouton disparaît — jusqu'à ce que l'un d'eux reparte de zéro.
  const [abouti, setAbouti] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait" initial={false}>
        {parcours === "choix" && (
          <m.div key="choix" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={RESSORT}>
            <div className="rounded-[20px] bg-bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04),0_16px_40px_-12px_rgba(16,24,40,0.10)] sm:p-8">
              <h2 className="text-balance text-xl font-semibold tracking-tight">{t("titre")}</h2>

              <div className="mt-5 space-y-3">
                <Porte
                  titre={t("nouveau.titre")}
                  texte={t("nouveau.texte")}
                  onClick={() => setParcours("nouveau")}
                />
                <Porte
                  titre={t("ancien.titre")}
                  texte={t("ancien.texte")}
                  onClick={() => setParcours("ancien")}
                />
              </div>
            </div>
          </m.div>
        )}

        {parcours !== "choix" && (
          <m.div key={parcours} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={RESSORT}>
            {parcours === "nouveau" ? (
              <CandidatureFlow
                etablissement={etablissement}
                saisie={{ form, setForm, consentement, setConsentement }}
                onAboutir={setAbouti}
              />
            ) : (
              <ReinscriptionFlow etablissement={etablissement} onAboutir={setAbouti} />
            )}

            {!abouti && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setParcours("choix")}
                  className="min-h-[40px] px-3 text-sm text-text-muted underline-offset-4 transition-colors duration-200 hover:text-text hover:underline"
                >
                  {t("retour")}
                </button>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

