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
  /**
   * Montre l'icone jusque dans la barre.
   *
   * Fausse par defaut : une icone ne coute rien dans un menu vertical, mais
   * elle coute de la largeur dans une barre horizontale. L'accueil porte six
   * liens dont trois aux libelles longs (« Universite & Grandes ecoles ») —
   * avec leurs icones, la barre passait sur deux lignes.
   */
  iconeDansLaBarre?: boolean;
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
/**
 * A partir de quelle largeur les liens s'affichent cote a cote.
 *
 * L'accueil porte six entrees dont trois aux libelles longs, plus les reglages
 * et un bouton : a 1024 pixels le bouton sortait de l'ecran. Les pages
 * produit, avec des libelles courts, tiennent des 1024. Les classes sont
 * ecrites en toutes lettres — Tailwind ne compile que ce qu'il lit.
 */
const SEUILS = {
  lg: {
    liens: "hidden items-center gap-1 lg:flex",
    bascule:
      "inline-flex h-11 w-11 items-center justify-center rounded border border-border text-text lg:hidden",
    menu: "fixed inset-0 z-[99] flex flex-col items-center justify-center gap-7 overflow-y-auto bg-bg px-6 py-24 lg:hidden",
  },
  xl: {
    liens: "hidden items-center gap-1 xl:flex",
    bascule:
      "inline-flex h-11 w-11 items-center justify-center rounded border border-border text-text xl:hidden",
    menu: "fixed inset-0 z-[99] flex flex-col items-center justify-center gap-7 overflow-y-auto bg-bg px-6 py-24 xl:hidden",
  },
} as const;

type RenduAction = (options: {
  fermerMenu: () => void;
  contexte: "barre" | "menu";
}) => ReactNode;

/**
 * `whitespace-nowrap` : un libelle comme « Universite & Grandes ecoles » se
 * coupait en deux lignes des que la barre se serrait, et la barre fait 57
 * pixels de haut.
 */
const CLASSE_LIEN =
  "whitespace-nowrap px-3 py-2 text-[0.875rem] font-medium transition-colors";

export function SiteNav({
  logo,
  liens,
  action,
  libelles,
  seuilLiens = "lg",
}: {
  logo: ReactNode;
  liens: LienNav[];
  action?: RenduAction;
  libelles: { ouvrirMenu: string; fermerMenu: string };
  seuilLiens?: keyof typeof SEUILS;
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const seuil = SEUILS[seuilLiens];

  useEffect(() => {
    document.body.style.overflow = menuOuvert ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOuvert]);

  const fermerMenu = useCallback(() => setMenuOuvert(false), []);

  function contenuLien(lien: LienNav, taille: "barre" | "menu") {
    const Icone = lien.icone;
    const avecIcone = Icone && (taille === "menu" || lien.iconeDansLaBarre);

    return (
      <>
        {avecIcone ? (
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
          {/* shrink-0 : sans lui, le logo est la premiere victime quand la
              rangee de liens se serre, et il se retrouve rogne. */}
          <span className="shrink-0">{logo}</span>

          <div className={seuil.liens}>
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
              className={seuil.bascule}
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
          className={seuil.menu}
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
