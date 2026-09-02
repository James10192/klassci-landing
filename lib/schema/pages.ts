/**
 * Le graphe de chaque type de page, assemble une fois pour toutes.
 *
 * Les pages n'appellent pas les constructeurs un par un : elles appellent la
 * fonction qui correspond a ce qu'elles sont. C'est ce qui empeche le defaut de
 * la version precedente — le meme graphe recopie a l'identique sur quatre pages
 * qui ne montrent pas les memes choses, avec le meme identifiant de produit sur
 * trois editions differentes.
 *
 * Toutes ces fonctions sont asynchrones parce qu'elles lisent les traductions :
 * le texte du graphe doit etre celui de la page, dans la langue de la page,
 * sinon le balisage decrit une page qui n'existe pas.
 */

import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { COLLEGE_PLAN_PRICES } from "@/lib/college-pricing";

import { buildBreadcrumb, type Segment } from "./breadcrumb";
import { buildClientList, type EtablissementClient } from "./clients";
import { APPLICATION_ID, CHEMIN_EDITION, type Edition } from "./constantes";
import { buildFaqPage, type QuestionFaq } from "./faq";
import { buildOrganization, buildPublisher } from "./organization";
import { graphe } from "./serialiser";
import { buildSoftwareApplication, type Formule } from "./software-application";
import { buildTechArticle, type EntreeArticle } from "./tech-article";
import type { JsonLdGraphe } from "./types";
import { urlPage } from "./urls";
import { buildWebPage, buildWebSite } from "./website";

/** Les images d'ouverture, aux dimensions reelles des fichiers. */
const IMAGES = {
  home: { chemin: "/img/og/home.png", largeur: 1200, hauteur: 630 },
  universite: { chemin: "/img/og/universite.png", largeur: 1200, hauteur: 630 },
  college: { chemin: "/img/og/college.png", largeur: 1200, hauteur: 630 },
  default: { chemin: "/img/og/default.png", largeur: 1200, hauteur: 630 },
} as const;

/** Les trois noeuds presents sur absolument toutes les pages. */
async function socle(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const hero = await getTranslations({ locale, namespace: "hero" });

  return [
    buildOrganization({
      locale,
      description: t("description"),
      slogan: hero("title"),
    }),
    buildPublisher(),
    buildWebSite(locale),
  ];
}

/** La page d'accueil : un portail qui oriente vers trois editions. */
export async function buildHomeGraph(
  locale: Locale,
  etablissements: EtablissementClient[],
): Promise<JsonLdGraphe> {
  const t = await getTranslations({ locale, namespace: "welcome" });
  const clients = buildClientList(etablissements, locale);

  return graphe(
    ...(await socle(locale)),
    buildWebPage({
      locale,
      chemin: "/",
      nom: t("metaTitle"),
      description: t("metaDescription"),
      image: IMAGES.home,
      // Elle oriente vers trois univers : c'est une page de collection, pas
      // une page de contenu.
      type: "CollectionPage",
      mentions: clients ? [clients] : undefined,
    }),
  );
}

/**
 * Les tarifs des editions, lus la ou ils sont deja definis.
 *
 * L'universite les porte dans les messages sous forme de libelles (« 4,8 M »,
 * « 700 k FCFA / an ») : impossible a analyser de facon fiable, ils sont donc
 * recopies ici en chiffres, avec leur source en commentaire. Le college les
 * porte en nombres dans `lib/college-pricing.ts` : on les lit directement, et
 * ils ne peuvent donc pas diverger de la page.
 *
 * La formule Partenaire — installation puis tarif par eleve — est absente des
 * deux fourchettes : un tarif variable n'a pas sa place dans un `lowPrice`.
 */
function formules(edition: Edition, locale: Locale): Formule[] | undefined {
  if (edition === "universite") {
    // Source : `pricing.alternatives.tiers` et `pricing.elite.annualPrice`
    // dans messages/<locale>.json. Les trois montants sont affiches sur la page.
    return [
      { nom: "KLASSCI Essentiel", prixAnnuel: 700_000, ancre: "#tarifs" },
      { nom: "KLASSCI PRO", prixAnnuel: 1_150_000, ancre: "#tarifs" },
      { nom: "KLASSCI Elite", prixAnnuel: 4_800_000, ancre: "#tarifs" },
    ];
  }

  if (edition === "college") {
    // Source : lib/college-pricing.ts. On declare le tarif courant, pas le
    // tarif de lancement : un prix promotionnel exige une date de fin, et
    // aucune n'existe dans le depot. Sans elle, la promotion se perimerait en
    // silence et le balisage deviendrait faux tout seul.
    return (["essentielle", "pro", "elite"] as const).map((cle) => ({
      nom:
        cle === "essentielle"
          ? "KLASSCI College Essentielle"
          : cle === "pro"
            ? "KLASSCI College PRO"
            : "KLASSCI College Elite",
      prixAnnuel: COLLEGE_PLAN_PRICES[cle],
      ancre: locale === "fr" ? "#tarifs" : "#pricing",
    }));
  }

  // LMS : annonce « bientot », aucun tarif affiche. Aucune offre emise.
  return undefined;
}

const NOM_EDITION: Record<Edition, string> = {
  universite: "KLASSCI",
  college: "KLASSCI College",
  lms: "KLASSCI LMS",
};

const LIBELLE_EDITION: Record<Locale, Record<Edition, string>> = {
  fr: {
    universite: "Universite et grandes ecoles",
    college: "College et lycee",
    lms: "Classe virtuelle",
  },
  en: {
    universite: "University and higher education",
    college: "Secondary school",
    lms: "Virtual classroom",
  },
};

/** Les fonctionnalites reellement decrites sur la page de l'edition. */
async function fonctionnalites(
  edition: Edition,
  locale: Locale,
): Promise<string[]> {
  if (edition === "universite") {
    const t = await getTranslations({ locale, namespace: "features" });
    const grandes = t.raw("big") as Array<{ title: string }>;
    const petites = t.raw("small") as Array<{ title: string }>;
    return [...grandes, ...petites].map((entree) => entree.title);
  }

  if (edition === "college") {
    const t = await getTranslations({ locale, namespace: "college.modules" });
    const items = t.raw("items") as Array<{ title: string }> | undefined;
    return (items ?? []).map((entree) => entree.title);
  }

  const t = await getTranslations({ locale, namespace: "lms" });
  const items = t.raw("items") as Array<{ title: string }> | undefined;
  return (items ?? []).map((entree) => entree.title);
}

export async function buildEditionGraph(
  edition: Edition,
  locale: Locale,
  options: {
    /** Les questions affichees. Seule la page Universite en rend aujourd'hui. */
    faq?: QuestionFaq[];
    etablissements?: EtablissementClient[];
  } = {},
): Promise<JsonLdGraphe> {
  const espace =
    edition === "universite"
      ? "universite.meta"
      : edition === "college"
        ? "college.meta"
        : "lms.meta";
  const t = await getTranslations({ locale, namespace: espace });
  const chemin = CHEMIN_EDITION[edition];

  const clients = options.etablissements
    ? buildClientList(options.etablissements, locale)
    : undefined;

  return graphe(
    ...(await socle(locale)),
    buildWebPage({
      locale,
      chemin,
      nom: t("title"),
      description: t("description"),
      image:
        edition === "lms"
          ? IMAGES.default
          : edition === "college"
            ? IMAGES.college
            : IMAGES.universite,
      // Le sujet de la page est l'edition du produit, pas l'organisation.
      aPropos: APPLICATION_ID[edition],
      mentions: clients ? [clients] : undefined,
      avecFilAriane: true,
    }),
    buildBreadcrumb(locale, chemin, [{ nom: LIBELLE_EDITION[locale][edition] }]),
    buildSoftwareApplication({
      edition,
      locale,
      nom: NOM_EDITION[edition],
      description: t("description"),
      fonctionnalites: await fonctionnalites(edition, locale),
      formules: formules(edition, locale),
      // Le LMS n'est pas vendu seul : il est inclus dans les formules PRO et
      // Elite de l'edition universitaire.
      partieDe:
        edition === "lms"
          ? {
              id: APPLICATION_ID.universite,
              nom: NOM_EDITION.universite,
              url: urlPage(locale, CHEMIN_EDITION.universite),
            }
          : undefined,
      categorie:
        edition === "lms" ? "EducationalApplication" : "BusinessApplication",
    }),
    options.faq ? buildFaqPage(options.faq, locale, chemin) : undefined,
  );
}

/** Une page de documentation. */
export async function buildDocGraph(
  locale: Locale,
  article: Omit<EntreeArticle, "locale" | "image">,
  filAriane: Segment[],
): Promise<JsonLdGraphe> {
  return graphe(
    ...(await socle(locale)),
    buildWebPage({
      locale,
      chemin: article.chemin,
      nom: article.titre,
      description: article.description ?? "",
      image: IMAGES.default,
      datePublication: article.datePublication,
      dateModification: article.dateModification,
      avecFilAriane: filAriane.length > 0,
    }),
    buildBreadcrumb(locale, article.chemin, filAriane),
    buildTechArticle({ ...article, locale, image: IMAGES.default }),
  );
}
