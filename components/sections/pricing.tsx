"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { track } from "@/lib/analytics/track";

type TierKey = "free" | "essentiel" | "pro" | "elite";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  key: TierKey;
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: PricingFeature[];
  cta: string;
  ctaStyle: "primary" | "outline";
  featured: boolean;
}

// Map tier key → typed analytics location to satisfy strict EventProps<"cta_click">
const PRICING_LOCATION = {
  free: "pricing_free",
  essentiel: "pricing_essentiel",
  pro: "pricing_pro",
  elite: "pricing_elite",
} as const satisfies Record<TierKey, `pricing_${TierKey}`>;

// Split a price string like "150k FCFA" or "0 FCFA" into number + unit so the
// number can use the serif display while the unit stays in mono. "Sur devis"
// has no unit — we render it whole in the number slot.
function splitPrice(price: string): { number: string; unit: string | null } {
  const match = price.match(/^(\S+)\s+(.+)$/);
  if (!match) return { number: price, unit: null };
  return { number: match[1], unit: match[2] };
}

export function Pricing() {
  const t = useTranslations("pricing");
  const locale = useLocale() as "fr" | "en";

  const tiers = t.raw("tiers") as PricingTier[];

  const onCtaClick = useCallback(
    (key: TierKey) => {
      track("cta_click", { location: PRICING_LOCATION[key], locale });
    },
    [locale],
  );

  return (
    <section
      id="tarifs"
      className="py-section container"
      aria-labelledby="pricing-heading"
    >
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
          03 — {locale === "fr" ? "Tarifs" : "Pricing"}
        </p>
        <h2
          id="pricing-heading"
          className="font-serif font-light text-section-h2 text-accent mb-3"
        >
          {t("title")}
        </h2>
        <p className="text-text-secondary max-w-[34rem] mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* 4-tier border-grid (zed.dev signature). Wrapper carries the rounded
          frame; inner cells are flush. The right-borders below adapt per
          breakpoint to avoid double-borders on the grid edges. */}
      <div className="rounded-lg overflow-hidden border border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier, index) => {
          const isFeatured = tier.featured;
          const isPrimary = tier.ctaStyle === "primary";
          const { number, unit } = splitPrice(tier.price);

          // Border logic per breakpoint:
          // - lg (4 cols): right border on every cell except the last (index 3)
          // - sm (2 cols): right border on cells 0 and 2; bottom border on 0,1
          // - mobile (1 col): bottom border on every cell except the last
          const lgRight = index < 3 ? "lg:border-r lg:border-border" : "";
          const smRight =
            index % 2 === 0
              ? "sm:border-r sm:border-border lg:border-r"
              : "sm:border-r-0";
          const smBottom =
            index < 2 ? "sm:border-b sm:border-border lg:border-b-0" : "";
          const mobileBottom =
            index < tiers.length - 1 ? "border-b border-border sm:border-b-0" : "";

          // Élite tier carries a warm beige tint as a "premium" cue (matches live klassci.com).
          const isElite = tier.key === "elite";

          return (
            <div
              key={tier.key}
              className={[
                "relative flex flex-col p-8 md:p-10 h-full",
                "transition-all duration-300 ease-klassci",
                "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(4,83,203,0.08)]",
                isFeatured ? "bg-accent-light/60" : "",
                isElite ? "bg-bg-alt" : "",
                mobileBottom,
                smBottom,
                smRight,
                lgRight,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isFeatured && (
                <span className="absolute top-3 right-3 font-mono uppercase tracking-[0.08em] text-[0.65rem] bg-brand-orange text-white px-2 py-0.5 rounded shadow-[0_2px_6px_rgba(245,130,32,0.3)]">
                  {t("popularBadge")}
                </span>
              )}

              <h3 className="font-serif font-light text-2xl mb-1">
                {tier.name}
              </h3>
              <p className="text-text-muted text-[0.85rem] mb-6">
                {tier.tagline}
              </p>

              {/* Price block */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif font-light text-[2.5rem] leading-none">
                    {number}
                  </span>
                  {unit && (
                    <span className="font-mono uppercase tracking-[0.06em] text-[0.7rem] text-text-secondary">
                      {unit}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-text-muted text-[0.78rem] font-mono uppercase tracking-[0.06em]">
                  {tier.period}
                </p>
              </div>

              <div className="my-6 h-px bg-border" />

              {/* Features list — guard against undefined/empty */}
              <ul className="space-y-2.5 mb-8">
                {tier.features?.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[0.875rem]"
                  >
                    <span
                      aria-hidden
                      className={
                        f.included
                          ? "text-accent shrink-0 mt-0.5"
                          : "text-text-muted shrink-0 mt-0.5"
                      }
                    >
                      {f.included ? "✓" : "—"}
                    </span>
                    <span
                      className={[
                        f.included ? "text-text-secondary" : "text-text-muted",
                        // First (headline) benefit slightly heavier so it reads as the tier's spine
                        i === 0 && f.included ? "font-medium text-text" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA pinned to bottom for visual alignment across tiers */}
              <a
                href="#contact"
                onClick={() => onCtaClick(tier.key)}
                className={
                  isPrimary
                    ? "mt-auto inline-flex items-center justify-center bg-accent text-white px-4 py-2.5 rounded text-[0.875rem] font-medium hover:bg-accent-hover transition-colors"
                    : "mt-auto inline-flex items-center justify-center border border-border text-text rounded px-4 py-2.5 text-[0.875rem] font-medium hover:border-border-strong hover:bg-bg-alt/50 transition-all"
                }
                style={{ letterSpacing: "-0.01em" }}
              >
                {tier.cta}
              </a>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
        {t("footer")}
      </p>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          div[class*="hover:-translate-y-1"]:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
