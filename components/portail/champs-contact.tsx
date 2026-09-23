"use client";

import { useTranslations } from "next-intl";

import { ChampEmail } from "@/components/ui/champ-email";

import type { Formulaire } from "./candidature-champs";
import { Champ, champ } from "./pieces";

/**
 * Les deux coordonnées du candidat, et le canal par lequel on le vérifiera.
 *
 * Toute candidature se confirme avant d'atteindre l'école : par un code envoyé
 * à l'adresse e-mail, ou, pour qui n'en a pas, par WhatsApp au numéro donné.
 * La case « Je n'ai pas d'adresse e-mail » bascule de l'un à l'autre, et le
 * numéro devient alors un mobile ivoirien obligatoire.
 */
export function ChampsContact({
  form,
  set,
  messagesDe,
  tentative,
  longueurs,
  onEmailBloque,
}: {
  form: Formulaire;
  set: (cle: keyof Formulaire) => (valeur: string | boolean) => void;
  messagesDe: (champ: string) => string[] | undefined;
  tentative: boolean;
  longueurs: { telephone: number; email: number };
  onEmailBloque: (bloque: boolean) => void;
}) {
  const t = useTranslations("inscription");
  const tc = useTranslations("canal");

  return (
    <>
      <Champ
        label={form.sans_email ? tc("whatsapp") : t("formulaire.telephone")}
        value={form.telephone}
        onChange={set("telephone")}
        aide={form.sans_email ? tc("whatsappAide") : t("formulaire.telephoneAide")}
        inputMode="tel"
        maxLength={longueurs.telephone}
        erreurs={messagesDe("telephone")}
        autoComplete="tel"
      />

      {!form.sans_email && (
        <div className="mt-3">
          <ChampEmail
            label={t("formulaire.email")}
            value={form.email}
            onChange={set("email")}
            classeChamp={champ}
            maxLength={longueurs.email}
            required
            erreurs={messagesDe("email")}
            forcerMessages={tentative}
            onBlocage={onEmailBloque}
          />
        </div>
      )}

      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-accent-light">
        <input
          type="checkbox"
          checked={form.sans_email}
          onChange={(e) => set("sans_email")(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-border-strong text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <span className="block">
          <span className="block text-sm font-medium">{tc("sansEmail")}</span>
          <span className="mt-0.5 block text-xs leading-snug text-text-muted">{tc("sansEmailAide")}</span>
        </span>
      </label>
    </>
  );
}
