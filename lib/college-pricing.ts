export type CollegePlanKey = "essentielle" | "pro" | "elite" | "partenaire";
export type PaidCollegePlanKey = Exclude<CollegePlanKey, "partenaire">;

export const COLLEGE_PLAN_PRICES: Record<PaidCollegePlanKey, number> = {
  essentielle: 750_000,
  pro: 1_500_000,
  elite: 3_000_000,
};

export const COLLEGE_PLAN_CAPACITY: Record<
  PaidCollegePlanKey,
  { min: number; max: number }
> = {
  essentielle: { min: 1, max: 300 },
  pro: { min: 301, max: 700 },
  elite: { min: 701, max: 1_500 },
};

export const COLLEGE_LAUNCH_DISCOUNT = 0.3;
export const SCHOOL_WEEKS_PER_YEAR = 36;

export function recommendCollegePlan(studentCount: number): CollegePlanKey {
  if (studentCount <= COLLEGE_PLAN_CAPACITY.essentielle.max) return "essentielle";
  if (studentCount <= COLLEGE_PLAN_CAPACITY.pro.max) return "pro";
  if (studentCount <= COLLEGE_PLAN_CAPACITY.elite.max) return "elite";
  return "partenaire";
}

export function formatCollegePlanCapacity(
  plan: PaidCollegePlanKey,
  locale: "fr" | "en",
): string {
  const range = COLLEGE_PLAN_CAPACITY[plan];
  const number = (value: number) => formatFcfa(value, locale);

  if (range.min === 1) {
    return locale === "fr"
      ? `Jusqu'à ${number(range.max)} élèves`
      : `Up to ${number(range.max)} students`;
  }

  return locale === "fr"
    ? `${number(range.min)} à ${number(range.max)} élèves`
    : `${number(range.min)} to ${number(range.max)} students`;
}

export function getCollegeLaunchPrice(plan: PaidCollegePlanKey): number {
  return COLLEGE_PLAN_PRICES[plan] * (1 - COLLEGE_LAUNCH_DISCOUNT);
}

export function getPaperBudgetShare(
  annualPaperBudget: number,
  plan: CollegePlanKey,
): number | null {
  if (plan === "partenaire") return null;
  const launchPrice = getCollegeLaunchPrice(plan);
  return Math.max(0, Math.round((annualPaperBudget / launchPrice) * 100));
}

export function getAnnualAdminHours(weeklyHours: number): number {
  return Math.max(0, Math.round(weeklyHours * SCHOOL_WEEKS_PER_YEAR));
}

export function formatFcfa(value: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactFcfa(value: number, locale: "fr" | "en"): string {
  const divisor = value >= 1_000_000 ? 1_000_000 : 1_000;
  const suffix = value >= 1_000_000 ? "M" : "k";
  const formatted = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value / divisor);
  return `${formatted} ${suffix}`;
}
