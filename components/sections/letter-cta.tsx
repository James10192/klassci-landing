"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { track } from "@/lib/analytics/track";

export function LetterCta() {
  const t = useTranslations("letter");
  const locale = useLocale() as "fr" | "en";

  const onCtaClick = useCallback(() => {
    track("cta_click", { location: "letter", locale });
  }, [locale]);

  return (
    <section className="py-section container" aria-labelledby="letter-heading">
      <div className="max-w-[680px] mx-auto bg-bg-card border border-border rounded-lg p-10 lg:p-12 text-center">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
          {t("badge")}
        </p>

        <h2
          id="letter-heading"
          className="font-serif font-light text-section-h2 mt-3 mb-4"
        >
          {t("title")}
        </h2>

        <p className="text-text-secondary max-w-[40ch] mx-auto mb-8">
          {t("text")}
        </p>

        <a
          href="#contact"
          onClick={onCtaClick}
          className={[
            "inline-flex items-center justify-center gap-2",
            "bg-accent text-white px-5 py-2.5 rounded text-[0.875rem] font-medium",
            "border border-accent",
            "transition-all duration-200 ease-klassci",
            "hover:bg-accent-hover hover:border-accent-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(4,83,203,0.25)]",
          ].join(" ")}
          style={{ letterSpacing: "-0.02em" }}
        >
          <span>{t("cta")}</span>
          <span aria-hidden className="opacity-80">
            →
          </span>
        </a>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          a {
            transition: none !important;
          }
          a:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
