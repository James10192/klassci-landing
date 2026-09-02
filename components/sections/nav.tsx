"use client";

import BookOpen from "lucide-react/dist/esm/icons/book-open";
import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { SiteNav, type LienNav } from "@/components/sections/site-nav";
import { Logo } from "@/components/ui/logo";
import type { CtaLocation } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/**
 * La barre de l'édition Université.
 *
 * Elle ne décrit plus que ses liens : la coquille — hauteur, fond, réglages,
 * menu mobile — est celle de tout le site (`SiteNav`).
 *
 * Les ancres restent ici et n'ont pas été remplacées par les liens vers les
 * autres univers : cette page compte dix-sept sections, et « Tarifs » ou
 * « FAQ » y sont la seule façon d'atteindre le bas sans faire défiler une
 * minute. Le passage d'un univers à l'autre se fait par « Accueil », qui est
 * précisément la page faite pour ça.
 */
export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale() as "fr" | "en";

  const suivre = useCallback(
    (endroit: CtaLocation) => () => track("cta_click", { location: endroit, locale }),
    [locale],
  );

  const liens: LienNav[] = [
    { cle: "home", libelle: t("home"), href: `/${locale}` },
    { cle: "features", libelle: t("features"), href: "#fonctionnalites" },
    { cle: "pricing", libelle: t("pricing"), href: "#tarifs" },
    { cle: "faq", libelle: t("faq"), href: "#faq" },
    {
      cle: "docs",
      libelle: t("docs"),
      href: `/${locale}/docs`,
      icone: BookOpen,
      iconeDansLaBarre: true,
      onClick: suivre("nav_docs"),
    },
    {
      cle: "inscription",
      libelle: t("inscription"),
      href: `/${locale}/inscription`,
      enAvant: true,
      onClick: suivre("nav_inscription"),
    },
  ];

  return (
    <SiteNav
      logo={<Logo />}
      liens={liens}
      libelles={{ ouvrirMenu: t("menuOpen"), fermerMenu: t("menuClose") }}
      action={({ fermerMenu, contexte }) => (
        <a
          href="#contact"
          onClick={() => {
            fermerMenu();
            track("cta_click", { location: "nav", locale });
          }}
          className={
            contexte === "barre"
              ? "hidden min-h-11 items-center gap-2 rounded border border-accent bg-accent px-3.5 text-[0.875rem] font-medium text-white transition-all hover:bg-accent-hover sm:inline-flex"
              : "min-h-11 font-serif text-[1.75rem] font-light text-accent"
          }
        >
          {t("contact")}
        </a>
      )}
    />
  );
}
