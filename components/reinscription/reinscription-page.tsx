import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Footer } from "@/components/sections/footer";
import type { EtablissementReinscription } from "@/lib/reinscription/tenants";

import { ReinscriptionChrome } from "./reinscription-chrome";
import { ReinscriptionFlow } from "./reinscription-flow";

/**
 * L'habillage du portail : la barre du site, le parcours, le bloc de confiance,
 * et le pied de page du site.
 *
 * Rendu côté serveur, à une exception près — le parcours lui-même, qui est le
 * seul morceau interactif. Tout le reste arrive avec la page, ce qui compte sur
 * une connexion lente : le visiteur lit pendant que le formulaire s'hydrate.
 */

/**
 * Exactement l'une des deux formes, jamais les deux, jamais aucune : soit
 * l'école est déterminée et on va droit au formulaire, soit le visiteur doit
 * la choisir. Deux props optionnelles auraient laissé passer « aucune des
 * deux », qui se serait affiché en silence comme « aucun établissement ».
 */
type ProprietesReinscriptionPage = { locale: string } & (
  | { etablissement: EtablissementReinscription; etablissements?: never }
  | { etablissements: EtablissementReinscription[]; etablissement?: never }
);

export async function ReinscriptionPage({
  locale,
  etablissement,
  etablissements,
}: ProprietesReinscriptionPage) {
  const t = await getTranslations({ locale, namespace: "reinscription" });

  return (
    <>
      <ReinscriptionChrome />

      {/* pt-[57px] : la barre est fixe, le contenu commence dessous. */}
      <main className="min-h-screen bg-bg pt-[57px] text-text">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-xl">
            <header className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {t("hero.eyebrow")}
              </p>
              <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-text-secondary">
                {t("hero.subtitle")}
              </p>
              {etablissement && (
                <p className="mt-5 inline-flex items-center rounded-full bg-accent-light px-3.5 py-1.5 text-sm font-medium text-accent">
                  {etablissement.libelle}
                </p>
              )}
            </header>

            <div className="mt-10">
              {etablissement ? (
                <ReinscriptionFlow etablissement={etablissement} />
              ) : (
                <ChoixEtablissement locale={locale} etablissements={etablissements!} />
              )}
            </div>

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
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

async function ChoixEtablissement({
  locale,
  etablissements,
}: {
  locale: string;
  etablissements: EtablissementReinscription[];
}) {
  const t = await getTranslations({ locale, namespace: "reinscription.choix" });

  if (etablissements.length === 0) {
    return (
      <div className="rounded-[20px] bg-bg-card p-6 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04)] sm:p-8">
        <p className="text-balance font-semibold">{t("aucun.titre")}</p>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-text-secondary">
          {t("aucun.texte")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04),0_16px_40px_-12px_rgba(16,24,40,0.10)] sm:p-8">
      <h2 className="text-balance text-xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="mt-1.5 text-pretty text-sm text-text-secondary">{t("aide")}</p>

      <ul className="mt-5 space-y-2">
        {etablissements.map((etablissement) => (
          <li key={etablissement.code}>
            <Link
              href={`/${locale}/reinscription/${etablissement.code}`}
              className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-[border-color,background-color,scale] duration-200 hover:border-accent hover:bg-accent-light active:scale-[0.96]"
            >
              <span className="font-medium">{etablissement.libelle}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-text-muted"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
