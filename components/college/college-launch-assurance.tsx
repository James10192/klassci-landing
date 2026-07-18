"use client";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import CloudCog from "lucide-react/dist/esm/icons/cloud-cog";
import DatabaseBackup from "lucide-react/dist/esm/icons/database-backup";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Headphones from "lucide-react/dist/esm/icons/headphones";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Timer from "lucide-react/dist/esm/icons/timer";
import { useTranslations } from "next-intl";

interface PaymentStep {
  value: string;
  label: string;
}

interface CollegeLaunchAssuranceProps {
  onRequestQuote: () => void;
}

const ASSURANCES = [
  { key: "configuration", icon: CloudCog },
  { key: "migration", icon: DatabaseBackup },
  { key: "training", icon: GraduationCap },
  { key: "backups", icon: ShieldCheck },
  { key: "support", icon: Headphones },
  { key: "onboarding", icon: Timer },
] as const;

export function CollegeLaunchAssurance({ onRequestQuote }: CollegeLaunchAssuranceProps) {
  const t = useTranslations("college.sales.assurance");
  const paymentSteps = t.raw("paymentSteps") as PaymentStep[];

  return (
    <section className="border-y border-border bg-bg-alt py-16 lg:py-20" aria-labelledby="college-assurance-title">
      <div className="container">
        <header className="max-w-3xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-text-muted">{t("eyebrow")}</p>
          <h2 id="college-assurance-title" className="mt-4 font-serif text-4xl font-light text-accent lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{t("intro")}</p>
        </header>

        <div className="mt-10 grid overflow-hidden rounded-lg border border-border bg-bg-card lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r lg:p-8">
            <h3 className="font-sans text-base font-semibold text-text">{t("paymentTitle")}</h3>
            <ol className="relative mt-7 space-y-6 before:absolute before:bottom-5 before:left-4 before:top-5 before:w-px before:bg-border-strong sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:before:left-6 sm:before:right-6 sm:before:top-4 sm:before:h-px sm:before:w-auto">
              {paymentSteps.map((step, index) => (
                <li key={step.value} className="relative flex items-start gap-4 sm:block">
                  <span className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="sm:mt-4">
                    <p className="font-serif text-2xl font-light text-accent">{step.value}</p>
                    <p className="mt-1 text-sm text-text-secondary">{step.label}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-6 lg:p-8">
            <ul className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2">
              {ASSURANCES.map(({ key, icon: Icon }) => {
                const item = t(`items.${key}`);
                return (
                  <li key={key} className="flex min-h-20 items-center gap-3 bg-bg-card p-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-accent/20 bg-accent-light text-accent">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-medium leading-snug text-text">{item}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-5 border-l-4 border-brand-orange bg-[#0a3d8f] p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center lg:p-8">
          <div>
            <h3 className="font-serif text-3xl font-light text-white">{t("ctaTitle")}</h3>
            <p className="mt-2 text-sm text-white/80">{t("ctaText")}</p>
          </div>
          <button
            type="button"
            onClick={onRequestQuote}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
