import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/sections/footer";
import type { EtablissementVisible } from "@/lib/portail/tenants";
import type { EtablissementVitrine } from "@/lib/vitrine/etablissements";
import { couleursBandeau, variablesEtablissement } from "@/lib/vitrine/couleurs";

import { Marque } from "./marque-etablissement";
import { ReinscriptionChrome } from "./reinscription-chrome";

function BandeauIdentite({
  identite,
  libelle,
  compact,
}: {
  identite: EtablissementVitrine | null | undefined;
  libelle: string;
  compact?: boolean;
}) {
  const nom = identite?.nom ?? libelle;

  if (!identite) {
    return compact ? null : (
      <p className="mt-5 inline-flex items-center rounded-full bg-accent-light px-3.5 py-1.5 text-sm font-medium text-accent">
        {libelle}
      </p>
    );
  }

  const { fond, encre } = couleursBandeau(identite.identite);

  return (
    <div
      className={
        compact
          ? "flex items-center gap-3 px-5 py-3 text-left"
          : "mx-auto mt-7 flex max-w-xl items-center gap-4 rounded-[20px] px-5 py-4 text-left"
      }
      style={{ backgroundColor: fond, color: encre }}
    >
      <Marque logo={identite.logo} nom={nom} taille={compact ? "liste" : "bandeau"} />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold leading-tight">{nom}</span>
        {!compact && identite.identite.entete !== "" && (
          <span className="mt-1 block truncate text-[13px] opacity-85">
            {identite.identite.entete}
          </span>
        )}
        {!compact && identite.identite.entete === "" && identite.ville !== "" && (
          <span className="mt-1 block truncate text-[13px] opacity-85">{identite.ville}</span>
        )}
      </span>
    </div>
  );
}

export async function PortailHabillage({
  locale,
  etablissement,
  identite,
  eyebrow,
  titre,
  sousTitre,
  dense,
  pied,
  children,
}: {
  locale: string;
  etablissement: EtablissementVisible;
  identite?: EtablissementVitrine | null;
  eyebrow?: string;
  titre?: string;
  sousTitre?: string;
  dense?: boolean;
  pied?: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "inscription" });
  const theme = identite ? variablesEtablissement(identite.identite.couleurPrincipale) : undefined;

  return (
    <>
      <ReinscriptionChrome />
      <main
        className="min-h-screen bg-bg pt-[57px] text-text"
        style={theme}
        data-theme-etablissement={theme ? "" : undefined}
      >
        <div className={`container ${dense ? "py-8 sm:py-10" : "py-14 sm:py-20"}`}>
          <div className="mx-auto max-w-xl">
            {dense ? (
              <>
                <div className="overflow-hidden rounded-[20px] bg-bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04),0_16px_40px_-12px_rgba(16,24,40,0.10)]">
                  <BandeauIdentite identite={identite} libelle={etablissement.libelle} compact />
                  <div className="p-6 sm:p-8">{children}</div>
                </div>
                {pied}
              </>
            ) : (
              <>
                <header className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    {eyebrow ?? t("hero.eyebrow")}
                  </p>
                  <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
                    {titre ?? t("hero.title")}
                  </h1>
                  <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-text-secondary">
                    {sousTitre ?? t("hero.subtitle")}
                  </p>
                  <BandeauIdentite identite={identite} libelle={etablissement.libelle} />
                </header>
                <div className="mt-10">{children}</div>
                {pied}
                <section className="mt-12 rounded-[20px] border border-border p-6">
                  <h2 className="text-sm font-semibold">{t("confiance.titre")}</h2>
                  <ul className="mt-3 space-y-2.5">
                    {[0, 1, 2].map((rang) => (
                      <li key={rang} className="flex gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-pretty text-sm leading-relaxed text-text-secondary">
                          {t(`confiance.points.${rang}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
