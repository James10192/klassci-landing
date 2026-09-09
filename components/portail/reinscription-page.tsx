import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/sections/footer";
import type { EtablissementVisible } from "@/lib/portail/tenants";
import type { EtablissementVitrine } from "@/lib/vitrine/etablissements";

import { ListeEtablissements } from "./liste-etablissements";
import { PortailEcole } from "./portail-ecole";
import { PortailHabillage } from "./portail-habillage";
import { ReinscriptionChrome } from "./reinscription-chrome";

/**
 * L'habillage du portail : la barre du site, le parcours, le bloc de confiance,
 * et le pied de page du site.
 *
 * Rendu côté serveur, à une exception près — le parcours lui-même, qui est le
 * seul morceau interactif. Tout le reste arrive avec la page, ce qui compte sur
 * une connexion lente : le visiteur lit pendant que le formulaire s'hydrate.
 *
 * La page porte l'identité de l'établissement : son logo, et les couleurs qu'il
 * a réglées pour ses documents. Ce n'est pas de la décoration. Quelqu'un qui
 * confie son état civil à un formulaire doit voir à qui il l'envoie, et le
 * reconnaître — c'est le même logo que sur son bulletin et sur l'affiche de
 * l'école. Une page identique pour les six écoles obligeait à faire confiance à
 * l'URL, ce que personne ne lit.
 */

/**
 * Exactement l'une des deux formes, jamais les deux, jamais aucune : soit
 * l'école est déterminée et on va droit au formulaire, soit le visiteur doit
 * la choisir. Deux props optionnelles auraient laissé passer « aucune des
 * deux », qui se serait affiché en silence comme « aucun établissement ».
 */
type ProprietesReinscriptionPage = { locale: string } & (
  | {
      etablissement: EtablissementVisible;
      /** Absente quand l'instance n'a pas répondu : la page reste aux couleurs KLASSCI. */
      identite?: EtablissementVitrine | null;
      etablissements?: never;
      identites?: never;
    }
  | {
      etablissements: EtablissementVisible[];
      identites?: Record<string, EtablissementVitrine>;
      etablissement?: never;
      identite?: never;
    }
);

export async function ReinscriptionPage({
  locale,
  etablissement,
  identite,
  etablissements,
  identites,
}: ProprietesReinscriptionPage) {
  if (etablissement) {
    return (
      <PortailHabillage locale={locale} etablissement={etablissement} identite={identite}>
        <PortailEcole etablissement={etablissement} />
      </PortailHabillage>
    );
  }

  const t = await getTranslations({ locale, namespace: "inscription" });

  return (
    <>
      <ReinscriptionChrome />
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
            </header>

            <div className="mt-10">
              <ChoixEtablissement
                locale={locale}
                etablissements={etablissements!}
                identites={identites ?? {}}
              />
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
  identites,
}: {
  locale: string;
  etablissements: EtablissementVisible[];
  identites: Record<string, EtablissementVitrine>;
}) {
  // Espace `inscription`, pas `reinscription` : cet ecran est le premier que
  // voit un NOUVEAU bachelier arrivant par « S'inscrire », et les textes de la
  // reinscription lui disaient « choisissez l'etablissement ou vous etes
  // inscrit cette année », juste sous un titre qui l'accueille comme
  // nouveau. La page entiere a ete reecrite pour les deux publics ; ce bloc
  // avait ete oublie.
  const t = await getTranslations({ locale, namespace: "inscription.etablissement" });

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

      <ListeEtablissements
        locale={locale}
        entrees={etablissements.map((etablissement) => {
          const identite = identites[etablissement.code];

          return {
            code: etablissement.code,
            // Le nom réglé par l'école prime : c'est elle qui sait comment elle
            // s'appelle, et elle le corrige sans passer par nous.
            nom: identite?.nom ?? etablissement.libelle,
            ville: identite?.ville ?? "",
            logo: identite?.logo ?? null,
          };
        })}
        libelles={{
          placeholder: t("recherche.placeholder"),
          etiquette: t("recherche.etiquette"),
          effacer: t("recherche.effacer"),
          resultats: t("recherche.resultats"),
          videTitre: t("recherche.vide.titre"),
          videTexte: t("recherche.vide.texte"),
        }}
      />
    </div>
  );
}
