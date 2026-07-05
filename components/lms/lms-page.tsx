"use client";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Clock from "lucide-react/dist/esm/icons/clock";
import Layers from "lucide-react/dist/esm/icons/layers";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle";
import { useLocale, useTranslations } from "next-intl";

import { Footer } from "@/components/sections/footer";
import { Link } from "@/i18n/navigation";

const ICONS = [PlayCircle, Layers, Clock];

export function LmsPage() {
  const t = useTranslations("lms");
  const locale = useLocale() as "fr" | "en";
  const docsHref = locale === "fr" ? "/docs/lms" : "/en/docs/lms";
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <>
      <main className="min-h-screen bg-bg text-text">
        <nav className="border-b border-border bg-[var(--nav-bg)] backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between gap-4">
            <Link href="/" className="font-serif text-xl font-light text-accent">
              KLASSCI
            </Link>
            <a href={docsHref} className="inline-flex min-h-11 items-center gap-2 rounded border border-border px-3 text-sm text-text-secondary hover:text-text">
              <BookOpen className="h-4 w-4" aria-hidden />
              {t("docs")}
            </a>
          </div>
        </nav>

        <section className="container grid min-h-[calc(100vh-4rem)] gap-10 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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
