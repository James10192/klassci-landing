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
  const fromLabel = t("fromLabel");
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
      className="py-section container"
      aria-labelledby="pricing-heading"
    >
      {/* Section header */}
      <div className="text-center mb-14">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
          03 — {locale === "fr" ? "Tarifs" : "Pricing"}
        </p>
        <h2
          id="pricing-heading"
          className="font-serif font-light text-section-h2 text-accent mb-3"
        >
          {t("title")}
        </h2>
        <p className="text-text-secondary max-w-[42rem] mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* 3-tier premium grid. PRO featured (subtle elevation), Elite in dark
          inverted variant for premium signalling. Mobile: stacked. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0 lg:items-stretch">
        {tiers.map((tier) => (
          <TierCard
            key={tier.key}
            tier={tier}
            currency={currency}
            fromLabel={fromLabel}
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

      <p className="mt-10 text-center font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted max-w-[44rem] mx-auto leading-relaxed">
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
  fromLabel: string;
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
  fromLabel,
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

  // Variant-driven styling. Three distinct visual identities:
  // - light: clean white card, blue accents
  // - highlight: warm beige PRO card, lifted, "Recommandé" badge, blue CTA
  // - dark: deep KLASSCI blue ELITE card, white text, orange accents
  const cardClasses = [
    "tier-card-hover",
    "relative flex flex-col h-full",
    "transition-all duration-300 ease-klassci",
    "hover:-translate-y-1",
    isDark
      ? // Elite: dark inverted card
        "bg-[#0a3d8f] text-white p-8 md:p-10 rounded-lg shadow-[0_12px_32px_rgba(10,61,143,0.25)] hover:shadow-[0_16px_40px_rgba(10,61,143,0.35)] lg:my-0"
      : isHighlight
      ? // PRO: highlighted, slightly elevated, accent-light bg
        "bg-accent-light/70 p-8 md:p-10 rounded-lg border border-brand-orange/30 shadow-[0_8px_24px_rgba(245,130,32,0.12)] hover:shadow-[0_12px_32px_rgba(245,130,32,0.20)] lg:-my-2 lg:relative lg:z-10"
      : // Essentiel: clean light card
        "bg-white p-8 md:p-10 rounded-lg border border-border hover:border-border-strong hover:shadow-[0_8px_24px_rgba(4,83,203,0.08)] lg:my-0",
  ]
    .filter(Boolean)
    .join(" ");

  const taglineColor = isDark ? "text-white/70" : "text-text-muted";
  const dividerColor = isDark ? "bg-white/15" : "bg-border";
  const labelColor = isDark ? "text-white/60" : "text-text-muted";
  const renewalColor = isDark ? "text-white/75" : "text-text-secondary";

  return (
    <div className={cardClasses}>
      {isFeatured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.10em] text-[0.65rem] bg-brand-orange text-white px-3 py-1 rounded-full shadow-[0_3px_10px_rgba(245,130,32,0.35)]">
          {popularBadge}
        </span>
      )}

      {/* Tier name + tagline */}
      <div className="mb-6">
        <h3
          className={[
            "font-serif font-light text-3xl mb-2 leading-none",
            isDark ? "text-brand-orange" : isHighlight ? "text-accent" : "text-text",
          ].join(" ")}
        >
          {tier.name}
        </h3>
        <p className={`text-[0.85rem] leading-snug ${taglineColor}`}>
          {tier.tagline}
        </p>
      </div>

      {/* Price block — first year hero, renewal context, then OR monthly */}
      <div>
        <p className={`font-mono uppercase tracking-[0.08em] text-[0.65rem] mb-2 ${labelColor}`}>
          {fromLabel}
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className={[
              "font-serif font-light text-[2.75rem] leading-none tabular-nums",
              isDark ? "text-white" : "text-text",
            ].join(" ")}
          >
            {tier.pricing.firstYear}
          </span>
          <span
            className={[
              "font-mono uppercase tracking-[0.06em] text-[0.75rem]",
              isDark ? "text-white/70" : "text-text-secondary",
            ].join(" ")}
          >
            {currency}
          </span>
        </div>
        <p className={`mt-2 text-[0.78rem] font-mono uppercase tracking-[0.06em] ${labelColor}`}>
          {firstYearLabel}
        </p>

        <p className={`mt-3 text-[0.825rem] ${renewalColor}`}>
          {renewalPrefix}{" "}
          <span className={isDark ? "font-medium text-white" : "font-medium text-text"}>
            {tier.pricing.renewal} {currency}
          </span>{" "}
          / an {renewalSuffix}
        </p>
      </div>

      {/* Monthly alternative — clearly secondary but visible */}
      <div className={`mt-5 pt-5 border-t border-dashed ${isDark ? "border-white/20" : "border-border"}`}>
        <p className={`font-mono uppercase tracking-[0.08em] text-[0.65rem] mb-1.5 ${labelColor}`}>
          {orMonthlyLabel}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span
            className={[
              "font-serif font-light text-2xl leading-none tabular-nums",
              isDark ? "text-white" : "text-text",
            ].join(" ")}
          >
            {tier.pricing.monthly}
          </span>
          <span
            className={[
              "font-mono uppercase tracking-[0.06em] text-[0.7rem]",
              isDark ? "text-white/70" : "text-text-secondary",
            ].join(" ")}
          >
            {currency} {perMonthSuffix}
          </span>
        </div>
      </div>

      <div className={`my-7 h-px ${dividerColor}`} />

      {/* Features — flat list with check icons in tier-appropriate accent */}
      <ul className="space-y-3 mb-8 flex-1">
        {tier.features?.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-[0.875rem]">
            <span
              aria-hidden
              className={[
                "shrink-0 mt-[0.15rem] inline-flex items-center justify-center size-4 rounded-full",
                isDark
                  ? "bg-brand-orange/20 text-brand-orange"
                  : isHighlight
                  ? "bg-brand-orange/15 text-brand-orange"
                  : "bg-accent/10 text-accent",
              ].join(" ")}
            >
              <Check className="size-2.5" strokeWidth={3} aria-hidden />
            </span>
            <span
              className={[
                "leading-snug",
                isDark ? "text-white/90" : "text-text-secondary",
                i === 0 && (isDark ? "text-white" : "font-medium text-text"),
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
            ? "mt-auto inline-flex items-center justify-center bg-accent text-white px-5 py-3 rounded text-[0.875rem] font-medium hover:bg-accent-hover transition-colors shadow-[0_4px_12px_rgba(4,83,203,0.18)]"
            : tier.ctaStyle === "dark"
            ? "mt-auto inline-flex items-center justify-center bg-brand-orange text-white px-5 py-3 rounded text-[0.875rem] font-medium hover:bg-[#e07b1c] transition-colors shadow-[0_4px_12px_rgba(245,130,32,0.30)]"
            : "mt-auto inline-flex items-center justify-center border border-border-strong text-text bg-white rounded px-5 py-3 text-[0.875rem] font-medium hover:bg-bg-alt hover:border-text transition-all"
        }
        style={{ letterSpacing: "-0.01em" }}
      >
        {tier.cta}
      </a>
    </div>
  );
}
