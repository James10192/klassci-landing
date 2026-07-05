"use client";

import Image from "next/image";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Laptop from "lucide-react/dist/esm/icons/laptop";
import Menu from "lucide-react/dist/esm/icons/menu";
import School from "lucide-react/dist/esm/icons/school";
import X from "lucide-react/dist/esm/icons/x";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UniverseContactDialog } from "@/components/universe/universe-contact-dialog";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics/track";

type DoorKey = "universite" | "college" | "lms";
type DoorIcon = typeof GraduationCap;

const DOORS: Array<{
  key: DoorKey;
  href: "/universite" | "/college" | "/lms";
  Icon: DoorIcon;
  image: string;
  tone: string;
  accent: string;
}> = [
  {
    key: "universite",
    href: "/universite",
    Icon: GraduationCap,
    image: "/img/dashboard/01-dashboard.png",
    tone: "from-[#0453cb]/60 to-[#f58220]/40",
    accent: "#0453cb",
  },
  {
    key: "college",
    href: "/college",
    Icon: School,
    image: "/img/college/current-dashboard.png",
    tone: "from-[#f58220]/50 to-[#0453cb]/40",
    accent: "#f58220",
  },
  {
    key: "lms",
    href: "/lms",
    Icon: Laptop,
    image: "/img/impact/virtual-class.svg",
    tone: "from-[#0453cb]/50 to-[#f58220]/30",
    accent: "#0453cb",
  },
];

export function UniverseHub() {
  const t = useTranslations("welcome");
  const nav = useTranslations("nav");
  const locale = useLocale() as "fr" | "en";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const docsHref = `/${locale}/docs`;
  const homeHref = `/${locale}`;
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openContact = useCallback(() => {
    setMobileOpen(false);
    setContactOpen(true);
    track("cta_click", { location: "hub_nav_contact", locale });
  }, [locale]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <main className="min-h-screen overflow-hidden scroll-smooth bg-bg text-text">
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo className="[&_img]:h-9" />
          <div className="hidden items-center gap-1 text-sm md:flex">
            <a href={homeHref} className="px-3 py-2 font-medium text-text-secondary transition-colors hover:text-text">
              {nav("home")}
            </a>
            <Link href="/universite" className="px-3 py-2 font-medium text-text-secondary transition-colors hover:text-text">
              {t("doors.universite.name")}
            </Link>
            <Link href="/college" className="px-3 py-2 font-medium text-text-secondary transition-colors hover:text-text">
              {t("doors.college.name")}
            </Link>
            <Link href="/lms" className="px-3 py-2 font-medium text-text-secondary transition-colors hover:text-text">
              {t("doors.lms.name")}
            </Link>
            <a href={docsHref} className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-text-secondary transition-colors hover:text-text">
              <BookOpen className="h-4 w-4" aria-hidden />
              {nav("docs")}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={openContact}
              className="hidden min-h-11 items-center rounded border border-accent bg-accent px-3.5 text-sm font-medium text-white transition-all hover:bg-accent-hover sm:inline-flex"
            >
              {nav("contact")}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded border border-border text-text md:hidden"
              aria-label={mobileOpen ? nav("menuClose") : nav("menuOpen")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-7 bg-bg px-6 pt-20 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <a
            href={homeHref}
            onClick={closeMobile}
            className="font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent"
          >
            {nav("home")}
          </a>
          {DOORS.map(({ key, href, Icon }) => (
            <Link
              key={key}
              href={href}
              onClick={closeMobile}
              className="inline-flex items-center gap-3 font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent"
            >
              <Icon className="h-6 w-6" aria-hidden />
              {t(`doors.${key}.name`)}
            </Link>
          ))}
          <button
            type="button"
            onClick={openContact}
            className="font-serif text-[1.75rem] font-light text-accent transition-colors hover:text-accent-hover"
          >
            {nav("contactCta")}
          </button>
          <a
            href={docsHref}
            onClick={closeMobile}
            className="inline-flex items-center gap-3 font-serif text-[1.75rem] font-light text-text transition-colors hover:text-accent"
          >
            <BookOpen className="h-6 w-6" aria-hidden />
            {nav("docs")}
          </a>
          <div className="mt-4 flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}

      <UniverseContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />

      <section className="relative flex min-h-screen items-center pt-20">
        <div className="absolute inset-0 opacity-70" aria-hidden>
          <div className="hub-grid absolute inset-0" />
          <div className="hub-stage absolute inset-x-0 top-20 mx-auto h-[42rem] max-w-5xl" />
        </div>

        <div className="container relative z-10 grid gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="animate-fade-up">
            <Image
              src="/img/logo-klassci-full.png"
              alt="KLASSCI"
              width={469}
              height={179}
              priority
              className="mb-7 h-16 w-auto"
            />
            <p className="mb-5 inline-flex rounded border border-border bg-bg-card px-3 py-1 text-xs font-medium text-text-secondary shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              {t("kicker")}
            </p>
            <h1 className="max-w-[11ch] font-serif text-[clamp(3rem,8vw,5.8rem)] font-light leading-none text-text">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {t("subtitle")}
            </p>
            <p className="mt-8 max-w-md text-sm text-text-muted">
              {t("footNote")}
            </p>
            <a
              href="#univers"
              className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#f58220] px-5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(245,130,32,0.28)] transition-transform hover:-translate-y-0.5"
            >
              Voir les univers
              <ChevronDown className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <div className="relative min-h-[34rem] [perspective:1200px]">
            <div className="hub-orbit absolute inset-0">
              <Image
                src="/img/dashboard/01-dashboard.png"
                alt=""
                width={1200}
                height={760}
                priority
                className="absolute left-10 top-4 w-[80%] rounded-lg border border-border bg-bg-card shadow-[0_30px_80px_rgba(4,83,203,0.18)]"
              />
              <Image
                src="/img/college/current-dashboard.png"
                alt=""
                width={1200}
                height={760}
                className="absolute bottom-8 right-0 w-[74%] rounded-lg border border-border bg-bg-card shadow-[0_24px_70px_rgba(26,26,26,0.16)]"
              />
              <div className="absolute bottom-1 left-3 h-64 w-32 rounded-[1.5rem] border-[8px] border-[#111827] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                <img
                  src="/img/college/current-mobile-dashboard.png"
                  alt=""
                  className="h-full w-full rounded-[1rem] object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="univers" className="container relative z-10 scroll-mt-24 pb-20">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">Univers KLASSCI</p>
            <h2 className="mt-2 font-serif text-3xl font-light text-accent md:text-4xl">Choisissez votre environnement</h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-relaxed text-text-secondary md:block">
            Trois portes, une même exigence produit : clarté, rapidité et suivi fiable pour chaque acteur.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {DOORS.map(({ key, href, Icon, image, tone, accent }) => (
            <motion.article
              key={key}
              whileHover={{ y: -7, rotateX: 1, rotateY: -1 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="group relative min-h-[19rem] overflow-hidden rounded-lg border border-border bg-[#08152d] shadow-[0_20px_60px_rgba(4,83,203,0.10)] [transform-style:preserve-3d]"
            >
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top opacity-75 transition duration-500 group-hover:scale-[1.055] group-hover:opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,21,45,0.12),rgba(8,21,45,0.78))]" />
              <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-45 transition-opacity duration-300 group-hover:opacity-25`} />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                <span className="rounded border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {t(`doors.${key}.tag`)}
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/30 bg-white/15 text-white backdrop-blur-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </div>

              <div className="relative flex min-h-[19rem] flex-col justify-end p-5 text-white">
                <h2 className="font-serif text-3xl font-light leading-tight text-white">
                  {t(`doors.${key}.name`)}
                </h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-white/90">
                  {t(`doors.${key}.desc`)}
                </p>
                <Link
                  href={href}
                  className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded border border-white/28 bg-white px-4 text-sm font-semibold text-[#08152d] transition-all group-hover:-translate-y-0.5"
                  style={{ boxShadow: `0 16px 35px ${accent}2d` }}
                >
                  {t(`doors.${key}.cta`)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .hub-grid {
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at 50% 35%, black, transparent 70%);
          opacity: 0.28;
        }

        .hub-stage {
          background: linear-gradient(135deg, rgba(4, 83, 203, 0.14), rgba(245, 130, 32, 0.12));
          clip-path: polygon(8% 10%, 92% 0, 100% 72%, 18% 100%);
        }

        .hub-orbit {
          transform-style: preserve-3d;
          transform: rotateX(9deg) rotateY(-10deg);
          animation: hubOrbit 12s ease-in-out infinite;
        }

        @keyframes hubOrbit {
          0%, 100% {
            transform: rotateX(9deg) rotateY(-10deg);
          }
          50% {
            transform: rotateX(11deg) rotateY(4deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hub-orbit {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
