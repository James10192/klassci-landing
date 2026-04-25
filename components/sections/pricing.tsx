"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { track } from "@/lib/analytics/track";

type TierKey = "essentiel" | "pro" | "elite";
type TierVariant = "light" | "highlight" | "dark";
type TierCtaStyle = "primary" | "outline" | "dark";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface TierPricing {
  firstYear: string;
  renewal: string;
  monthly: string;
}

interface PricingTier {
  key: TierKey;
  name: string;
  tagline: string;
  pricing: TierPricing;
  features: PricingFeature[];
  cta: string;
  ctaStyle: TierCtaStyle;
  featured: boolean;
  variant: TierVariant;
}

const PRICING_LOCATION = {
  essentiel: "pricing_essentiel",
  pro: "pricing_pro",
  elite: "pricing_elite",
} as const satisfies Record<TierKey, `pricing_${TierKey}`>;

export function Pricing() {
  const t = useTranslations("pricing");
  const locale = useLocale() as "fr" | "en";

  const tiers = t.raw("tiers") as PricingTier[];
  const currency = t("currency");
  const firstYearLabel = t("firstYearLabel");
  const renewalPrefix = t("renewalPrefix");
  const renewalSuffix = t("renewalSuffix");
  const orMonthlyLabel = t("orMonthlyLabel");
  const perMonthSuffix = t("perMonthSuffix");

  const onCtaClick = useCallback(
    (key: TierKey) => {
      track("cta_click", { location: PRICING_LOCATION[key], locale });
    },
    [locale],
  );

  return (
    <section
      id="tarifs"
      className="container py-12 lg:py-16"
      aria-labelledby="pricing-heading"
    >
      {/* Compact header so the 3 tiers can fit in ~100vh on standard laptops */}
      <div className="text-center mb-8 lg:mb-10">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.7rem] text-text-muted mb-2.5">
          03 — {locale === "fr" ? "Tarifs" : "Pricing"}
        </p>
        <h2
          id="pricing-heading"
          className="font-serif font-light text-[2rem] lg:text-[2.5rem] leading-[1.1] text-accent mb-2"
        >
          {t("title")}
        </h2>
        <p className="text-text-secondary max-w-[40rem] mx-auto text-[0.9rem] leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* 3 tiers, baseline aligned (items-stretch -> equal height + CTAs bottom). */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-stretch">
        {tiers.map((tier) => (
          <TierCard
            key={tier.key}
            tier={tier}
            currency={currency}
            firstYearLabel={firstYearLabel}
            renewalPrefix={renewalPrefix}
            renewalSuffix={renewalSuffix}
            orMonthlyLabel={orMonthlyLabel}
            perMonthSuffix={perMonthSuffix}
            popularBadge={t("popularBadge")}
            onCtaClick={onCtaClick}
          />
        ))}
      </div>

      <p className="mt-6 text-center font-mono uppercase tracking-[0.08em] text-[0.68rem] text-text-muted max-w-[44rem] mx-auto leading-relaxed">
        {t("footer")}
      </p>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global(.tier-card-hover) {
            transition: none !important;
          }
          :global(.tier-card-hover:hover) {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

interface TierCardProps {
  tier: PricingTier;
  currency: string;
  firstYearLabel: string;
  renewalPrefix: string;
  renewalSuffix: string;
  orMonthlyLabel: string;
  perMonthSuffix: string;
  popularBadge: string;
  onCtaClick: (key: TierKey) => void;
}

function TierCard({
  tier,
  currency,
  firstYearLabel,
  renewalPrefix,
  renewalSuffix,
  orMonthlyLabel,
  perMonthSuffix,
  popularBadge,
  onCtaClick,
}: TierCardProps) {
  const isFeatured = tier.featured;
  const isDark = tier.variant === "dark";
  const isHighlight = tier.variant === "highlight";

  // Three distinct visual identities, all baseline-aligned (no -my offset)
  const cardClasses = [
    "tier-card-hover",
    "relative flex flex-col h-full p-6 lg:p-7 rounded-lg",
    "transition-shadow duration-300 ease-klassci",
    isDark
      ? "bg-[#0a3d8f] text-white shadow-[0_8px_24px_rgba(10,61,143,0.20)] hover:shadow-[0_12px_32px_rgba(10,61,143,0.30)]"
      : isHighlight
      ? "bg-accent-light/70 border border-brand-orange/30 shadow-[0_6px_18px_rgba(245,130,32,0.10)] hover:shadow-[0_10px_24px_rgba(245,130,32,0.16)]"
      : "bg-white border border-border hover:border-border-strong hover:shadow-[0_6px_18px_rgba(4,83,203,0.08)]",
  ]
    .filter(Boolean)
    .join(" ");

  const taglineColor = isDark ? "text-white/70" : "text-text-muted";
  const dividerColor = isDark ? "bg-white/15" : "bg-border";
  const labelColor = isDark ? "text-white/60" : "text-text-muted";
  const renewalColor = isDark ? "text-white/75" : "text-text-secondary";
  const featureTextColor = isDark ? "text-white/90" : "text-text-secondary";
  const featureFirstColor = isDark ? "text-white" : "text-text";

  return (
    <div className={cardClasses}>
      {isFeatured && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.10em] text-[0.6rem] bg-brand-orange text-white px-2.5 py-0.5 rounded-full shadow-[0_3px_8px_rgba(245,130,32,0.30)] whitespace-nowrap">
          {popularBadge}
        </span>
      )}

      {/* Tier name + tagline — compact */}
      <div className="mb-4">
        <h3
          className={[
            "font-serif font-light text-[1.6rem] mb-1 leading-none",
            isDark ? "text-brand-orange" : isHighlight ? "text-accent" : "text-text",
          ].join(" ")}
        >
          {tier.name}
        </h3>
        <p className={`text-[0.78rem] leading-snug ${taglineColor}`}>
          {tier.tagline}
        </p>
      </div>

      {/* Price block — collapsed to 4 lines: hero + first-year inline, renewal, monthly */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className={[
              "font-serif font-light text-[2rem] leading-none tabular-nums",
              isDark ? "text-white" : "text-text",
            ].join(" ")}
          >
            {tier.pricing.firstYear}
          </span>
          <span
            className={[
              "font-mono uppercase tracking-[0.06em] text-[0.7rem]",
              isDark ? "text-white/70" : "text-text-secondary",
            ].join(" ")}
          >
            {currency}
          </span>
          <span className={`text-[0.72rem] font-mono uppercase tracking-[0.06em] ml-1 ${labelColor}`}>
            · {firstYearLabel}
          </span>
        </div>

        <p className={`mt-1.5 text-[0.78rem] leading-tight ${renewalColor}`}>
          {renewalPrefix}{" "}
          <span className={isDark ? "font-medium text-white" : "font-medium text-text"}>
            {tier.pricing.renewal} {currency}
          </span>{" "}
          / an {renewalSuffix}
        </p>

        <p className={`mt-0.5 text-[0.78rem] leading-tight ${renewalColor}`}>
          <span className={`font-mono uppercase tracking-[0.06em] text-[0.65rem] ${labelColor}`}>
            {orMonthlyLabel} —
          </span>{" "}
          <span className={isDark ? "font-medium text-white" : "font-medium text-text"}>
            {tier.pricing.monthly} {currency}
          </span>{" "}
          {perMonthSuffix}
        </p>
      </div>

      <div className={`h-px ${dividerColor} mb-4`} />

      {/* Features — tight spacing, simple stroke check */}
      <ul className="space-y-1.5 mb-5 flex-1">
        {tier.features?.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[0.82rem] leading-snug">
            <Check
              className={[
                "size-3.5 shrink-0 mt-[0.18rem]",
                isDark
                  ? "text-brand-orange"
                  : isHighlight
                  ? "text-brand-orange"
                  : "text-accent",
              ].join(" ")}
              strokeWidth={2.75}
              aria-hidden
            />
            <span
              className={[
                featureTextColor,
                i === 0 ? `font-medium ${featureFirstColor}` : "",
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
          tier.ctaStyle === "primary"
            ? "mt-auto inline-flex items-center justify-center bg-accent text-white px-4 py-2.5 rounded text-[0.85rem] font-medium hover:bg-accent-hover transition-colors shadow-[0_3px_10px_rgba(4,83,203,0.18)]"
            : tier.ctaStyle === "dark"
            ? "mt-auto inline-flex items-center justify-center bg-brand-orange text-white px-4 py-2.5 rounded text-[0.85rem] font-medium hover:bg-[#e07b1c] transition-colors shadow-[0_3px_10px_rgba(245,130,32,0.30)]"
            : "mt-auto inline-flex items-center justify-center border border-border-strong text-text bg-white rounded px-4 py-2.5 text-[0.85rem] font-medium hover:bg-bg-alt hover:border-text transition-all"
        }
        style={{ letterSpacing: "-0.01em" }}
      >
        {tier.cta}
      </a>
    </div>
  );
}
