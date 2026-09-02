"use client";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Clock from "lucide-react/dist/esm/icons/clock";
import Layers from "lucide-react/dist/esm/icons/layers";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle";
import { useLocale, useTranslations } from "next-intl";

import { Footer } from "@/components/sections/footer";
import { SiteNav } from "@/components/sections/site-nav";
import { Logo } from "@/components/ui/logo";

const ICONS = [PlayCircle, Layers, Clock];

export function LmsPage() {
  const t = useTranslations("lms");
  const nav = useTranslations("nav");
  const accueil = useTranslations("welcome");
  const locale = useLocale() as "fr" | "en";
  const docsHref = `/${locale}/docs/lms`;
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <>
      {/* Cette page n'avait qu'un logo et un lien vers la documentation : pas de
          retour vers les autres univers, pas de reglage de langue, pas de menu
          sur telephone. On y arrivait, on n'en repartait plus. */}
      <SiteNav
        logo={<Logo />}
        libelles={{ ouvrirMenu: nav("menuOpen"), fermerMenu: nav("menuClose") }}
        liens={[
          { cle: "accueil", libelle: nav("home"), href: `/${locale}` },
          { cle: "universite", libelle: accueil("doors.universite.name"), href: "/universite", interne: true },
          { cle: "college", libelle: accueil("doors.college.name"), href: "/college", interne: true },
          { cle: "docs", libelle: nav("docs"), href: docsHref, icone: BookOpen, iconeDansLaBarre: true },
        ]}
        action={({ fermerMenu, contexte }) => (
          <a
            href="mailto:contact@klassci.com?subject=KLASSCI%20LMS"
            onClick={fermerMenu}
            className={
              contexte === "barre"
                ? "hidden min-h-11 items-center rounded border border-accent bg-accent px-3.5 text-[0.875rem] font-medium text-white transition-colors hover:bg-accent-hover sm:inline-flex"
                : "min-h-11 font-serif text-[1.75rem] font-light text-accent"
            }
          >
            {t("cta")}
          </a>
        )}
      />

      <main className="min-h-screen bg-bg pt-[57px] text-text">
        <section className="container grid min-h-[calc(100vh-57px)] gap-10 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded border border-border bg-bg-card px-3 py-1 text-sm text-text-secondary">
              {t("badge")}
            </p>
            <h1 className="max-w-[12ch] font-serif text-[clamp(2.8rem,7vw,5.2rem)] font-light leading-none">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {t("subtitle")}
            </p>
            <a
              href="mailto:contact@klassci.com?subject=KLASSCI%20LMS"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <div className="grid gap-4">
            {items.map((item, index) => {
              const Icon = ICONS[index] ?? Layers;
              return (
                <article key={item.title} className="rounded-lg border border-border bg-bg-card p-6">
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                  <h2 className="mt-4 font-serif text-2xl font-light text-text">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
