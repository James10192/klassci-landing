import Link from "next/link";

import { composantsInstitutionnels } from "@/components/institutionnel/mdx";
import { NavInstitutionnelle } from "@/components/institutionnel/nav-institutionnelle";
import { Footer } from "@/components/sections/footer";
import { JsonLd } from "@/components/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import {
  cheminInstitutionnel,
  dateLisible,
  PAGES_INSTITUTIONNELLES,
  type DonneesPageInstitutionnelle,
  type SlugInstitutionnel,
} from "@/lib/institutionnel";
import { buildInstitutionnelGraph } from "@/lib/schema";

/**
 * La coquille commune aux quatre pages institutionnelles.
 *
 * Elle reprend la mise en page d'un article : fil d'Ariane, colonne de lecture
 * de 46rem, en-tête, corps MDX, pied de page. C'est délibéré — ces pages se
 * lisent comme un texte suivi, pas comme de la documentation à parcourir, et
 * leur donner une barre latérale et un plan reviendrait à inventer une
 * troisième mise en page pour quatre pages.
 *
 * Aucune n'est cliente : rien ici n'a besoin d'état, et une page d'information
 * légale n'a aucune raison de coûter du JavaScript à quelqu'un qui la consulte
 * depuis un téléphone d'entrée de gamme.
 *
 * Les libellés vivent dans ce fichier plutôt que dans `messages/`. Ce sont
 * sept chaînes, lues à un seul endroit ; les faire voyager par le catalogue de
 * traduction aurait ajouté une dépendance de plus à quatre pages qui n'en ont
 * aucune autre.
 */

const LIBELLES = {
  fr: {
    accueil: "Accueil",
    rubrique: "L'entreprise",
    misAJour: "Mis à jour le",
    aussi: "À lire également",
    titres: {
      "a-propos": "À propos de KLASSCI",
      securite: "Sécurité et protection des données",
      "mentions-legales": "Mentions légales",
      confidentialite: "Politique de confidentialité",
    },
  },
  en: {
    accueil: "Home",
    rubrique: "Company",
    misAJour: "Last updated",
    aussi: "Also worth reading",
    titres: {
      "a-propos": "About KLASSCI",
      securite: "Security and data protection",
      "mentions-legales": "Legal notice",
      confidentialite: "Privacy policy",
    },
  },
} as const;

export async function PageInstitutionnelle({
  locale,
  slug,
  donnees,
}: {
  locale: Locale;
  slug: SlugInstitutionnel;
  donnees: DonneesPageInstitutionnelle;
}) {
  const mots = LIBELLES[locale] ?? LIBELLES.fr;
  const MDX = donnees.body;

  // Le graphe est construit ici, et non dans chacune des quatre routes : elles
  // rendent toutes la meme coquille, et le dupliquer quatre fois aurait garanti
  // qu'une des quatre finisse par diverger.
  const graphe = await buildInstitutionnelGraph(locale, {
    slug,
    chemin: cheminInstitutionnel(slug),
    titre: donnees.title,
    description: donnees.description ?? donnees.resume ?? "",
    dateMaj: donnees.dateMaj,
  });

  // Les trois autres pages du groupe. Le maillage se fait ici, une fois, plutôt
  // que par une liste de liens recopiée en bas de chaque fichier MDX — où elle
  // aurait divergé dès la deuxième relecture.
  const autres = PAGES_INSTITUTIONNELLES.filter((autre) => autre !== slug);

  return (
    <>
      <JsonLd graph={graphe} />
      <NavInstitutionnelle locale={locale} />
      {/* La barre est en `fixed` : elle ne pousse rien, et sans dégagement le
          fil d'Ariane se retrouve collé dessous. L'enveloppe porte le décalage
          plutôt que le `<main>` — `pt-[57px]` et `py-section` posent tous deux
          un `padding-top`, et c'est l'ordre des règles CSS qui tranche, pas
          celui des classes. Une ambiguïté qu'on ne voit qu'à l'écran. */}
      <div className="pt-[57px]">
        <main className="container py-section">
          <nav
            aria-label={locale === "en" ? "Breadcrumb" : "Fil d'Ariane"}
            className="font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted"
          >
            <Link href={`/${locale}`} className="hover:text-accent">
              {mots.accueil}
            </Link>
            <span aria-hidden className="px-2">
              /
            </span>
            <span className="text-text-muted">{mots.rubrique}</span>
            <span aria-hidden className="px-2">
              /
            </span>
            <span className="text-text-secondary">{mots.titres[slug]}</span>
          </nav>

          <article className="mx-auto mt-8 max-w-[46rem]">
            <header>
              <h1 className="font-serif text-[2.4rem] font-light leading-[1.15] text-accent sm:text-[2.9rem]">
                {donnees.title}
              </h1>

              {donnees.resume && (
                <p className="mt-6 border-l-2 border-accent pl-5 text-[1.05rem] leading-relaxed text-text-secondary">
                  {donnees.resume}
                </p>
              )}

              <div className="mt-7 border-y border-border py-3 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted">
                <span>{mots.misAJour} </span>
                <time dateTime={donnees.dateMaj}>
                  {dateLisible(donnees.dateMaj, locale)}
                </time>
              </div>
            </header>

            <div className="mt-2">
              <MDX components={composantsInstitutionnels} />
            </div>
          </article>

          <aside
            className="mx-auto mt-16 max-w-[46rem]"
            aria-labelledby="pages-liees"
          >
            <h2
              id="pages-liees"
              className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-text-muted"
            >
              {mots.aussi}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {autres.map((autre) => (
                <li key={autre}>
                  <Link
                    href={`/${locale}${cheminInstitutionnel(autre)}`}
                    className="block h-full rounded-lg border border-border bg-bg-card p-5 transition-colors duration-200 hover:border-accent"
                  >
                    <span className="block font-serif text-[1.05rem] font-light leading-snug text-text">
                      {mots.titres[autre]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </main>
      </div>
      <Footer />
    </>
  );
}
