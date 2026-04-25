"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { track } from "@/lib/analytics/track";

type Theme = "light" | "dark" | "system";
const ORDER: readonly Theme[] = ["system", "light", "dark"] as const;

// Theme cycle button. Reuses the next-themes context exposed by Fumadocs
// RootProvider so the docs sidebar toggle and this nav toggle stay in sync.
// Cycles system → light → dark → system.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycle = useCallback(() => {
    const current = (theme as Theme) ?? "system";
    const idx = ORDER.indexOf(current);
    const next = ORDER[(idx + 1) % ORDER.length] as Theme;
    setTheme(next);
    if (next !== "system") {
      track("theme_toggle", { to: next });
    }
  }, [theme, setTheme]);

  const current = (mounted ? theme : "system") as Theme;
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Monitor;
  const label =
    current === "dark"
      ? t("themeToggleLight")
      : current === "light"
        ? t("themeToggleDark")
        : t("themeToggleAria");

  return (
    <button
      type="button"
      onClick={cycle}
      className={`inline-flex items-center justify-center h-9 w-9 rounded border border-border text-text-secondary hover:text-text hover:border-border-strong transition-colors ${className}`}
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
