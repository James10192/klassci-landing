"use client";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Clock3 from "lucide-react/dist/esm/icons/clock-3";
import FileText from "lucide-react/dist/esm/icons/file-text";
import School from "lucide-react/dist/esm/icons/school";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
  formatFcfa,
  getAnnualAdminHours,
  getCollegeLaunchPrice,
  getPaperBudgetShare,
  type CollegePlanKey,
} from "@/lib/college-pricing";

interface CollegeRoiCalculatorProps {
  studentCount: number;
  paperBudget: number;
  adminHours: number;
  recommendedPlan: CollegePlanKey;
  onStudentCountChange: (value: number) => void;
  onPaperBudgetChange: (value: number) => void;
  onAdminHoursChange: (value: number) => void;
  onRequestQuote: () => void;
}

const inputClass =
  "min-h-11 w-full rounded border border-border bg-bg-card px-3.5 py-2.5 text-base tabular-nums text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-light";

export function CollegeRoiCalculator({
  studentCount,
  paperBudget,
  adminHours,
  recommendedPlan,
  onStudentCountChange,
  onPaperBudgetChange,
  onAdminHoursChange,
  onRequestQuote,
}: CollegeRoiCalculatorProps) {
  const t = useTranslations("college.sales.calculator");
  const locale = useLocale() as "fr" | "en";
  const reduceMotion = useReducedMotion();
  const paperShare = getPaperBudgetShare(paperBudget, recommendedPlan);
  const annualHours = getAnnualAdminHours(adminHours);
  const launchPrice =
    recommendedPlan === "partenaire"
      ? null
      : getCollegeLaunchPrice(recommendedPlan);

  return (
    <section
      id="rentabilite"
      className="scroll-mt-24 border-y border-border bg-bg-alt/55 py-16 lg:py-20"
      aria-labelledby="college-roi-title"
    >
      <div className="container">
        <header className="max-w-3xl">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">
            {t("eyebrow")}
          </p>
          <h2 id="college-roi-title" className="mt-4 font-serif text-4xl font-light text-accent lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{t("intro")}</p>
        </header>

        <div className="mt-10 grid overflow-hidden rounded-lg border border-border bg-bg-card lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:p-8">
            <NumberField
              icon={<School className="h-4 w-4" aria-hidden />}
              label={t("students")}
              value={studentCount}
              min={50}
              max={5_000}
              step={25}
              suffix={locale === "fr" ? "élèves" : "students"}
              onChange={onStudentCountChange}
            />
            <NumberField
              icon={<FileText className="h-4 w-4" aria-hidden />}
              label={t("paperBudget")}
              value={paperBudget}
              min={0}
              max={100_000_000}
              step={50_000}
              suffix="FCFA"
              onChange={onPaperBudgetChange}
            />
            <div className="sm:col-span-2">
              <NumberField
                icon={<Clock3 className="h-4 w-4" aria-hidden />}
                label={t("adminHours")}
                value={adminHours}
                min={0}
                max={500}
                step={1}
                suffix={locale === "fr" ? "heures" : "hours"}
                onChange={onAdminHoursChange}
              />
            </div>
          </div>

          <motion.div
            key={recommendedPlan}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border bg-[#0a3d8f] p-6 text-white lg:border-l lg:border-t-0 lg:p-8"
            aria-live="polite"
          >
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white/70">
              {t("recommended")}
            </p>
            <h3 className="mt-3 font-serif text-4xl font-light text-white">
              {t(`plans.${recommendedPlan}`)}
            </h3>
            {launchPrice !== null ? (
              <p className="mt-3 text-sm text-white/75">
                {locale === "fr" ? "Tarif de lancement" : "Launch price"}{" "}
                <strong className="font-semibold text-white">
                  {formatFcfa(launchPrice, locale)} FCFA
                </strong>
              </p>
            ) : (
              <p className="mt-3 text-sm text-white/75">{t("partnerNote")}</p>
            )}

            <div className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm text-white/90">
              {paperShare !== null && (
                <p className="text-white/90">
                  {t("paperShare", { percentage: paperShare })}
                </p>
              )}
              <p className="text-white/90">
                {t("annualHours", { hours: formatFcfa(annualHours, locale) })}
              </p>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/70">{t("disclaimer")}</p>
            <button
              type="button"
              onClick={onRequestQuote}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover sm:w-auto"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function NumberField({
  icon,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      <span className="relative block">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            onChange(Number.isFinite(nextValue) ? Math.min(max, Math.max(min, nextValue)) : min);
          }}
          className={`${inputClass} pr-24`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-text-muted">
          {suffix}
        </span>
      </span>
    </label>
  );
}
