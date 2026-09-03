"use client";

import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

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
 * Un groupe de liens, replié derrière un libellé.
 *
 * Il n'existe que parce qu'une barre a une largeur. Les quatre pages
 * institutionnelles — à propos, sécurité, mentions légales, confidentialité —
 * doivent être atteignables depuis n'importe où : ce sont celles qu'on cherche
 * quand on hésite à confier l'état civil de ses élèves à un prestataire. Les
 * poser à plat ajouterait quatre entrées à une barre qui en porte déjà six, et
 * les libellés longs la feraient passer sur deux lignes.
 *
 * Le groupe se comporte différemment selon l'endroit, et c'est délibéré :
 *
 * - **Dans la barre**, un bouton ouvre un panneau. Au clic, pas au survol : un
 *   menu qui s'ouvre au survol est inatteignable au doigt, et pénible pour qui
 *   vise mal.
 * - **Dans le menu hamburger**, il se déplie à plat sous son libellé. Un
 *   sous-menu imbriqué dans un menu déjà en plein écran demande deux gestes
 *   pour atteindre un lien, et referme tout si l'on rate la cible.
 */
export type GroupeNav = {
  cle: string;
  libelle: string;
  liens: LienNav[];
  /** Discriminant : c'est lui qui distingue un groupe d'un lien. */
  groupe: true;
};

export type EntreeNav = LienNav | GroupeNav;

function estGroupe(entree: EntreeNav): entree is GroupeNav {
  return "groupe" in entree && entree.groupe === true;
}

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

/**
 * Où un lien est rendu. Trois endroits, trois habillages.
 *
 * `panneau` est le plus discret des trois et le plus facile à oublier : sans
 * lui, un lien de groupe héritait de la taille de la barre et se retrouvait
 * serré au bord du panneau, sans zone cliquable de part et d'autre du texte.
 */
type Taille = "barre" | "menu" | "menuGroupe" | "panneau";

const CLASSES_PAR_TAILLE: Record<Taille, (lien: LienNav) => string> = {
  barre: (lien) =>
    `${CLASSE_LIEN} inline-flex items-center gap-1.5 ${
      lien.enAvant
        ? "text-accent hover:text-accent-hover"
        : "text-text-secondary hover:text-text"
    }`,
  menu: (lien) =>
    `inline-flex items-center gap-3 font-serif text-[1.75rem] font-light transition-colors ${
      lien.enAvant
        ? "text-accent hover:text-accent-hover"
        : "text-text hover:text-accent"
    }`,
  // Plus petit que les entrées de premier rang, pour que la hiérarchie se
  // voie sans qu'on ait à la lire. Reste au-dessus de la cible tactile de 44
  // pixels grâce au `py-1`.
  menuGroupe: (lien) =>
    `inline-flex items-center gap-2.5 py-1 font-serif text-[1.15rem] font-light transition-colors ${
      lien.enAvant
        ? "text-accent hover:text-accent-hover"
        : "text-text-secondary hover:text-accent"
    }`,
  // La ligne occupe toute la largeur du panneau : on vise une ligne, pas un
  // mot, et c'est ce qui rend un menu confortable au doigt comme à la souris.
  panneau: (lien) =>
    `flex w-full items-center gap-2.5 px-4 py-2.5 text-[0.875rem] transition-colors hover:bg-bg ${
      lien.enAvant
        ? "text-accent hover:text-accent-hover"
        : "text-text-secondary hover:text-text"
    }`,
};

/**
 * Le groupe replié, dans la barre.
 *
 * Trois comportements que l'on remarque seulement quand ils manquent :
 * `Escape` referme et rend le focus au bouton, un clic ailleurs referme, et le
 * panneau se ferme dès qu'on suit l'un de ses liens. Sans le dernier, on
 * revient sur la page suivante avec un panneau ouvert sur rien.
 */
function GroupeDeroulant({
  groupe,
  rendreLien,
}: {
  groupe: GroupeNav;
  rendreLien: (lien: LienNav, taille: Taille) => ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const idPanneau = useId();

  useEffect(() => {
    if (!ouvert) return;

    function auClicExterieur(evenement: MouseEvent) {
      if (!conteneur.current?.contains(evenement.target as Node)) setOuvert(false);
    }

    function auClavier(evenement: KeyboardEvent) {
      if (evenement.key !== "Escape") return;
      setOuvert(false);
      // Rendre le focus : sans cela, `Escape` laisse le curseur au début du
      // document et la navigation au clavier repart de zéro.
      bouton.current?.focus();
    }

    document.addEventListener("mousedown", auClicExterieur);
    document.addEventListener("keydown", auClavier);

    return () => {
      document.removeEventListener("mousedown", auClicExterieur);
      document.removeEventListener("keydown", auClavier);
    };
  }, [ouvert]);

  return (
    <div ref={conteneur} className="relative">
      <button
        ref={bouton}
        type="button"
        data-menu-groupe={groupe.cle}
        onClick={() => setOuvert((etat) => !etat)}
        aria-expanded={ouvert}
        aria-haspopup="true"
        aria-controls={idPanneau}
        className={`${CLASSE_LIEN} inline-flex items-center gap-1 ${
          ouvert ? "text-text" : "text-text-secondary hover:text-text"
        }`}
      >
        {groupe.libelle}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {ouvert && (
        <div
          id={idPanneau}
          className="absolute right-0 top-full z-[101] mt-2 min-w-[15rem] rounded-lg border border-border bg-bg-card py-2 shadow-lg"
        >
          {groupe.liens.map((lien) => (
            <div key={lien.cle} onClick={() => setOuvert(false)}>
              {rendreLien(lien, "panneau")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteNav({
  logo,
  liens,
  action,
  libelles,
  seuilLiens = "lg",
}: {
  logo: ReactNode;
  liens: EntreeNav[];
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

  function contenuLien(lien: LienNav, taille: Taille) {
    const Icone = lien.icone;
    // Dans un panneau comme dans le menu, une icône ne coûte pas de largeur :
    // c'est seulement dans la barre horizontale qu'elle en prend.
    const avecIcone = Icone && (taille !== "barre" || lien.iconeDansLaBarre);

    return (
      <>
        {avecIcone ? (
          <Icone
            className={
              taille === "menu"
                ? "h-6 w-6"
                : taille === "menuGroupe"
                  ? "h-5 w-5"
                  : "h-4 w-4"
            }
            aria-hidden
          />
        ) : null}
        {lien.libelle}
      </>
    );
  }

  function rendreLien(lien: LienNav, taille: Taille) {
    const classe = CLASSES_PAR_TAILLE[taille](lien);

    const auClic = () => {
      lien.onClick?.();
      // `menuGroupe` aussi : c'est le même menu plein écran, et l'oublier
      // laisserait le menu ouvert par-dessus la page qu'on vient d'ouvrir.
      if (taille === "menu" || taille === "menuGroupe") fermerMenu();
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
            {liens.map((entree) =>
              estGroupe(entree) ? (
                <GroupeDeroulant
                  key={entree.cle}
                  groupe={entree}
                  rendreLien={rendreLien}
                />
              ) : (
                rendreLien(entree, "barre")
              ),
            )}
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
          {liens.map((entree) =>
            estGroupe(entree) ? (
              // À plat, sous un intitulé. Un sous-menu imbriqué dans un menu
              // déjà en plein écran demanderait deux gestes pour atteindre un
              // lien, et refermerait tout si l'on rate la cible.
              <div key={entree.cle} className="flex flex-col items-center gap-4">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-text-muted">
                  {entree.libelle}
                </span>
                {entree.liens.map((lien) => rendreLien(lien, "menuGroupe"))}
              </div>
            ) : (
              rendreLien(entree, "menu")
            ),
          )}
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
