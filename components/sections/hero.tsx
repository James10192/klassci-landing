"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { track } from "@/lib/analytics/track";

interface Screenshot {
  label: string;
  alt: string;
}

const SCREENSHOT_FILES = [
  "/img/dashboard/01-dashboard.png",
  "/img/dashboard/02-students.png",
  "/img/dashboard/03-enrolment.png",
  "/img/dashboard/04-results.png",
  "/img/dashboard/05-planning.png",
  "/img/dashboard/06-attendance.png",
  "/img/dashboard/07-lmd.png",
  "/img/dashboard/08-staff.png",
  "/img/dashboard/09-signin-code.png",
];

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale() as "fr" | "en";

  const screenshots = t.raw("screenshots") as Screenshot[];

  const onPrimary = useCallback(() => {
    track("cta_click", { location: "hero_primary", locale });
  }, [locale]);

  const onSecondary = useCallback(() => {
    track("cta_click", { location: "hero_secondary", locale });
  }, [locale]);

  // Duplicate screenshots once to enable a seamless CSS marquee loop
  const marqueeItems = [
    ...screenshots.map((s, i) => ({ ...s, file: SCREENSHOT_FILES[i], key: `a-${i}` })),
    ...screenshots.map((s, i) => ({ ...s, file: SCREENSHOT_FILES[i], key: `b-${i}` })),
  ];

  return (
    <section
      className="relative pt-[10rem] pb-20 overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Subtle dot grid backdrop — adds editorial texture without weight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at center top, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center top, black 40%, transparent 75%)",
        }}
      />

      <div className="container relative">
        <h1
          id="hero-title"
          className="text-hero-1 max-w-[16ch] mx-auto text-center"
        >
          <span className="gradient-text">{t("title")}</span>
        </h1>

        <p className="mt-6 max-w-[34rem] mx-auto text-center text-hero-sub text-text-secondary">
          {t("subtitle")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#contact"
            onClick={onPrimary}
            className="relative inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded text-[0.875rem] font-medium border border-accent transition-all duration-200 ease-klassci hover:bg-accent-hover hover:border-accent-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(4,83,203,0.25)]"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span>{t("primaryCta")}</span>
            <span className="opacity-60 text-[0.7rem]">{t("primaryCtaSub")}</span>
            <span
              aria-hidden
              className="absolute -inset-[3px] rounded-[6px] bg-accent opacity-0 -z-10 animate-btn-pulse"
            />
          </a>

          <a
            href="#fonctionnalites"
            onClick={onSecondary}
            className="inline-flex items-center gap-2 bg-white/50 dark:bg-white/5 text-text px-5 py-2.5 rounded text-[0.875rem] font-medium border border-border transition-all duration-200 ease-klassci hover:border-border-strong hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("secondaryCta")}
            <span aria-hidden className="text-text-muted">→</span>
          </a>
        </div>

        <p className="mt-6 text-center text-[0.78rem] font-mono uppercase tracking-[0.08em] text-text-muted">
          {t("note")}
        </p>
      </div>

      {/* Marquee — 9 screenshots scrolling horizontally, paused on hover */}
      <div className="relative mt-16 -mx-[calc(50vw-50%)] w-screen overflow-hidden marquee-fade py-3">
        <div className="hero-marquee-track flex gap-6 w-fit">
          {marqueeItems.map((item) => (
            <figure
              key={item.key}
              className="flex-shrink-0 w-[750px] max-w-[80vw] rounded-lg overflow-hidden border border-border bg-bg-card shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200 ease-klassci hover:border-accent hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(4,83,203,0.12)]"
            >
              <div className="relative aspect-[16/10] bg-bg-alt">
                <Image
                  src={item.file}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 80vw, 750px"
                  className="object-cover"
                  priority={item.key === "a-0"}
                  loading={item.key === "a-0" ? "eager" : "lazy"}
                />
              </div>
              <figcaption className="px-4 py-2.5 text-[0.78rem] font-mono uppercase tracking-[0.06em] text-text-muted border-t border-border">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero-marquee-track {
          animation: heroMarquee 40s linear infinite;
        }

        :global(.marquee-fade:hover) .hero-marquee-track {
          animation-play-state: paused;
        }

        @keyframes heroMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.75rem));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
