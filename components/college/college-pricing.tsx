"use client";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  COLLEGE_PLAN_CAPACITY,
  COLLEGE_PLAN_PRICES,
  formatCompactFcfa,
  formatCollegePlanCapacity,
  formatFcfa,
  getCollegeLaunchPrice,
  type CollegePlanKey,
  type PaidCollegePlanKey,
} from "@/lib/college-pricing";

interface AlternativeTier {
  key: PaidCollegePlanKey;
  name: string;
}

interface ComparisonRow {
  key?: "capacity";
  label: string;
  essentielle: string;
  pro: string;
  elite: string;
}

interface CollegePricingProps {
  onRequestQuote: (plan: CollegePlanKey) => void;
}

export function CollegePricing({ onRequestQuote }: CollegePricingProps) {
  const t = useTranslations("college.sales.pricing");
  const offer = useTranslations("college.sales.offer");
  const locale = useLocale() as "fr" | "en";
  const [compareOpen, setCompareOpen] = useState(false);
  const elite = t.raw("elite") as {
    eyebrow: string;
    brand: string;
    name: string;
    currency: string;
    period: string;
    tagline: string;
    features: string[];
    cta: string;
  };
  const common = t.raw("common") as { title: string; items: string[]; highlight: string };
  const alternatives = t.raw("alternatives") as {
    intro: string;
    tiers: AlternativeTier[];
    compare: string;
    compareClose: string;
    cta: string;
  };
  const partner = t.raw("partner") as {
    intro: string;
    name: string;
    description: string;
    price: string;
    cta: string;
  };
  const eliteLaunchPrice = formatCompactFcfa(getCollegeLaunchPrice("elite"), locale);
  const eliteRegularPrice = formatCompactFcfa(COLLEGE_PLAN_PRICES.elite, locale);
  const monthlyElitePrice = Math.round(
    COLLEGE_PLAN_PRICES.elite / COLLEGE_PLAN_CAPACITY.elite.max / 12,
  );

  return (
    <section id="tarifs" className="container scroll-mt-24 py-16 lg:py-20" aria-labelledby="college-pricing-title">
      <header className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-text-muted">
          {t("eyebrow")}
        </p>
        <h2 id="college-pricing-title" className="mt-4 font-serif text-4xl font-light leading-tight text-accent lg:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-text-secondary">{t("subtitle")}</p>
      </header>

      <article className="relative mx-auto max-w-5xl overflow-hidden rounded-lg bg-[#0a3d8f] text-white shadow-[0_24px_60px_rgba(10,61,143,0.28)]">
        <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-brand-orange" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <span className="absolute right-4 top-4 z-10 rounded bg-brand-orange px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-white lg:right-6 lg:top-6">
          {offer("badge")}
        </span>

        <div className="relative px-7 py-10 lg:px-14 lg:py-14">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white/70">{elite.eyebrow}</p>
          <h3 className="mt-4 font-serif text-[2.25rem] font-light leading-none text-white lg:text-5xl">
            <span className="text-white/90">{elite.brand}</span>{" "}
            <span className="italic text-brand-orange">{elite.name}</span>
          </h3>

          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
            <span className="font-serif text-5xl font-light leading-none tabular-nums text-white lg:text-6xl">
              {eliteLaunchPrice}
            </span>
            <span className="pb-1 font-mono text-[0.82rem] uppercase tracking-[0.06em] text-white/70">
              {elite.currency} · {elite.period}
            </span>
          </div>
          <p className="mt-3 text-sm text-white/70">
            <span className="line-through">{eliteRegularPrice} FCFA</span>{" "}
            <span>{locale === "fr" ? "avant remise" : "before discount"}</span>
          </p>
          <p className="mt-5 max-w-2xl font-serif text-2xl font-light italic leading-snug text-white">
            {elite.tagline}
          </p>

          <ul className="mt-6 flex max-w-4xl flex-wrap gap-x-6 gap-y-2.5 text-sm text-white/90">
            {[formatCollegePlanCapacity("elite", locale), ...elite.features].map((feature) => (
              <li key={feature} className="inline-flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={3} aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => onRequestQuote("elite")}
            className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-brand-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover sm:w-auto"
          >
            {elite.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <p className="mt-6 max-w-3xl font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.05em] text-white/70">
            {t("elite.fineprint", { price: eliteRegularPrice })}
          </p>
        </div>
      </article>

      <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-border bg-bg-alt px-6 py-7 lg:px-10">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-text-muted">{common.title}</p>
        <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {common.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.75} aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-border pt-4 text-sm font-medium text-text">
          <span className="text-brand-orange" aria-hidden>★</span> {common.highlight}
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <h3 className="font-serif text-2xl font-light text-text">{alternatives.intro}</h3>
        <ul className="mt-5 border-t border-border">
          {alternatives.tiers.map((tier) => (
            <li key={tier.key} className="grid gap-3 border-b border-border py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold text-text">{tier.name}</span>
                  <span className="text-sm text-text-muted">
                    {formatCollegePlanCapacity(tier.key, locale)}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-accent">
                  {t("alternatives.firstYear", {
                    price: formatCompactFcfa(getCollegeLaunchPrice(tier.key), locale),
                  })}
                </p>
                <p className="text-xs text-text-muted">
                  {t("alternatives.regular", {
                    price: formatCompactFcfa(COLLEGE_PLAN_PRICES[tier.key], locale),
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRequestQuote(tier.key)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-border-strong bg-bg-card px-4 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
              >
                {alternatives.cta} {tier.name.replace("KLASSCI College ", "")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setCompareOpen((value) => !value)}
          aria-expanded={compareOpen}
          aria-controls="college-plan-comparison"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded px-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          {compareOpen ? alternatives.compareClose : alternatives.compare}
          <ChevronDown className={`h-4 w-4 transition-transform ${compareOpen ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {compareOpen && <CollegeComparison />}

      <div className="mx-auto mt-10 max-w-3xl border-y border-border py-7 text-center">
        <p className="font-serif text-2xl font-light text-accent">
          {t("perStudent.value", { price: formatFcfa(monthlyElitePrice, locale) })}
        </p>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-text-muted">
          {t("perStudent.note")}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 rounded-lg border border-dashed border-border-strong bg-bg-card p-6 sm:grid-cols-[1fr_auto] sm:items-center lg:p-8">
        <div>
          <p className="text-sm text-text-muted">{partner.intro}</p>
          <h3 className="mt-1 font-serif text-2xl font-light text-text">{partner.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{partner.description}</p>
          <p className="mt-2 font-semibold text-accent">{partner.price}</p>
        </div>
        <button
          type="button"
          onClick={() => onRequestQuote("partenaire")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-accent px-5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
        >
          {partner.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center font-mono text-[0.67rem] uppercase leading-relaxed tracking-[0.05em] text-text-muted">
        {t("footer")}
      </p>
    </section>
  );
}

function CollegeComparison() {
  const t = useTranslations("college.sales.pricing.comparison");
  const locale = useLocale() as "fr" | "en";
  const rows = t.raw("rows") as ComparisonRow[];
  const headers = t.raw("headers") as Record<"feature" | PaidCollegePlanKey, string>;

  return (
    <div id="college-plan-comparison" className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-lg border border-border bg-bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="px-5 py-4 text-left font-serif text-2xl font-light text-text">{t("title")}</caption>
          <thead className="border-y border-border bg-bg-alt text-text">
            <tr>
              <th scope="col" className="w-[40%] px-5 py-3 font-medium">{headers.feature}</th>
              <th scope="col" className="px-4 py-3 text-center font-medium">{headers.essentielle}</th>
              <th scope="col" className="px-4 py-3 text-center font-medium">{headers.pro}</th>
              <th scope="col" className="bg-accent-light px-4 py-3 text-center font-semibold text-accent">{headers.elite}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = row.key === "capacity"
                ? {
                    essentielle: formatCollegePlanCapacity("essentielle", locale),
                    pro: formatCollegePlanCapacity("pro", locale),
                    elite: formatCollegePlanCapacity("elite", locale),
                  }
                : row;

              return (
                <tr key={row.label} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-5 py-3 font-medium text-text">{row.label}</th>
                  <td className="px-4 py-3 text-center text-text-secondary">{values.essentielle}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">{values.pro}</td>
                  <td className="bg-accent-light/60 px-4 py-3 text-center font-medium text-text">{values.elite}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
