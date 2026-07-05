"use client";

import Image from "next/image";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Calculator from "lucide-react/dist/esm/icons/calculator";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import MonitorSmartphone from "lucide-react/dist/esm/icons/monitor-smartphone";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Users from "lucide-react/dist/esm/icons/users";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Footer } from "@/components/sections/footer";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "@/i18n/navigation";

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

const ROLE_ICONS = [ShieldCheck, UserCheck, Calculator, GraduationCap, Users, MonitorSmartphone];

const HERO_STRIP = [
  { src: "/img/college/current-dashboard.png", label: "Dashboard" },
  { src: "/img/college/current-parents.png", label: "Parents" },
  { src: "/img/college/current-grades.png", label: "Notes" },
  { src: "/img/college/current-timetable.png", label: "Emploi du temps" },
  { src: "/img/college/current-settings.png", label: "Paramètres" },
];

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
  const roles = t.raw("roles.items") as RoleItem[];
  const modules = t.raw("modules.items") as ModuleItem[];
  const shots = t.raw("showcase.items") as ShotItem[];
  const docsHref = `/${locale}/docs/college`;

  return (
    <>
      <main className="overflow-hidden bg-bg text-text">
        <nav className="fixed left-0 right-0 top-0 z-50 h-[57px] border-b border-border bg-[var(--nav-bg)] backdrop-blur-md backdrop-saturate-150">
          <div className="container flex h-full items-center justify-between gap-6">
            <Link href="/" aria-label="KLASSCI College">
              <CollegeLogo />
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <a href="#fonctionnalites" className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                Fonctionnalités
              </a>
              <a href="#interfaces" className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                Interfaces
              </a>
              <a href="#tarifs" className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                Devis
              </a>
              <a href={docsHref} className="inline-flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-text-secondary transition-colors hover:text-text">
                <BookOpen className="h-4 w-4" aria-hidden />
                Docs
              </a>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <ThemeToggle className="hidden sm:inline-flex" />
              <a href="#contact" className="hidden rounded border border-accent bg-accent px-3.5 py-1.5 text-[0.875rem] font-medium text-white transition-colors hover:bg-accent-hover sm:inline-flex">
                Contact
              </a>
            </div>
          </div>
        </nav>

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
              <h1 className="max-w-[12ch] font-serif text-[clamp(2.7rem,7vw,5.3rem)] font-light leading-none text-[#0f3f8c] dark:text-white">
                {t("hero.title")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#tarifs"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#f58220] px-5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(245,130,32,0.28)] hover:bg-[#e87512]"
                >
                  {t("hero.primaryCta")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#interfaces"
                  className="inline-flex min-h-11 items-center justify-center rounded border border-border bg-bg-card px-5 text-sm font-medium text-text hover:border-border-strong"
                >
                  {t("hero.secondaryCta")}
                </a>
              </div>
            </div>

            <MockupStage />
          </div>
        </section>

        <section className="-mt-10 pb-10" aria-label="Aperçu des interfaces KLASSCI College">
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
                    {item.label}
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

        <section id="tarifs" className="container scroll-mt-24 py-16" aria-labelledby="quote-title">
          <div className="grid gap-8 rounded-lg border border-border bg-bg-card p-8 lg:grid-cols-[1fr_0.8fr] lg:p-10">
            <div>
              <p className="text-sm text-text-muted">{t("quote.eyebrow")}</p>
              <h2 id="quote-title" className="mt-4 font-serif text-4xl font-light text-text">
                {t("quote.title")}
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{t("quote.text")}</p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <a
                id="contact"
                href="mailto:contact@klassci.com?subject=Demande%20de%20devis%20KLASSCI%20College"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#f58220] px-5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(245,130,32,0.24)] hover:bg-[#e87512]"
              >
                {t("quote.cta")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <p className="text-center text-sm text-text-muted">{t("quote.note")}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />

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

function MockupStage() {
  return (
    <div className="relative min-h-[38rem] [perspective:1300px]">
      <div className="college-orbit absolute inset-0 [transform-style:preserve-3d]">
        <div className="absolute left-0 top-8 w-[88%] [transform:translateZ(70px)_rotateY(-7deg)]">
          <LaptopFrame>
            <img
              src="/img/college/current-dashboard.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </LaptopFrame>
        </div>

        <div className="absolute bottom-4 right-3 w-[28%] min-w-[9.5rem] [transform:translateZ(190px)_rotateY(11deg)]">
          <PhoneFrame>
            <img
              src="/img/college/current-mobile-dashboard.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </PhoneFrame>
        </div>

      </div>

      <style jsx>{`
        .college-orbit {
          animation: collegeOrbit 13s ease-in-out infinite;
        }

        @keyframes collegeOrbit {
          0%, 100% {
            transform: rotateX(7deg) rotateY(-8deg);
          }
          50% {
            transform: rotateX(10deg) rotateY(5deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .college-orbit {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function LaptopFrame({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[1.1rem] border border-border bg-[#111827] p-2 shadow-[0_34px_90px_rgba(4,83,203,0.22)]">
      <div className="flex h-5 items-center gap-1.5 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className={compact ? "aspect-[16/9] overflow-hidden rounded-md bg-white" : "aspect-[16/9] overflow-hidden rounded-md bg-white"}>
        {children}
      </div>
      <div className="mx-auto mt-2 h-2 w-1/3 rounded-full bg-white/18" />
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-black/20 bg-[#111827] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
      <div className="mx-auto mb-1 h-1.5 w-14 rounded-full bg-white/18" />
      <div className="aspect-[390/844] overflow-hidden rounded-[1.45rem] bg-white">
        {children}
      </div>
    </div>
  );
}
