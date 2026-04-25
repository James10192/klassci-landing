"use client";

import { BookOpen, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { track } from "@/lib/analytics/track";

const ANCHOR_LINKS = [
  { key: "features", href: "#fonctionnalites" },
  { key: "pricing", href: "#tarifs" },
  { key: "faq", href: "#faq" },
  { key: "contact", href: "#contact" },
] as const;

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale() as "fr" | "en";
  const [mobileOpen, setMobileOpen] = useState(false);

  // localePrefix is 'as-needed' — FR (default) is unprefixed, EN gets /en/...
  const docsHref = locale === "fr" ? "/docs" : `/${locale}/docs`;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleContactClick = useCallback(() => {
    track("cta_click", { location: "nav", locale });
  }, [locale]);

  const handleDocsClick = useCallback(() => {
    track("cta_click", { location: "nav_docs", locale });
  }, [locale]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-[57px] flex items-center bg-[var(--nav-bg)] border-b border-border backdrop-blur-md backdrop-saturate-150 transition-colors"
        aria-label="Primary"
      >
        <div className="container flex items-center justify-between gap-6">
          <Logo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {ANCHOR_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="px-3 py-2 text-[0.875rem] font-medium text-text-secondary hover:text-text transition-colors"
              >
                {t(link.key)}
              </a>
            ))}
            <a
              href={docsHref}
              onClick={handleDocsClick}
              aria-label={t("docsAria")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[0.875rem] font-medium text-text-secondary hover:text-text transition-colors"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              {t("docs")}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle className="hidden sm:inline-flex" />
            {/* Pas de "Se connecter" central : chaque tenant a son propre
                sous-domaine (esbtp-yakro.klassci.com etc.) avec son login Laravel.
                Le CTA principal du marketing site est "Prendre contact". */}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-[0.875rem] font-medium border border-accent bg-accent text-white rounded hover:bg-accent-hover transition-all"
            >
              {t("contact")}
            </a>

            {/* Mobile hamburger — h-10 w-10 = 40px, closer to the 44px iOS guideline */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded border border-border text-text"
              aria-label={mobileOpen ? t("menuClose") : t("menuOpen")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[99] bg-bg flex flex-col items-center justify-center gap-7 pt-16"
          role="dialog"
          aria-modal="true"
        >
          {ANCHOR_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={closeMobile}
              className="font-serif font-light text-[1.75rem] text-text hover:text-accent transition-colors"
            >
              {t(link.key)}
            </a>
          ))}
          <a
            href={docsHref}
            onClick={() => {
              handleDocsClick();
              closeMobile();
            }}
            className="inline-flex items-center gap-3 font-serif font-light text-[1.75rem] text-text hover:text-accent transition-colors"
          >
            <BookOpen className="h-6 w-6" aria-hidden />
            {t("docs")}
          </a>
          <a
            href="#contact"
            onClick={() => {
              handleContactClick();
              closeMobile();
            }}
            className="font-serif font-light text-[1.75rem] text-accent"
          >
            {t("contactCta")}
          </a>
          <div className="flex items-center gap-4 mt-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}
