"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { track } from "@/lib/analytics/track";
import { FeatureModal, type FeatureKey } from "./feature-modal";

interface BigFeature {
  key: FeatureKey;
  title: string;
  description: string;
  image: string;
  alt: string;
}

export function FeaturesBig() {
  const t = useTranslations("features");
  const locale = useLocale() as "fr" | "en";
  const items = t.raw("big") as BigFeature[];
  const learnMoreLabel = t("learnMore");

  const [openFeatureKey, setOpenFeatureKey] = useState<FeatureKey | null>(null);

  const handleOpen = useCallback(
    (key: FeatureKey) => {
      setOpenFeatureKey(key);
      track("feature_modal_open", { feature: key, locale });
    },
    [locale],
  );

  const handleClose = useCallback(() => {
    setOpenFeatureKey(null);
  }, []);

  return (
    <section
      id="fonctionnalites"
      className="container py-section"
      aria-labelledby="features-big-title"
    >
      <header className="max-w-klassci-narrow mx-auto text-center mb-16">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
          02 / Fonctionnalités
        </p>
        <h2
          id="features-big-title"
          className="mt-4 font-serif font-light text-section-h2 text-accent"
        >
          {t("title")}
        </h2>
        <p className="mt-4 mx-auto max-w-[40rem] text-text-secondary leading-relaxed">
          {t("intro")}
        </p>
      </header>

      <div className="flex flex-col">
        {items.map((feature, index) => {
          // Alternate layout: even rows = image left, odd rows = image right.
          const imageRight = index % 2 === 1;
          const isFirst = index === 0;

          return (
            <article
              key={feature.key}
              className={`grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-center py-16 lg:py-20 ${
                isFirst ? "" : "border-t border-border"
              }`}
            >
              <div
                className={`relative w-full rounded-lg overflow-hidden border border-border bg-bg-card ${
                  imageRight ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  width={1872}
                  height={924}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>

              <div
                className={`flex flex-col ${
                  imageRight ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </p>
                <h3
                  className="mt-4 font-serif font-light text-2xl leading-[1.3] text-text"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {feature.title}
                </h3>
                <p className="mt-4 text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpen(feature.key)}
                  className="mt-6 self-start inline-flex items-center gap-1.5 text-accent hover:text-accent-hover font-medium text-[0.875rem] transition-colors group"
                  aria-haspopup="dialog"
                >
                  <span>{learnMoreLabel}</span>
                  <span
                    aria-hidden
                    className="transition-transform duration-200 ease-klassci group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <FeatureModal openKey={openFeatureKey} onClose={handleClose} />
    </section>
  );
}
