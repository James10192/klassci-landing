import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/sections/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { routing, type Locale } from "@/i18n/routing";
import {
  articles,
  dateLisible,
  LIBELLE_THEME,
  tempsDeLecture,
  type Theme,
} from "@/lib/blog";
import { buildBlogIndexGraph } from "@/lib/schema/pages";
import { buildUniverseMetadata } from "@/lib/seo";
import { LANGUE_BLOG } from "@/lib/source";

const TITRE = "Ressources — gestion scolaire en Afrique de l'Ouest";
const DESCRIPTION =
  "Textes réglementaires, procédures et méthodes de calcul, vérifiés aux sources, pour les établissements de Côte d'Ivoire et de la zone UEMOA.";

export function generateStaticParams() {
  // Le blog n'existe qu'en francais tant que le corpus n'est pas traduit.
  return [{ locale: LANGUE_BLOG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== LANGUE_BLOG) return {};

  return buildUniverseMetadata({
    locale: LANGUE_BLOG,
    title: "Ressources et guides pour les établissements",
    description: DESCRIPTION,
    path: "/blog",
    flux: `/${LANGUE_BLOG}/blog/rss.xml`,
    image: "/img/og/blog.png",
  });
}

export default async function IndexBlog({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Une page publiee dans une seule langue ne doit pas exister dans l'autre :
  // la servir sous /en reviendrait a publier le meme texte a deux adresses.
  if (!routing.locales.includes(locale as Locale) || locale !== LANGUE_BLOG) {
    notFound();
  }
  setRequestLocale(locale);

  const liste = articles();
  const graphe = await buildBlogIndexGraph(LANGUE_BLOG, TITRE, DESCRIPTION, liste);

  const parTheme = liste.reduce<Record<string, number>>((compte, item) => {
    compte[item.donnees.theme] = (compte[item.donnees.theme] ?? 0) + 1;
    return compte;
  }, {});

  return (
    <>
      <JsonLd graph={graphe} />
      <main className="container py-section">
        <header className="max-w-[52rem]">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">
            Ressources
          </p>
          <h1 className="mt-3 font-serif text-section-h2 font-light text-accent">
            Ce que les textes disent vraiment
          </h1>
          <p className="mt-5 max-w-[46ch] leading-relaxed text-text-secondary">
            Des guides écrits pour les directions d&apos;établissement de Côte
            d&apos;Ivoire et de la zone UEMOA. Chaque affirmation
            réglementaire est rattachée au texte qui la porte, et les points
            qu&apos;aucune source publique ne permet de trancher sont signalés
            comme tels.
          </p>

          {Object.keys(parTheme).length > 1 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {(Object.keys(parTheme) as Theme[]).sort().map((theme) => (
                <li
                  key={theme}
                  className="rounded border border-border bg-bg-card px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.04em] text-text-muted"
                >
                  {LIBELLE_THEME[theme]} · {parTheme[theme]}
                </li>
              ))}
            </ul>
          )}
        </header>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border">
          {liste.map(({ slug, donnees }) => (
            <li key={slug} className="bg-bg-card">
              <Link
                href={`/${LANGUE_BLOG}/blog/${slug}`}
                className="group block p-7 transition-colors duration-200 hover:bg-bg-alt sm:p-9"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted">
                  <span className="text-accent">{LIBELLE_THEME[donnees.theme]}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={donnees.date}>{dateLisible(donnees.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{tempsDeLecture(donnees)} min de lecture</span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-light leading-snug text-text group-hover:text-accent">
                  {donnees.title}
                </h2>

                <p className="mt-3 max-w-[62ch] leading-relaxed text-text-secondary">
                  {donnees.resume ?? donnees.description}
                </p>

                {donnees.sources.length > 0 && (
                  <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.04em] text-text-muted">
                    {donnees.sources.length} sources citées
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {liste.length === 0 && (
          <p className="mt-14 text-text-muted">Aucun article publié pour l&apos;instant.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
