"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { track } from "@/lib/analytics/track";

type Theme = "light" | "dark";

const STORAGE_KEY = "klassci-theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    const next: Theme = html.classList.contains("dark") ? "light" : "dark";

    html.classList.add("theme-switching");
    html.classList.toggle("dark", next === "dark");
    html.classList.toggle("light", next === "light");
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
    track("theme_toggle", { to: next });

    window.setTimeout(() => {
      html.classList.remove("theme-switching");
    }, 850);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center h-9 w-9 rounded border border-border text-text-secondary hover:text-text hover:border-border-strong transition-colors ${className}`}
      aria-label={t("themeToggleAria")}
      title={t("themeToggleAria")}
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden />
      <Moon className="h-4 w-4 hidden dark:block" aria-hidden />
      <span className="sr-only">
        {theme === "dark" ? t("themeToggleLight") : t("themeToggleDark")}
      </span>
    </button>
  );
}
