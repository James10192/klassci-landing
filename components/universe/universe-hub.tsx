"use client";

import Image from "next/image";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Laptop from "lucide-react/dist/esm/icons/laptop";
import School from "lucide-react/dist/esm/icons/school";
import { useLocale, useTranslations } from "next-intl";

import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";

type DoorKey = "universite" | "college" | "lms";
type DoorIcon = typeof GraduationCap;

const DOORS: Array<{
  key: DoorKey;
  href: "/universite" | "/college" | "/lms";
  Icon: DoorIcon;
}> = [
  { key: "universite", href: "/universite", Icon: GraduationCap },
  { key: "college", href: "/college", Icon: School },
  { key: "lms", href: "/lms", Icon: Laptop },
];

export function UniverseHub() {
  const t = useTranslations("welcome");
  const locale = useLocale() as "fr" | "en";
  const docsHref = `/${locale}/docs`;

  return (
    <main className="min-h-screen overflow-hidden scroll-smooth bg-bg text-text">
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo className="[&_img]:h-9" />
          <div className="flex items-center gap-2 text-sm">
            <Link href="/universite" className="hidden px-3 py-2 text-text-secondary hover:text-text sm:inline-flex">
              {t("doors.universite.name")}
            </Link>
            <Link href="/college" className="hidden px-3 py-2 text-text-secondary hover:text-text sm:inline-flex">
              {t("doors.college.name")}
            </Link>
            <a href={docsHref} className="inline-flex min-h-11 items-center gap-2 rounded border border-border px-3 text-text-secondary hover:text-text">
              <BookOpen className="h-4 w-4" aria-hidden />
              {t("docs")}
            </a>
          </div>
        </div>
      </nav>

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
                className="absolute left-8 top-8 w-[78%] rounded-lg border border-border bg-bg-card shadow-[0_30px_80px_rgba(4,83,203,0.18)]"
              />
              <Image
                src="/img/college/current-dashboard.png"
                alt=""
                width={1200}
                height={760}
                className="absolute bottom-10 right-0 w-[66%] rounded-lg border border-border bg-bg-card shadow-[0_24px_70px_rgba(26,26,26,0.16)]"
              />
              <div className="absolute bottom-2 left-6 h-48 w-28 rounded-[1.25rem] border border-border bg-bg-card p-2 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                <Image
                  src="/img/college/current-parents.png"
                  alt=""
                  width={1440}
                  height={1000}
                  className="h-full w-full rounded-[1rem] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="univers" className="container relative z-10 scroll-mt-24 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {DOORS.map(({ key, href, Icon }, index) => (
            <article
              key={key}
              className="group relative min-h-[18rem] overflow-hidden rounded-lg border border-border bg-bg-card p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--accent-light),transparent_45%)] opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex h-full flex-col">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm text-text-muted">{t(`doors.${key}.tag`)}</span>
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                </div>
                <h2 className="font-serif text-3xl font-light text-text">
                  {t(`doors.${key}.name`)}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  {t(`doors.${key}.desc`)}
                </p>
                <Link
                  href={href}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 pt-8 text-sm font-medium text-accent"
                >
                  {t(`doors.${key}.cta`)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </article>
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
