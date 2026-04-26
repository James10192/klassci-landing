"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { track } from "@/lib/analytics/track";

type AlternativeKey = "pro" | "essentiel";
type ChoiceKey = "essentiel" | "pro" | "elite";

interface AlternativeTier {
  key: AlternativeKey;
  name: string;
  capacity: string;
  price: string;
}

interface ComparisonRow {
  label: string;
  essentiel: string;
  pro: string;
  elite: string;
}

interface ComparisonGroup {
  label: string;
  rows: ComparisonRow[];
}

interface PricingRow {
  label: string;
  essentiel: string;
  pro: string;
  elite: string;
}

export function Pricing() {
  const t = useTranslations("pricing");
  const locale = useLocale() as "fr" | "en";
  const [compareOpen, setCompareOpen] = useState(false);

  const onCtaClick = useCallback(
    (
      location:
        | "pricing_essentiel"
        | "pricing_pro"
        | "pricing_elite"
        | "pricing_elite_trial",
    ) => {
      track("cta_click", { location, locale });
    },
    [locale],
  );

  const onCompareToggle = useCallback(() => {
    setCompareOpen((prev) => {
      const next = !prev;
      if (next) {
        track("cta_click", { location: "pricing_compare_open", locale });
      }
      return next;
    });
  }, [locale]);

  const elite = t.raw("elite") as {
    eyebrow: string;
    badge: string;
    brand: string;
    name: string;
    annualPrice: string;
    currency: string;
    perYear: string;
    tagline: string;
    pillars: string[];
    ctaPrimary: string;
    ctaTrial: string;
    fineprint: string;
  };

  const common = t.raw("common") as {
    title: string;
    items: string[];
    highlight: string;
  };

  const alternatives = t.raw("alternatives") as {
    intro: string;
    tiers: AlternativeTier[];
    compareToggle: string;
    compareClose: string;
  };

  const partner = t.raw("partner") as {
    intro: string;
    name: string;
    description: string;
    cta: string;
  };

  const onPartnerClick = useCallback(() => {
    track("cta_click", { location: "pricing_partenaire", locale });
  }, [locale]);

  return (
    <section
      id="tarifs"
      className="container py-16 lg:py-20"
      aria-labelledby="pricing-heading"
    >
      {/* Section header — sober, the hero card carries the weight */}
      <div className="text-center mb-10 lg:mb-12">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.7rem] text-text-muted mb-3">
          03 — {locale === "fr" ? "Tarifs" : "Pricing"}
        </p>
        <h2
          id="pricing-heading"
          className="font-serif font-light text-[2rem] lg:text-[2.5rem] leading-[1.1] text-accent mb-3"
        >
          {t("title")}
        </h2>
        <p className="text-text-secondary max-w-[42rem] mx-auto text-[0.95rem] leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* ELITE HERO — dominant card */}
      <EliteHero
        elite={elite}
        onPrimary={() => onCtaClick("pricing_elite")}
        onTrial={() => onCtaClick("pricing_elite_trial")}
      />

      {/* Common banner — what every tier always gets */}
      <CommonBanner common={common} />

      {/* Quiet alternatives + comparison toggle */}
      <Alternatives
        alternatives={alternatives}
        compareOpen={compareOpen}
        onToggle={onCompareToggle}
      />

      {/* Partner plan — third entry door for cash-constrained schools */}
      <PartnerPlan partner={partner} onClick={onPartnerClick} />

      {/* Comparison panel — collapses by default */}
      {compareOpen && (
        <ComparisonPanel
          subtitle={t("comparison.subtitle")}
          headers={t.raw("comparison.headers") as Record<string, string>}
          groups={t.raw("comparison.groups") as ComparisonGroup[]}
          pricing={
            t.raw("comparison.pricing") as {
              label: string;
              annual: PricingRow;
              firstYear: PricingRow;
              monthly: PricingRow;
            }
          }
          ctas={t.raw("comparison.ctas") as Record<ChoiceKey, string>}
          onChoose={onCtaClick}
        />
      )}

      <p className="mt-10 text-center font-mono uppercase tracking-[0.08em] text-[0.68rem] text-text-muted max-w-[44rem] mx-auto leading-relaxed">
        {t("footer")}
      </p>
    </section>
  );
}

// ------------------------------------------------------------------ ELITE HERO

interface EliteHeroProps {
  elite: {
    eyebrow: string;
    badge: string;
    brand: string;
    name: string;
    annualPrice: string;
    currency: string;
    perYear: string;
    tagline: string;
    pillars: string[];
    ctaPrimary: string;
    ctaTrial: string;
    fineprint: string;
  };
  onPrimary: () => void;
  onTrial: () => void;
}

function EliteHero({ elite, onPrimary, onTrial }: EliteHeroProps) {
  return (
    <div className="relative max-w-5xl mx-auto rounded-2xl bg-[#0a3d8f] text-white overflow-hidden shadow-[0_24px_60px_rgba(10,61,143,0.30)]">
      {/* Decorative orange glow in top-right corner */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-orange/25 blur-[80px] pointer-events-none"
      />
      {/* Subtle grid for texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Recommended badge — pinned top-right */}
      <span className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 inline-flex items-center gap-1 bg-brand-orange text-white px-3 py-1 rounded-full font-mono uppercase tracking-[0.10em] text-[0.65rem] shadow-[0_4px_12px_rgba(245,130,32,0.40)]">
        {elite.badge}
      </span>

      <div className="relative px-7 py-10 lg:px-14 lg:py-14">
        <p className="font-mono uppercase tracking-[0.10em] text-[0.7rem] text-white/65 mb-4">
          {elite.eyebrow}
        </p>

        <h3 className="font-serif font-light text-[2.25rem] lg:text-[3rem] leading-[1.05] mb-5">
          <span className="text-white/85">{elite.brand}</span>{" "}
          <span className="text-brand-orange italic">{elite.name}</span>
        </h3>

        <div className="flex items-baseline gap-2 flex-wrap mb-6">
          <span className="font-serif font-light text-[3rem] lg:text-[4rem] leading-none text-white tabular-nums">
            {elite.annualPrice}
          </span>
          <span className="font-mono uppercase tracking-[0.06em] text-[0.85rem] text-white/70">
            {elite.currency} {elite.perYear}
          </span>
        </div>

        <p className="font-serif italic text-[1.35rem] lg:text-[1.6rem] text-white mb-5 leading-snug">
          {elite.tagline}
        </p>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem] text-white/85 mb-8">
          {elite.pillars.map((pillar) => (
            <li key={pillar} className="inline-flex items-center gap-2">
              <Check
                className="size-4 text-brand-orange shrink-0"
                strokeWidth={3}
                aria-hidden
              />
              <span>{pillar}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <a
            href="#contact"
            onClick={onPrimary}
            className="inline-flex items-center justify-center bg-brand-orange text-white px-6 py-3 rounded text-[0.95rem] font-medium hover:bg-[#e07b1c] transition-colors shadow-[0_4px_14px_rgba(245,130,32,0.40)]"
            style={{ letterSpacing: "-0.01em" }}
          >
            {elite.ctaPrimary}
          </a>
          <a
            href="#contact"
            onClick={onTrial}
            className="inline-flex items-center justify-center border border-white/45 bg-transparent text-white px-6 py-3 rounded text-[0.95rem] font-medium hover:bg-white hover:text-[#0a3d8f] hover:border-white transition-colors"
            style={{ letterSpacing: "-0.01em" }}
          >
            {elite.ctaTrial}
          </a>
        </div>

        <p className="mt-6 font-mono text-[0.7rem] text-white/55 leading-relaxed">
          {elite.fineprint}
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ COMMON BANNER

function CommonBanner({
  common,
}: {
  common: { title: string; items: string[]; highlight: string };
}) {
  return (
    <div className="mt-10 max-w-5xl mx-auto rounded-xl bg-bg-alt border border-border px-6 py-7 lg:px-10 lg:py-8">
      <p className="font-mono uppercase tracking-[0.10em] text-[0.7rem] text-text-muted mb-4">
        {common.title}
      </p>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
        {common.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[0.875rem] text-text-secondary leading-snug"
          >
            <Check
              className="size-3.5 text-accent shrink-0 mt-[0.2rem]"
              strokeWidth={2.75}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="text-[0.92rem] text-text font-medium leading-snug border-t border-border pt-4">
        <span className="text-brand-orange">★</span> {common.highlight}
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ PARTNER PLAN

function PartnerPlan({
  partner,
  onClick,
}: {
  partner: { intro: string; name: string; description: string; cta: string };
  onClick: () => void;
}) {
  return (
    <div className="mt-12 max-w-3xl mx-auto rounded-xl border border-dashed border-border-strong bg-white px-6 py-7 lg:px-8">
      <h3 className="font-serif font-light text-[1.25rem] text-text mb-2 flex items-center gap-2.5">
        <span className="text-brand-orange" aria-hidden>▸</span>
        {partner.intro}
      </h3>
      <p className="font-medium text-text mb-2">{partner.name}</p>
      <p className="text-text-secondary text-[0.9rem] leading-relaxed mb-4">
        {partner.description}
      </p>
      <a
        href="#contact"
        onClick={onClick}
        className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.08em] text-[0.72rem] text-accent hover:text-accent-hover transition-colors"
      >
        → {partner.cta}
      </a>
    </div>
  );
}

// ------------------------------------------------------------------ ALTERNATIVES

interface AlternativesProps {
  alternatives: {
    intro: string;
    tiers: AlternativeTier[];
    compareToggle: string;
    compareClose: string;
  };
  compareOpen: boolean;
  onToggle: () => void;
}

function Alternatives({
  alternatives,
  compareOpen,
  onToggle,
}: AlternativesProps) {
  return (
    <div className="mt-12 lg:mt-14 max-w-3xl mx-auto">
      <h3 className="font-serif font-light text-[1.25rem] text-text mb-5 flex items-center gap-2.5">
        <span className="text-brand-orange" aria-hidden>
          ▸
        </span>
        {alternatives.intro}
      </h3>

      <ul className="space-y-0 mb-5 border-t border-border">
        {alternatives.tiers.map((tier) => (
          <li
            key={tier.key}
            className="flex items-baseline justify-between gap-4 border-b border-border py-3.5"
          >
            <span className="flex items-baseline gap-3 flex-wrap min-w-0">
              <span className="font-medium text-text">{tier.name}</span>
              <span className="text-text-muted text-[0.85rem]">
                {tier.capacity}
              </span>
            </span>
            <span className="font-mono tabular-nums text-[0.875rem] text-text whitespace-nowrap">
              {tier.price}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={compareOpen}
        aria-controls="pricing-comparison"
        className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.08em] text-[0.72rem] text-accent hover:text-accent-hover transition-colors"
      >
        <span>
          {compareOpen
            ? alternatives.compareClose
            : `→ ${alternatives.compareToggle}`}
        </span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${compareOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ COMPARISON

interface ComparisonPanelProps {
  subtitle: string;
  headers: Record<string, string>;
  groups: ComparisonGroup[];
  pricing: {
    label: string;
    annual: PricingRow;
    firstYear: PricingRow;
    monthly: PricingRow;
  };
  ctas: Record<ChoiceKey, string>;
  onChoose: (
    location: "pricing_essentiel" | "pricing_pro" | "pricing_elite",
  ) => void;
}

function ComparisonPanel({
  subtitle,
  headers,
  groups,
  pricing,
  ctas,
  onChoose,
}: ComparisonPanelProps) {
  return (
    <div
      id="pricing-comparison"
      className="mt-8 max-w-5xl mx-auto rounded-xl border border-border bg-bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border bg-bg-alt/40">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.65rem] text-text-muted">
          {subtitle}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.875rem] border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg-alt/30">
              <th
                scope="col"
                className="text-left px-4 py-3 font-mono uppercase tracking-[0.06em] text-[0.7rem] text-text-muted font-medium"
              >
                {headers.feature}
              </th>
              <th
                scope="col"
                className="text-center px-4 py-3 font-serif font-light text-[1rem] text-text"
              >
                {headers.essentiel}
              </th>
              <th
                scope="col"
                className="text-center px-4 py-3 font-serif font-light text-[1rem] text-text"
              >
                {headers.pro}
              </th>
              <th
                scope="col"
                className="text-center px-4 py-3 font-serif font-light text-[1rem] text-brand-orange relative"
              >
                {headers.elite}
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-12 h-px bg-brand-orange" />
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <ComparisonGroupRows key={group.label} group={group} />
            ))}

            {/* Pricing trio */}
            <tr className="border-t-2 border-border">
              <td
                colSpan={4}
                className="px-4 pt-5 pb-2 font-mono uppercase tracking-[0.08em] text-[0.65rem] text-accent"
              >
                {pricing.label}
              </td>
            </tr>
            <PriceRow row={pricing.annual} primary />
            <PriceRow row={pricing.firstYear} />
            <PriceRow row={pricing.monthly} />

            {/* Per-tier CTAs */}
            <tr className="border-t border-border bg-bg-alt/30">
              <td className="px-4 py-4" />
              <td className="px-3 py-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onChoose("pricing_essentiel");
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center w-full max-w-[180px] border border-border-strong text-text bg-white rounded px-3 py-2 text-[0.8rem] font-medium hover:bg-bg-alt transition-colors"
                >
                  {ctas.essentiel}
                </button>
              </td>
              <td className="px-3 py-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onChoose("pricing_pro");
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center w-full max-w-[180px] border border-border-strong text-text bg-white rounded px-3 py-2 text-[0.8rem] font-medium hover:bg-bg-alt transition-colors"
                >
                  {ctas.pro}
                </button>
              </td>
              <td className="px-3 py-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onChoose("pricing_elite");
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center w-full max-w-[180px] bg-brand-orange text-white rounded px-3 py-2 text-[0.8rem] font-medium hover:bg-[#e07b1c] transition-colors shadow-[0_3px_10px_rgba(245,130,32,0.30)]"
                >
                  {ctas.elite}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonGroupRows({ group }: { group: ComparisonGroup }) {
  return (
    <>
      <tr className="border-t border-border">
        <td
          colSpan={4}
          className="px-4 pt-5 pb-2 font-mono uppercase tracking-[0.08em] text-[0.65rem] text-text-muted bg-bg-alt/20"
        >
          {group.label}
        </td>
      </tr>
      {group.rows.map((row) => (
        <tr
          key={row.label}
          className="border-t border-border/60 hover:bg-bg-alt/20 transition-colors"
        >
          <td className="px-4 py-2.5 text-text-secondary leading-snug">
            {row.label}
          </td>
          <td className="px-3 py-2.5 text-center text-text-secondary tabular-nums">
            {row.essentiel}
          </td>
          <td className="px-3 py-2.5 text-center text-text-secondary tabular-nums">
            {row.pro}
          </td>
          <td className="px-3 py-2.5 text-center text-text font-medium tabular-nums bg-brand-orange-light/30">
            {row.elite}
          </td>
        </tr>
      ))}
    </>
  );
}

function PriceRow({ row, primary = false }: { row: PricingRow; primary?: boolean }) {
  return (
    <tr className="border-t border-border/60">
      <td
        className={`px-4 py-2.5 leading-snug ${primary ? "text-text font-medium" : "text-text-muted text-[0.82rem]"}`}
      >
        {row.label}
      </td>
      <td
        className={`px-3 py-2.5 text-center tabular-nums ${primary ? "text-text font-medium" : "text-text-muted text-[0.82rem]"}`}
      >
        {row.essentiel}
      </td>
      <td
        className={`px-3 py-2.5 text-center tabular-nums ${primary ? "text-text font-medium" : "text-text-muted text-[0.82rem]"}`}
      >
        {row.pro}
      </td>
      <td
        className={`px-3 py-2.5 text-center tabular-nums bg-brand-orange-light/30 ${primary ? "text-brand-orange font-semibold" : "text-text-muted text-[0.82rem]"}`}
      >
        {row.elite}
      </td>
    </tr>
  );
}
