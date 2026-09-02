"use client";

import BookOpen from "lucide-react/dist/esm/icons/book-open";
import { useTranslations } from "next-intl";

import { SiteNav } from "@/components/sections/site-nav";
import { Logo } from "@/components/ui/logo";

/**
 * La barre de navigation des pages du blog.
 *
 * Un lecteur arrive sur un article par une recherche — « comment calculer la
 * moyenne annuelle », « agrement etablissement prive » — et non par la page
 * d'accueil. Sans barre, il lit, il repart, et il n'a jamais su quel produit
 * publiait ce texte. Le pied de page et l'appel a l'action de fin d'article ne
 * suffisent pas : ils sont sous quatre mille mots.
 *
 * La coquille est celle du reste du site (`SiteNav`) ; seuls les liens
 * changent. C'est exactement la frontiere que ce composant a ete fait pour
 * tenir.
 */
export function ChromeBlog({ locale }: { locale: string }) {
  const nav = useTranslations("nav");
  const accueil = useTranslations("welcome");

  return (
    <SiteNav
      logo={<Logo />}
      libelles={{ ouvrirMenu: nav("menuOpen"), fermerMenu: nav("menuClose") }}
      liens={[
        { cle: "accueil", libelle: nav("home"), href: `/${locale}` },
        {
          cle: "universite",
          libelle: accueil("doors.universite.name"),
          href: "/universite",
          interne: true,
        },
        {
          cle: "college",
          libelle: accueil("doors.college.name"),
          href: "/college",
          interne: true,
        },
        {
          cle: "docs",
          libelle: nav("docs"),
          href: `/${locale}/docs`,
          icone: BookOpen,
        },
      ]}
      action={({ fermerMenu, contexte }) => (
        <a
          href={`/${locale}/universite#contact`}
          onClick={fermerMenu}
          className={
            contexte === "barre"
              ? "hidden min-h-11 items-center rounded border border-accent bg-accent px-3.5 text-[0.875rem] font-medium text-white transition-colors hover:bg-accent-hover sm:inline-flex"
              : "min-h-11 font-serif text-[1.75rem] font-light text-accent"
          }
        >
          {nav("contactCta")}
        </a>
      )}
    />
  );
}
