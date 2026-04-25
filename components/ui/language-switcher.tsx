"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { track } from "@/lib/analytics/track";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as (typeof routing.locales)[number];
  const [isPending, startTransition] = useTransition();

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    track("language_switch", { from: locale as "fr" | "en", to: next });
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={`inline-flex items-center text-[0.72rem] font-mono uppercase tracking-[0.08em] text-text-muted ${className}`}
      aria-label={t("languageSwitcherAria")}
    >
      {routing.locales.map((loc, idx) => (
        <span key={loc} className="inline-flex items-center">
          {idx > 0 && <span className="px-1.5 text-border-strong">/</span>}
          <button
            type="button"
            onClick={() => switchTo(loc)}
            disabled={isPending}
            className={`transition-colors ${
              loc === locale
                ? "text-text font-semibold"
                : "hover:text-text"
            }`}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
