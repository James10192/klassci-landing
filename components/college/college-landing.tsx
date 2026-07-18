"use client";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Calculator from "lucide-react/dist/esm/icons/calculator";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Menu from "lucide-react/dist/esm/icons/menu";
import MonitorSmartphone from "lucide-react/dist/esm/icons/monitor-smartphone";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Users from "lucide-react/dist/esm/icons/users";
import X from "lucide-react/dist/esm/icons/x";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { CollegeCommercial } from "@/components/college/college-commercial";
import { CollegeMockupStage } from "@/components/college/college-mockup-stage";
import { CollegeQuoteDialog } from "@/components/college/college-quote-dialog";
import { Footer } from "@/components/sections/footer";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SdgImpactGrid } from "@/components/universe/sdg-impact-grid";
import { Link } from "@/i18n/navigation";
import type { CollegePlanKey } from "@/lib/college-pricing";

interface RoleItem {
  title: string;
  description: string;
}

interface ModuleItem {
  title: string;
  description: string;
}

interface ShotItem {
  title: string;
  caption: string;
  image: string;
  alt: string;
  format: "desktop" | "mobile";
}

interface SdgItem {
  number: string;
  name: string;
  text: string;
}

const ROLE_ICONS = [ShieldCheck, UserCheck, Calculator, GraduationCap, Users, MonitorSmartphone];

const HERO_STRIP = [
  { src: "/img/college/current-dashboard.png", key: "dashboard" },
  { src: "/img/college/current-parents.png", key: "parents" },
  { src: "/img/college/current-grades.png", key: "grades" },
  { src: "/img/college/current-timetable.png", key: "timetable" },
  { src: "/img/college/current-settings.png", key: "settings" },
] as const;

function CollegeLogo({
  className = "",
  imageWidth = 120,
  imageHeight = 32,
}: {
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
}) {
  return (
    <span className={`inline-flex w-fit flex-col items-center ${className}`}>
      <img
        src="/img/college/logo-klassci-college.png"
        alt="KLASSCI"
        width={imageWidth}
        height={imageHeight}
        className="block object-contain"
        style={{ width: imageWidth, height: imageHeight }}
      />
      <span className="-mt-2 font-serif text-[12px] leading-none text-text-muted">
        College
      </span>
    </span>
  );
}

export function CollegeLanding() {
  const t = useTranslations("college");
  const locale = useLocale() as "fr" | "en";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePlan, setQuotePlan] = useState<CollegePlanKey | null>(null);
  const [quoteStudentCount, setQuoteStudentCount] = useState(600);
  const roles = t.raw("roles.items") as RoleItem[];
  const modules = t.raw("modules.items") as ModuleItem[];
  const shots = t.raw("showcase.items") as ShotItem[];
  const sdgs = t.raw("impact.items") as SdgItem[];
  const homeHref = `/${locale}`;
  const docsHref = `/${locale}/docs/college`;
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openQuote = useCallback((plan: CollegePlanKey | null, studentCount: number) => {
    setQuotePlan(plan);
    setQuoteStudentCount(studentCount);
    setQuoteOpen(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <main className="overflow-hidden bg-bg text-text">
        <nav className="fixed left-0 right-0 top-0 z-50 h-[57px] border-b border-border bg-[var(--nav-bg)] backdrop-blur-md backdrop-saturate-150">
          <div className="container flex h-full items-center justify-between gap-6">
            <Link href="/" aria-label="KLASSCI College">
              <CollegeLogo />
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <a href={homeHref} className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                {t("nav.home")}
              </a>
              <a href="#fonctionnalites" className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                {t("nav.features")}
              </a>
              <a href="#interfaces" className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                {t("nav.interfaces")}
              </a>
              <a href="#tarifs" className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                {t("nav.quote")}
              </a>
              <a href={docsHref} className="inline-flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                <BookOpen className="h-4 w-4" aria-hidden />
                {t("nav.docs")}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <ThemeToggle className="hidden sm:inline-flex" />
              <button
                type="button"
                onClick={() => openQuote(null, 600)}
                className="hidden min-h-11 items-center rounded border border-accent bg-accent px-3.5 text-[0.875rem] font-medium text-white transition-colors hover:bg-accent-hover sm:inline-flex"
              >
                {t("nav.contact")}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="inline-flex h-11 w-11 items-center justify-center rounded border border-border text-text md:hidden"
                aria-label={mobileOpen ? t("nav.menuClose") : t("nav.menuOpen")}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
              </button>
            </div>
          </div>
        </nav>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 bg-bg px-6 pt-16 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <a href={homeHref} onClick={closeMobile} className="font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent">
              {t("nav.home")}
            </a>
            <a href="#fonctionnalites" onClick={closeMobile} className="font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent">
              {t("nav.features")}
            </a>
            <a href="#interfaces" onClick={closeMobile} className="font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent">
              {t("nav.interfaces")}
            </a>
            <a href="#tarifs" onClick={closeMobile} className="font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent">
              {t("nav.quote")}
            </a>
            <a href={docsHref} onClick={closeMobile} className="inline-flex items-center gap-3 font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent">
              <BookOpen className="h-6 w-6" aria-hidden />
              {t("nav.docs")}
            </a>
            <button
              type="button"
              onClick={() => {
                closeMobile();
                openQuote(null, 600);
              }}
              className="min-h-11 font-serif text-[1.75rem] font-light text-accent"
            >
              {t("nav.contact")}
            </button>
            <div className="mt-4 flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        )}

        <section className="relative min-h-screen pt-[5.5rem]">
          <div className="absolute inset-0" aria-hidden>
            <div className="college-grid absolute inset-0" />
            <div className="absolute left-1/2 top-24 h-[34rem] w-[72rem] -translate-x-1/2 rounded-[3rem] bg-[linear-gradient(135deg,rgba(4,83,203,0.16),rgba(245,130,32,0.12))] [clip-path:polygon(0_12%,92%_0,100%_72%,12%_100%)]" />
          </div>
          <div className="container relative grid gap-12 pb-20 pt-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="animate-fade-up">
              <div className="mb-7 flex items-center gap-4">
                <CollegeLogo imageWidth={180} imageHeight={74} className="[&_span]:text-[1rem]" />
              </div>
              <a
                href="#tarifs"
                className="mb-6 inline-flex min-h-11 items-center rounded border border-brand-orange/45 bg-brand-orange-light px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.06em] text-brand-orange transition-colors hover:border-brand-orange"
              >
                {t("sales.offer.hero")}
              </a>
              <h1 className="max-w-[12ch] font-serif text-[clamp(2.7rem,7vw,5.3rem)] font-light leading-none text-[#0f3f8c] dark:text-white">
                {t("hero.title")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openQuote(null, 600)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#f58220] px-5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(245,130,32,0.28)] hover:bg-[#e87512]"
                >
                  {t("hero.primaryCta")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <a
                  href="#interfaces"
                  className="inline-flex min-h-11 items-center justify-center rounded border border-border bg-bg-card px-5 text-sm font-medium text-text hover:border-border-strong"
                >
                  {t("hero.secondaryCta")}
                </a>
              </div>
            </div>

            <CollegeMockupStage />
          </div>
        </section>

        <section className="-mt-10 pb-10" aria-label={t("heroStrip.ariaLabel")}>
          <div className="relative -mx-[calc(50vw-50%)] w-screen overflow-hidden py-4 marquee-fade">
            <div className="college-strip-track flex w-fit gap-5">
              {[...HERO_STRIP, ...HERO_STRIP].map((item, index) => (
                <figure
                  key={`${item.src}-${index}`}
                  className="w-[42rem] max-w-[82vw] flex-shrink-0 overflow-hidden rounded-lg border border-border bg-bg-card shadow-[0_10px_30px_rgba(4,83,203,0.10)]"
                >
                  <div className="aspect-[16/9] bg-white p-2">
                    <img src={item.src} alt="" className="h-full w-full object-contain" />
                  </div>
                  <figcaption className="border-t border-border px-4 py-2 text-[0.78rem] font-mono uppercase tracking-[0.06em] text-text-muted">
                    {t(`heroStrip.items.${item.key}`)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="container scroll-mt-24 py-16" aria-labelledby="roles-title">
          <SectionIntro eyebrow={t("roles.eyebrow")} title={t("roles.title")} intro={t("roles.intro")} id="roles-title" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role, index) => {
              const Icon = ROLE_ICONS[index] ?? ShieldCheck;
              return (
                <article
                  key={role.title}
                  className="group rounded-lg border border-border bg-bg-card p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-accent"
                >
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                  <h3 className="mt-5 font-serif text-2xl font-light text-text">{role.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{role.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-[linear-gradient(135deg,rgba(4,83,203,0.08),rgba(245,130,32,0.08))] py-16" aria-labelledby="modules-title">
          <div className="container">
            <SectionIntro eyebrow={t("modules.eyebrow")} title={t("modules.title")} intro={t("modules.intro")} id="modules-title" />
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
              {modules.map((module, index) => (
                <article key={module.title} className="min-h-[13rem] bg-bg-card p-6">
                  <p className="text-sm text-text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 font-sans text-base font-semibold text-text">{module.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="interfaces" className="container scroll-mt-24 py-16" aria-labelledby="showcase-title">
          <SectionIntro eyebrow={t("showcase.eyebrow")} title={t("showcase.title")} intro={t("showcase.intro")} id="showcase-title" />
          <div className="mt-12 grid gap-10">
            {shots.map((shot, index) => (
              <figure
                key={shot.image}
                className={[
                  "group rounded-lg border border-border bg-bg-card shadow-[0_18px_55px_rgba(0,0,0,0.08)]",
                  index % 2 === 1 ? "lg:ml-20" : "lg:mr-20",
                ].join(" ")}
              >
                <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
                  <div
                    className={
                      shot.format === "mobile"
                        ? "mx-auto w-full max-w-[18rem] overflow-hidden rounded-lg border border-border bg-bg-alt"
                        : "min-w-0 overflow-hidden rounded-lg border border-border bg-bg-alt"
                    }
                  >
                    <img src={shot.image} alt={shot.alt} className="h-full w-full object-contain" />
                  </div>
                  <figcaption className="p-2">
                  <h3 className="font-serif text-2xl font-light text-text">{shot.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{shot.caption}</p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </section>

        <CollegeCommercial onRequestQuote={openQuote} />

        <section id="impact" className="scroll-mt-24 border-y border-border bg-[linear-gradient(135deg,rgba(4,83,203,0.06),rgba(245,130,32,0.08))] py-16" aria-labelledby="college-impact-title">
          <div className="container">
            <header className="mb-10 max-w-3xl">
              <p className="text-sm text-text-muted">{t("impact.eyebrow")}</p>
              <h2 id="college-impact-title" className="mt-4 font-serif text-4xl font-light text-accent">
                {t("impact.title")}
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">{t("impact.intro")}</p>
            </header>
            <SdgImpactGrid items={sdgs} variant="college" />
          </div>
        </section>
      </main>
      <Footer />
      <CollegeQuoteDialog
        open={quoteOpen}
        plan={quotePlan}
        studentCount={quoteStudentCount}
        onClose={() => setQuoteOpen(false)}
      />

      <style jsx>{`
        .college-grid {
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(180deg, black 0%, transparent 85%);
          opacity: 0.22;
        }

        .college-strip-track {
          animation: collegeStrip 42s linear infinite;
        }

        :global(.marquee-fade:hover) .college-strip-track {
          animation-play-state: paused;
        }

        @keyframes collegeStrip {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.625rem));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .college-strip-track {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

function SectionIntro({
  eyebrow,
  title,
  intro,
  id,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  id: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-sm text-text-muted">{eyebrow}</p>
      <h2 id={id} className="mt-4 font-serif text-4xl font-light text-accent">
        {title}
      </h2>
      <p className="mt-4 leading-relaxed text-text-secondary">{intro}</p>
    </header>
  );
}
