"use client";

import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";

import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "@/i18n/navigation";

/**
 * La barre de navigation du site, une seule fois.
 *
 * Elle existait en quatre exemplaires — l'accueil, l'université, le collège, la
 * classe virtuelle — et ils avaient divergé : 64 pixels de haut ici et 57 là,
 * un menu en plein écran d'un côté et rien de l'autre, les réglages de langue
 * et de thème présents sur trois pages sur quatre. Rien de tout cela n'était un
 * choix ; c'est ce qui arrive quand on recopie une barre pour la page suivante.
 * Passer d'une porte à l'autre donnait l'impression de changer de site.
 *
 * Ce composant tient la COQUILLE — hauteur, fond translucide, bordure, logo,
 * réglages, menu mobile — et laisse chaque page décider de ses LIENS. C'est la
 * bonne frontière : l'université a besoin de ses ancres (« Tarifs », « FAQ »)
 * sur une page de dix-sept sections, et les imposer à l'accueil produirait des
 * liens qui ne mènent nulle part.
 *
 * Le bouton d'action est rendu par la page, parce qu'il ne fait pas la même
 * chose partout : il ancre vers un formulaire sur l'université, il ouvre une
 * fenêtre de contact sur l'accueil, une demande de devis sur le collège. Il
 * reçoit de quoi fermer le menu mobile — sans quoi une fenêtre s'ouvrirait
 * derrière le menu resté déployé.
 */

export type LienNav = {
  cle: string;
  libelle: string;
  /** Chemin sans locale (« /universite ») si `interne`, sinon URL ou ancre. */
  href: string;
  interne?: boolean;
  icone?: ComponentType<{ className?: string }>;
  /** Met le lien en avant, pour l'entrée des familles. */
  enAvant?: boolean;
  onClick?: () => void;
};

/**
 * Le bouton d'action, rendu par la page.
 *
 * `contexte` compte : dans la barre c'est un bouton compact, dans le menu
 * mobile c'est une ligne en serif comme les autres entrées. Le rendre une seule
 * fois avec des classes conditionnelles le faisait disparaître du menu sur les
 * petits écrans — là où il est pourtant la seule façon d'y accéder.
 */
type RenduAction = (options: {
  fermerMenu: () => void;
  contexte: "barre" | "menu";
}) => ReactNode;

const CLASSE_LIEN =
  "px-3 py-2 text-[0.875rem] font-medium transition-colors";

export function SiteNav({
  logo,
  liens,
  action,
  libelles,
}: {
  logo: ReactNode;
  liens: LienNav[];
  action?: RenduAction;
  libelles: { ouvrirMenu: string; fermerMenu: string };
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOuvert ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOuvert]);

  const fermerMenu = useCallback(() => setMenuOuvert(false), []);

  function contenuLien(lien: LienNav, taille: "barre" | "menu") {
    const Icone = lien.icone;

    return (
      <>
        {Icone ? (
          <Icone className={taille === "barre" ? "h-4 w-4" : "h-6 w-6"} aria-hidden />
        ) : null}
        {lien.libelle}
      </>
    );
  }

  function rendreLien(lien: LienNav, taille: "barre" | "menu") {
    const classe =
      taille === "barre"
        ? `${CLASSE_LIEN} inline-flex items-center gap-1.5 ${
            lien.enAvant ? "text-accent hover:text-accent-hover" : "text-text-secondary hover:text-text"
          }`
        : `inline-flex items-center gap-3 font-serif text-[1.75rem] font-light transition-colors ${
            lien.enAvant ? "text-accent hover:text-accent-hover" : "text-text hover:text-accent"
          }`;

    const auClic = () => {
      lien.onClick?.();
      if (taille === "menu") fermerMenu();
    };

    if (lien.interne) {
      return (
        <Link key={lien.cle} href={lien.href} onClick={auClic} className={classe}>
          {contenuLien(lien, taille)}
        </Link>
      );
    }

    return (
      <a key={lien.cle} href={lien.href} onClick={auClic} className={classe}>
        {contenuLien(lien, taille)}
      </a>
    );
  }

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-[100] flex h-[57px] items-center border-b border-border bg-[var(--nav-bg)] backdrop-blur-md backdrop-saturate-150 transition-colors"
        aria-label="Principale"
      >
        <div className="container flex items-center justify-between gap-6">
          {logo}

          <div className="hidden items-center gap-1 md:flex">
            {liens.map((lien) => rendreLien(lien, "barre"))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle className="hidden sm:inline-flex" />
            {action?.({ fermerMenu, contexte: "barre" })}

            {/* h-11 w-11 : 44 pixels, la cible tactile recommandée. */}
            <button
              type="button"
              onClick={() => setMenuOuvert((ouvert) => !ouvert)}
              className="inline-flex h-11 w-11 items-center justify-center rounded border border-border text-text md:hidden"
              aria-label={menuOuvert ? libelles.fermerMenu : libelles.ouvrirMenu}
              aria-expanded={menuOuvert}
            >
              {menuOuvert ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </nav>

      {menuOuvert && (
        <div
          className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-7 bg-bg px-6 pt-20 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {liens.map((lien) => rendreLien(lien, "menu"))}
          {action?.({ fermerMenu, contexte: "menu" })}

          <div className="mt-4 flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}
