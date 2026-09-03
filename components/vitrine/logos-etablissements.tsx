import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { EtablissementVitrine } from "@/lib/vitrine/etablissements";

/**
 * Le bandeau des établissements qui font tourner KLASSCI.
 *
 * Les logos viennent des écoles elles-mêmes : chacune dépose le sien dans ses
 * réglages KLASSCI, celui qui coiffe ses bulletins, et il arrive ici sans que
 * personne ne l'ajoute à la main. C'est la différence entre une page de
 * références qui vieillit et une qui reste vraie.
 *
 * Deux sources se rejoignent. Les établissements SERVIS, interrogés en direct,
 * et une liste de références tenue dans les traductions — des écoles clientes
 * qui ne sont pas des instances de l'édition Université, et qu'aucun appel ne
 * peut donc découvrir. Une référence qui porte un `code` d'établissement
 * s'efface quand ce même établissement répond en direct : la version vivante
 * gagne toujours, avec son vrai logo et son vrai nom.
 */

type Reference = {
  name: string;
  detail: string;
  logo: string;
  /** Le code de l'établissement, quand cette référence est une instance servie. */
  code?: string;
};

type Vignette = {
  cle: string;
  nom: string;
  detail: string;
  logo: string | null;
};

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
 * Un logo, ou les initiales de l'école, sur une tuile blanche.
 *
 * Le monogramme n'est pas un pis-aller honteux : une école qui n'a pas encore
 * déposé son logo est quand même une école cliente, et sa case doit avoir la
 * même tenue que les autres. C'est infiniment préférable à un logo KLASSCI
 * répété, qui donnerait à lire « nous nous équipons nous-mêmes ».
 *
 * **La tuile est blanche dans les deux thèmes, et c'est le point.** Les logos
 * étaient posés à même la carte, dont la couleur suit le thème : en sombre, la
 * ligne de sous-titre de l'ESBTP — de l'encre foncée sur un fond transparent —
 * devenait illisible, et un logo livré sur fond blanc opaque s'affichait en
 * pavé. Un logo d'établissement est dessiné pour du papier ; on lui rend du
 * papier, quel que soit le thème du visiteur.
 *
 * Le liseré n'est pas décoratif : sur une carte claire, il dessine la tuile que
 * son fond blanc ne distingue plus — et c'est aussi lui qui la montre quand le
 * logo lui-même est presque blanc.
 *
 * La tuile est RECTANGULAIRE, comme au portail et pour la même raison : un logo
 * d'école n'est presque jamais carré (les instances en servent en 185 × 141,
 * 412 × 142, 600 × 360), et `object-contain` dans un carré les réduit à une
 * bande. Le rapport 4:3 laisse respirer un mot-symbole sans déformer un écusson.
 */
const TUILE =
  "inline-flex h-20 w-[6.5rem] shrink-0 items-center justify-center rounded-xl bg-white" +
  " ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.10)]";

function Marque({ vignette }: { vignette: Vignette }) {
  if (vignette.logo === null) {
    return (
      <span aria-hidden className={`${TUILE} font-mono text-[1.05rem] font-semibold text-text-secondary`}>
        {initiales(vignette.nom)}
      </span>
    );
  }

  return (
    <span className={`${TUILE} p-2.5`}>
      <Image
        src={vignette.logo}
        // Vide, à dessein : le nom de l'école est écrit juste en dessous, dans
        // la même carte. L'annoncer deux fois n'aide personne.
        alt=""
        width={208}
        height={160}
        sizes="208px"
        loading="lazy"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export async function LogosEtablissements({
  etablissements,
  locale,
}: {
  etablissements: EtablissementVitrine[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "socialProof" });

  const servis: Vignette[] = etablissements.map((etablissement) => ({
    cle: etablissement.code,
    nom: etablissement.nom,
    detail: etablissement.ville,
    logo: etablissement.logo,
  }));

  const codesServis = new Set(etablissements.map((etablissement) => etablissement.code));

  const references = (t.raw("clients") as Reference[])
    .filter((reference) => reference.code === undefined || !codesServis.has(reference.code))
    .map((reference) => ({
      cle: reference.code ?? reference.name,
      nom: reference.name,
      detail: reference.detail,
      logo: reference.logo,
    }));

  const vignettes = [...servis, ...references];

  if (vignettes.length === 0) {
    return null;
  }

  // Doublée pour que la boucle se referme sans couture. Les copies portent une
  // clé distincte mais restent invisibles aux lecteurs d'écran : la liste est
  // déjà annoncée une fois.
  const defile = [
    ...vignettes.map((vignette) => ({ ...vignette, cle: `a-${vignette.cle}` })),
    ...vignettes.map((vignette) => ({ ...vignette, cle: `b-${vignette.cle}` })),
  ];

  return (
    <section className="overflow-hidden py-14" aria-labelledby="etablissements-titre">
      <div className="container text-center">
        <p className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">
          {t("eyebrow")}
        </p>
        <h2
          id="etablissements-titre"
          className="mx-auto max-w-[40ch] font-serif text-section-h2 font-light text-accent"
        >
          {t("title")}
        </h2>
      </div>

      <div className="marquee-fade relative -mx-[calc(50vw-50%)] mt-10 w-screen overflow-hidden py-3">
        <ul className="flex w-fit animate-marquee-40 gap-6 hover:[animation-play-state:paused]">
          {defile.map((vignette, rang) => (
            <li
              key={vignette.cle}
              aria-hidden={rang >= vignettes.length}
              className="flex min-w-[220px] flex-shrink-0 flex-col items-center gap-3 rounded-lg border border-border bg-bg-card px-9 py-7 transition-all duration-200 ease-klassci hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_4px_16px_rgba(4,83,203,0.08)]"
            >
              <Marque vignette={vignette} />
              <span className="text-center font-sans text-[0.9rem] font-semibold text-text">
                {vignette.nom}
              </span>
              {vignette.detail !== "" && (
                <span className="text-center font-mono text-[0.7rem] uppercase tracking-[0.06em] text-text-muted">
                  {vignette.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
