import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Footer } from "@/components/sections/footer";
import type { EtablissementVisible } from "@/lib/portail/tenants";
import type { EtablissementVitrine } from "@/lib/vitrine/etablissements";
import {
  texteLisibleSur,
  tropClairePourUnFond,
  variablesEtablissement,
} from "@/lib/vitrine/couleurs";

import { ListeEtablissements } from "./liste-etablissements";
import { Marque } from "./marque-etablissement";
import { ReinscriptionChrome } from "./reinscription-chrome";
import { PortailEcole } from "./portail-ecole";

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

/**
 * Le bandeau d'identité, aux couleurs que l'école a réglées pour ses PDF.
 *
 * La couleur du texte n'est pas choisie ici : KLASSCI l'a calculée contre le
 * fond selon le contraste WCAG, et la recalculer de ce côté ferait diverger le
 * document imprimé et la page web.
 */
function BandeauIdentite({
  identite,
  libelle,
}: {
  identite: EtablissementVitrine | null | undefined;
  libelle: string;
}) {
  const nom = identite?.nom ?? libelle;

  if (!identite) {
    // Sans identité, on garde la pastille sobre d'origine : mieux vaut un
    // rappel discret du nom qu'un bandeau aux couleurs de KLASSCI présenté
    // comme celles de l'école.
    return (
      <p className="mt-5 inline-flex items-center rounded-full bg-accent-light px-3.5 py-1.5 text-sm font-medium text-accent">
        {libelle}
      </p>
    );
  }

  // Le fond réglé par l'école, sauf s'il est trop clair pour se distinguer du
  // fond de page. Trois écoles sur six ont laissé `bandeau_fond` en blanc —
  // c'est la valeur par défaut des PDF, et sur du papier elle est juste : la
  // feuille a un bord, le bandeau se lit. À l'écran, ce même blanc posé sur un
  // fond presque blanc ne montre rien du tout : l'étudiant voyait une carte
  // vide là où on voulait lui dire « vous êtes chez votre école ».
  //
  // Dans ce cas seulement, on prend la couleur principale de l'établissement —
  // celle-là même qui teinte déjà les boutons de la page — et on recalcule le
  // texte, la valeur reçue ayant été calculée contre un fond blanc qui n'est
  // plus celui-ci.
  const fondRegle = identite.identite.bandeauFond;
  const substitue = tropClairePourUnFond(fondRegle);
  const fond = substitue ? identite.identite.couleurPrincipale : fondRegle;
  const encre = substitue ? texteLisibleSur(fond) : identite.identite.bandeauTexte;

  return (
    <div
      className="mx-auto mt-7 flex max-w-xl items-center gap-4 rounded-[20px] px-5 py-4 text-left"
      style={{ backgroundColor: fond, color: encre }}
    >
      <Marque logo={identite.logo} nom={nom} taille="bandeau" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold leading-tight">{nom}</span>
        {identite.identite.entete !== "" && (
          <span className="mt-1 block truncate text-[13px] opacity-85">
            {identite.identite.entete}
          </span>
        )}
        {identite.identite.entete === "" && identite.ville !== "" && (
          <span className="mt-1 block truncate text-[13px] opacity-85">{identite.ville}</span>
        )}
      </span>
    </div>
  );
}

export async function ReinscriptionPage({
  locale,
  etablissement,
  identite,
  etablissements,
  identites,
}: ProprietesReinscriptionPage) {
  const t = await getTranslations({ locale, namespace: "inscription" });

  // Les commandes du formulaire prennent la couleur de l'école. Tout le portail
  // est écrit avec les jetons `accent` : trois variables redéfinies ici le
  // repeignent en entier, sans qu'aucun composant n'ait à savoir qu'une école
  // a des couleurs.
  const theme = identite ? variablesEtablissement(identite.identite.couleurPrincipale) : undefined;

  return (
    <>
      <ReinscriptionChrome />

      {/* pt-[57px] : la barre est fixe, le contenu commence dessous.
          Le theme est pose sur `main`, et non sur le seul conteneur du
          contenu : le pied de page tire son fond de `--footer-bg`, defini
          comme `var(--accent)`. Hors du conteneur, il ne voyait pas la couleur
          de l'ecole — une page entiere aux couleurs de l'ESBTP se terminait
          par un aplat bleu KLASSCI, et la rupture se voyait plus que
          l'habillage. */}
      <main
        className="min-h-screen bg-bg pt-[57px] text-text"
        style={theme}
        data-theme-etablissement={theme ? "" : undefined}
      >
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
                <BandeauIdentite identite={identite} libelle={etablissement.libelle} />
              )}
            </header>

            <div className="mt-10">
              {etablissement ? (
                <PortailEcole etablissement={etablissement} />
              ) : (
                <ChoixEtablissement
                  locale={locale}
                  etablissements={etablissements!}
                  identites={identites ?? {}}
                />
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
