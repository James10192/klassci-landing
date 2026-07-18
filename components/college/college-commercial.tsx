"use client";

import { useCallback, useMemo, useState } from "react";

import { CollegeLaunchAssurance } from "@/components/college/college-launch-assurance";
import { CollegePricing } from "@/components/college/college-pricing";
import { CollegeRoiCalculator } from "@/components/college/college-roi-calculator";
import { recommendCollegePlan, type CollegePlanKey } from "@/lib/college-pricing";

interface CollegeCommercialProps {
  onRequestQuote: (plan: CollegePlanKey, studentCount: number) => void;
}

export function CollegeCommercial({ onRequestQuote }: CollegeCommercialProps) {
  const [studentCount, setStudentCount] = useState(600);
  const [paperBudget, setPaperBudget] = useState(900_000);
  const [adminHours, setAdminHours] = useState(20);
  const recommendedPlan = useMemo(() => recommendCollegePlan(studentCount), [studentCount]);

  const requestRecommendedPlan = useCallback(() => {
    onRequestQuote(recommendedPlan, studentCount);
  }, [onRequestQuote, recommendedPlan, studentCount]);

  const requestPlan = useCallback((plan: CollegePlanKey) => {
    onRequestQuote(plan, studentCount);
  }, [onRequestQuote, studentCount]);

  return (
    <>
      <CollegeRoiCalculator
        studentCount={studentCount}
        paperBudget={paperBudget}
        adminHours={adminHours}
        recommendedPlan={recommendedPlan}
        onStudentCountChange={setStudentCount}
        onPaperBudgetChange={setPaperBudget}
        onAdminHoursChange={setAdminHours}
        onRequestQuote={requestRecommendedPlan}
      />
      <CollegePricing onRequestQuote={requestPlan} />
      <CollegeLaunchAssurance onRequestQuote={requestRecommendedPlan} />
    </>
  );
}
