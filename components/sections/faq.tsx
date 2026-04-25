"use client";

import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, type SyntheticEvent } from "react";

import { track } from "@/lib/analytics/track";

interface FaqItem {
  q: string;
  a: string;
}

export function Faq() {
  const t = useTranslations("faq");
  const locale = useLocale() as "fr" | "en";

  const items = t.raw("items") as FaqItem[];

  // Native <details> fires onToggle on both open AND close — only emit on open
  // so analytics counts intent (a user revealed an answer), not collapse noise.
  const onToggle = useCallback(
    (index: number) => (e: SyntheticEvent<HTMLDetailsElement>) => {
      if (e.currentTarget.open) {
        track("faq_open", { index, locale });
      }
    },
    [locale],
  );

  return (
    <section
      id="faq"
      className="py-section container"
      aria-labelledby="faq-heading"
    >
      <div className="text-center mb-12">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
          FAQ
        </p>
        <h2
          id="faq-heading"
          className="font-serif font-light text-section-h2"
        >
          {t("title")}
        </h2>
      </div>

      <div className="max-w-[700px] mx-auto">
        {items.map((item, index) => (
          <details
            key={index}
            onToggle={onToggle(index)}
            className="border-b border-border last:border-b-0 group"
          >
            <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-sans font-medium text-[0.95rem]">
              <span>{item.q}</span>
              <ChevronDown
                aria-hidden
                size={16}
                className="shrink-0 text-text-muted transition-transform duration-200 ease-klassci group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="pb-5 text-text-secondary text-[0.875rem] leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
