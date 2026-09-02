import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { composantsBlog } from "@/components/blog/mdx";
import { Footer } from "@/components/sections/footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  article,
  articles,
  dateLisible,
  decouperSource,
  LIBELLE_THEME,
  tempsDeLecture,
} from "@/lib/blog";
import { buildArticleGraph } from "@/lib/schema/pages";
import { buildUniverseMetadata } from "@/lib/seo";
import { LANGUE_BLOG } from "@/lib/source";

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return articles().map(({ slug }) => ({ locale: LANGUE_BLOG, slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== LANGUE_BLOG) return {};

  const trouve = article([slug]);
  if (!trouve) return {};

  return buildUniverseMetadata({
    locale: LANGUE_BLOG,
    title: trouve.donnees.title,
    description: trouve.donnees.description ?? trouve.donnees.resume ?? "",
    path: trouve.chemin,
    flux: `/${LANGUE_BLOG}/blog/rss.xml`,
    image: "/img/og/blog.png",
    // Le blog n'existe qu'en francais : declarer une version anglaise qui
    // n'existe pas casserait la reciprocite que hreflang exige.
    languesDisponibles: [LANGUE_BLOG],
  });
}

export default async function PageArticle({ params }: Params) {
  const { locale, slug } = await params;
  if (locale !== LANGUE_BLOG) notFound();
  setRequestLocale(locale);

  const trouve = article([slug]);
  if (!trouve) notFound();

  const { donnees, chemin } = trouve;
  const MDX = donnees.body;
  const graphe = await buildArticleGraph(LANGUE_BLOG, trouve);

  // Deux autres articles a proposer en fin de lecture : le maillage interne se
  // construit ici, pas dans un plan de site.
  const suivants = articles()
    .filter((item) => item.slug !== trouve.slug)
    .sort((a, b) =>
      a.donnees.theme === donnees.theme && b.donnees.theme !== donnees.theme
        ? -1
        : b.donnees.theme === donnees.theme && a.donnees.theme !== donnees.theme
          ? 1
          : b.donnees.date.localeCompare(a.donnees.date),
    )
    .slice(0, 2);

  return (
    <>
      <JsonLd graph={graphe} />

      <main className="container py-section">
        <nav aria-label="Fil d'Ariane" className="font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted">
          <Link href={`/${LANGUE_BLOG}`} className="hover:text-accent">
            Accueil
          </Link>
          <span aria-hidden className="px-2">/</span>
          <Link href={`/${LANGUE_BLOG}/blog`} className="hover:text-accent">
            Ressources
          </Link>
        </nav>

        <article className="mx-auto mt-8 max-w-[46rem]">
          <header>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-accent">
              {LIBELLE_THEME[donnees.theme]}
            </p>
            <h1 className="mt-3 font-serif text-[2.4rem] font-light leading-[1.15] text-accent sm:text-[2.9rem]">
              {donnees.title}
            </h1>

            {donnees.resume && (
              <p className="mt-6 border-l-2 border-accent pl-5 text-[1.05rem] leading-relaxed text-text-secondary">
                {donnees.resume}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-border py-3 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted">
              <span>{donnees.auteur}</span>
              <span aria-hidden>·</span>
              <time dateTime={donnees.date}>{dateLisible(donnees.date)}</time>
              {donnees.dateRevision && (
                <>
                  <span aria-hidden>·</span>
                  <span>Revu le {dateLisible(donnees.dateRevision)}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{tempsDeLecture(donnees)} min</span>
            </div>
          </header>

          <div className="mt-2">
            <MDX components={composantsBlog} />
          </div>

          {donnees.sources.length > 0 && (
            <section
              aria-labelledby="sources"
              className="mt-16 rounded-lg border border-border bg-bg-alt p-6 sm:p-8"
            >
              <h2
                id="sources"
                className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-text-muted"
              >
                Sources
              </h2>
              <ol className="mt-4 space-y-3 text-[0.9rem] leading-relaxed text-text-secondary">
                {donnees.sources.map((brut, rang) => {
                  const { libelle, url } = decouperSource(brut);
                  return (
                    <li key={rang} className="flex gap-3">
                      <span className="font-mono text-text-muted">{rang + 1}.</span>
                      <span>
                        {libelle}
                        {url && (
                          <>
                            {" "}
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-accent underline underline-offset-2"
                            >
                              {url}
                            </a>
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </article>

        {suivants.length > 0 && (
          <aside className="mx-auto mt-16 max-w-[46rem]" aria-labelledby="a-lire">
            <h2
              id="a-lire"
              className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-text-muted"
            >
              À lire ensuite
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {suivants.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/${LANGUE_BLOG}${item.chemin}`}
                    className="block h-full rounded-lg border border-border bg-bg-card p-5 transition-colors duration-200 hover:border-accent"
                  >
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.06em] text-accent">
                      {LIBELLE_THEME[item.donnees.theme]}
                    </span>
                    <span className="mt-2 block font-serif text-[1.1rem] font-light leading-snug text-text">
                      {item.donnees.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mx-auto mt-16 max-w-[46rem] rounded-lg border border-border bg-bg-card p-7 text-center sm:p-9">
          <p className="font-serif text-[1.35rem] font-light text-accent">
            KLASSCI applique ces règles au quotidien
          </p>
          <p className="mx-auto mt-3 max-w-[46ch] text-text-secondary">
            Inscriptions, notes, bulletins, présences, emplois du temps et frais
            de scolarité, pour les établissements de Côte d&apos;Ivoire et de la
            zone UEMOA.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${LANGUE_BLOG}/universite`}
              className="inline-flex items-center gap-2 rounded border border-accent bg-accent px-5 py-2.5 text-[0.875rem] font-medium text-white transition-colors duration-200 hover:bg-accent-hover"
            >
              Université et grandes écoles
            </Link>
            <Link
              href={`/${LANGUE_BLOG}/college`}
              className="inline-flex items-center gap-2 rounded border border-border px-5 py-2.5 text-[0.875rem] font-medium text-text transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              Collège et lycée
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
