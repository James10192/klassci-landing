import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * La barre du portail de réinscription.
 *
 * Physiquement identique à celle du reste du site — hauteur, fond translucide,
 * bordure, conteneur — pour que la page ne ressemble pas à un autre site. Mais
 * volontairement sans les liens de navigation : ceux du site sont des ancres
 * de la page d'accueil (#tarifs, #faq…) qui ne mèneraient nulle part ici, et
 * surtout, on ne propose pas à quelqu'un d'aller voir les tarifs au milieu du
 * formulaire qu'il est venu remplir.
 *
 * Restent le logo — qui porte déjà son propre lien vers l'accueil — et les
 * deux réglages de confort.
 */
export function ReinscriptionChrome() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-[57px] border-b border-border bg-[var(--nav-bg)] backdrop-blur-md backdrop-saturate-150">
      <div className="container flex h-full items-center justify-between gap-6">
        <Logo />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
