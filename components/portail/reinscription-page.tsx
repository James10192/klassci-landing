import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Footer } from "@/components/sections/footer";
import type { EtablissementVisible } from "@/lib/portail/tenants";
import type { EtablissementVitrine } from "@/lib/vitrine/etablissements";
import { variablesEtablissement } from "@/lib/vitrine/couleurs";

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

function initiales(nom: string): string {
  const mots = nom
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (mots.length === 0) return "?";
  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase();

  return (mots[0][0] + mots[mots.length - 1][0]).toUpperCase();
}

/**
 * Le logo de l'école, ou ses initiales.
 *
 * Le logo est posé sur une tuile blanche, y compris dans le bandeau coloré :
 * les logos d'école sont presque toujours dessinés pour du papier blanc, et
 * beaucoup deviennent illisibles posés à même une couleur soutenue.
 *
 * **La tuile est rectangulaire, et c'est le point.** Elle était carrée, de
 * quarante pixels moins six de marge intérieure : vingt-huit pixels de côté.
 * Or un logo d'établissement n'est presque jamais un carré — ceux que servent
 * les instances font 185 × 141, 412 × 142, 600 × 360. `object-contain` dans un
 * carré de vingt-huit pixels réduisait le logo de l'USAT à une bande de vingt-
 * huit sur dix : présente dans le HTML, chargée, visible au sens du navigateur,
 * et illisible pour un être humain. La donnée était juste de bout en bout ;
 * c'est l'affichage qui la perdait.
 *
 * Le rapport 4:3 retenu laisse respirer un mot-symbole sans déformer un
 * écusson, qui reste centré. Et le liseré n'est pas décoratif : le logo de
 * l'une des instances est blanc à 85 %, donc invisible sur une tuile blanche
 * posée sur un fond clair. Le liseré dessine la tuile même quand son contenu
 * ne se voit pas.
 */
function Marque({
  logo,
  nom,
  taille,
}: {
  logo: string | null;
  nom: string;
  taille: "liste" | "bandeau";
}) {
  const boite = taille === "bandeau" ? "h-16 w-[5.5rem]" : "h-12 w-16";
  const texte = taille === "bandeau" ? "text-base" : "text-xs";
  const marge = taille === "bandeau" ? "p-2" : "p-1.5";

  const tuile =
    `inline-flex ${boite} shrink-0 items-center justify-center rounded-xl bg-white` +
    " ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.12)]";

  if (logo === null) {
    return (
      <span
        aria-hidden
        className={`${tuile} font-mono ${texte} font-semibold text-text-secondary`}
      >
        {initiales(nom)}
      </span>
    );
  }

  return (
    <span className={`${tuile} ${marge}`}>
      <Image
        src={logo}
        // Le nom de l'école, pas une chaîne vide : c'est une image porteuse de
        // sens, la seule marque visuelle qui distingue une ligne de la
        // suivante. Un lecteur d'écran doit l'annoncer.
        alt={nom}
        width={176}
        height={128}
        sizes="176px"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

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

  return (
    <div
      className="mx-auto mt-7 flex max-w-xl items-center gap-4 rounded-[20px] px-5 py-4 text-left"
      style={{ backgroundColor: identite.identite.bandeauFond, color: identite.identite.bandeauTexte }}
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

      {/* pt-[57px] : la barre est fixe, le contenu commence dessous. */}
      <main className="min-h-screen bg-bg pt-[57px] text-text">
        <div className="container py-14 sm:py-20" style={theme}>
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

      <ul className="mt-5 space-y-2">
        {etablissements.map((etablissement) => {
          const identite = identites[etablissement.code];
          // Le nom réglé par l'école prime : c'est elle qui sait comment elle
          // s'appelle, et elle le corrige sans passer par nous.
          const nom = identite?.nom ?? etablissement.libelle;

          return (
            <li key={etablissement.code}>
              <Link
                href={`/${locale}/inscription/universite/${etablissement.code}`}
                className="flex min-h-[56px] items-center gap-3.5 rounded-xl border border-border px-4 py-3 transition-[border-color,background-color,scale] duration-200 hover:border-accent hover:bg-accent-light active:scale-[0.96]"
              >
                <Marque logo={identite?.logo ?? null} nom={nom} taille="liste" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{nom}</span>
                  {identite?.ville ? (
                    <span className="mt-0.5 block truncate text-[13px] text-text-muted">
                      {identite.ville}
                    </span>
                  ) : null}
                </span>
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
          );
        })}
      </ul>
    </div>
  );
}
