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

/* ------------------------------------------------------------------ blog */

/**
 * Ce que le blog ajoute au graphe.
 *
 * L'index est une `CollectionPage` qui porte la liste de ses articles : c'est
 * la forme qui dit « voici un ensemble », et elle permet a un moteur de suivre
 * la liste sans avoir a la deviner en explorant les liens.
 *
 * Chaque article est un `Article` — pas un `TechArticle` : ces textes ne
 * documentent pas un logiciel, ils expliquent une reglementation et une
 * pratique de metier. Le type doit dire ce que la page est.
 */

export interface ArticleBlog {
  slug: string;
  chemin: string;
  donnees: {
    title: string;
    description?: string;
    date: string;
    dateRevision?: string;
    auteur: string;
    theme: string;
    resume?: string;
    sources: string[];
  };
}

const LIBELLE_RUBRIQUE: Record<string, string> = {
  lmd: "LMD et enseignement superieur",
  finance: "Frais et comptabilite",
  reglementation: "Reglementation",
  operations: "Operations quotidiennes",
  achat: "Choisir un outil",
};

export async function buildBlogIndexGraph(
  locale: Locale,
  titre: string,
  description: string,
  liste: ArticleBlog[],
): Promise<JsonLdGraphe> {
  return graphe(
    ...(await socle(locale)),
    buildWebPage({
      locale,
      chemin: "/blog",
      nom: titre,
      description,
      image: IMAGES.default,
      type: "CollectionPage",
      avecFilAriane: true,
      // La page n'est pas datee par elle-meme : sa fraicheur est celle de son
      // article le plus recent, ce qui est vrai et verifiable.
      dateModification: liste[0]?.donnees.date,
      mentions: [
        {
          "@type": "ItemList",
          numberOfItems: liste.length,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          itemListElement: liste.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: urlPage(locale, item.chemin),
            name: item.donnees.title,
          })),
        },
      ],
    }),
    buildBreadcrumb(locale, "/blog", [{ nom: "Ressources" }]),
  );
}

export async function buildArticleGraph(
  locale: Locale,
  article: ArticleBlog,
): Promise<JsonLdGraphe> {
  const { donnees, chemin } = article;
  const rubrique = LIBELLE_RUBRIQUE[donnees.theme] ?? donnees.theme;

  // Les sources citees sont declarees en `citation` : c'est la propriete qui
  // dit « ce texte s'appuie sur celui-la ». Sur un sujet reglementaire, c'est
  // le signal d'autorite le plus direct qu'une page puisse emettre — et le
  // seul que les moteurs de reponse reprennent tel quel.
  const citations = donnees.sources
    .map((brut) => {
      const trouve = brut.match(/^(.*?)\s*[\u2014\u2013-]\s*(https?:\/\/\S+)$/);
      if (!trouve) return { "@type": "CreativeWork", name: brut };
      return { "@type": "CreativeWork", name: trouve[1].trim(), url: trouve[2] };
    })
    .slice(0, 25);

  return graphe(
    ...(await socle(locale)),
    buildWebPage({
      locale,
      chemin,
      nom: donnees.title,
      description: donnees.description ?? donnees.resume ?? "",
      image: IMAGES.default,
      datePublication: donnees.date,
      dateModification: donnees.dateRevision ?? donnees.date,
      avecFilAriane: true,
    }),
    buildBreadcrumb(locale, chemin, [
      { nom: "Ressources", chemin: "/blog" },
      { nom: donnees.title },
    ]),
    {
      ...buildTechArticle({
        locale,
        chemin,
        titre: donnees.title,
        description: donnees.description ?? donnees.resume,
        rubrique,
        datePublication: donnees.date,
        dateModification: donnees.dateRevision ?? donnees.date,
        image: IMAGES.default,
        type: "Article",
        auteur: donnees.auteur,
      }),
      citation: citations.length > 0 ? citations : undefined,
    },
  );
}

/* -------------------------------------------------- pages institutionnelles */

/**
 * Les quatre pages qui engagent l'entreprise.
 *
 * Le type du noeud n'est pas decoratif : `AboutPage` et `ContactPage` sont les
 * deux seuls sous-types de `WebPage` que schema.org definit pour ce role, et
 * les emettre dit a un moteur ce que la page est sans qu'il ait a l'inferer du
 * texte. Les mentions legales sont une `ContactPage` — c'est la page qui porte
 * l'identite et les coordonnees de l'editeur, ce qui est exactement sa
 * definition.
 *
 * La politique de confidentialite et la page securite restent des `WebPage` :
 * schema.org n'a rien de plus precis, et inventer un type serait pire que ne
 * rien dire.
 *
 * Aucune de ces pages n'emet de date de publication : elles portent une date de
 * mise a jour, qui est la seule qui compte pour un texte juridique — celle qui
 * dit a un lecteur si ce qu'il lit est encore la version qui l'engage.
 */

const TYPE_INSTITUTIONNEL: Record<
  string,
  "WebPage" | "AboutPage" | "ContactPage"
> = {
  "a-propos": "AboutPage",
  "mentions-legales": "ContactPage",
  securite: "WebPage",
  confidentialite: "WebPage",
};

export async function buildInstitutionnelGraph(
  locale: Locale,
  page: {
    slug: string;
    chemin: string;
    titre: string;
    description: string;
    dateMaj: string;
  },
): Promise<JsonLdGraphe> {
  return graphe(
    ...(await socle(locale)),
    buildWebPage({
      locale,
      chemin: page.chemin,
      nom: page.titre,
      description: page.description,
      image: IMAGES.default,
      type: TYPE_INSTITUTIONNEL[page.slug] ?? "WebPage",
      dateModification: page.dateMaj,
      avecFilAriane: true,
    }),
    // Deux elements seulement : la racine, puis la page. « L'entreprise »
    // n'est pas une page — l'inserer aurait produit un maillon sans adresse au
    // milieu du fil, ce que Google rejette. Le fil affiche a l'ecran porte le
    // meme dernier libelle, comme l'exige la regle de correspondance entre le
    // balisage et ce que le visiteur lit.
    buildBreadcrumb(locale, page.chemin, [{ nom: page.titre }]),
  );
}
