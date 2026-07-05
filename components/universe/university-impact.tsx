"use client";

import { useTranslations } from "next-intl";

import { SdgImpactGrid } from "@/components/universe/sdg-impact-grid";

interface SdgItem {
  number: string;
  name: string;
  text: string;
}

export function UniversityImpact() {
  const t = useTranslations("universityImpact");
  const sdgs = t.raw("sdg.items") as SdgItem[];

  return (
    <section id="impact" className="container scroll-mt-24 py-20" aria-labelledby="university-sdg-title">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm text-text-muted">{t("sdg.eyebrow")}</p>
        <h2 id="university-sdg-title" className="mt-4 font-serif text-4xl font-light text-accent lg:text-5xl">
          {t("sdg.title")}
        </h2>
        <p className="mt-5 leading-relaxed text-text-secondary">{t("sdg.intro")}</p>
      </header>
      <SdgImpactGrid items={sdgs} variant="university" />
    </section>
  );
}
