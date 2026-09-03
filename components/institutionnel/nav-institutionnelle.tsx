"use client";

import BookOpen from "lucide-react/dist/esm/icons/book-open";
import { useTranslations } from "next-intl";

import { SiteNav } from "@/components/sections/site-nav";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";
import { groupeEntreprise } from "@/lib/navigation";

/**
 * La barre de navigation des quatre pages institutionnelles.
 *
 * Elle n'existait pas. On arrivait sur `/fr/securite` — souvent depuis une
 * recherche, ou depuis un lien envoyé par une direction à son prestataire
 * informatique — et il n'y avait ni logo, ni menu, ni rien : le seul chemin de
 * retour était un fil d'Ariane en petites capitales, ou le pied de page à mille
 * pixels plus bas. Une page qui existe pour rassurer ne peut pas donner
 * l'impression qu'on est tombé hors du site.
 *
 * Les liens sont ceux qu'on cherche depuis une page institutionnelle : revenir
 * à l'accueil, aller voir le produit, et passer d'une page de cette famille à
 * l'autre. Pas les ancres d'une page produit, qui ne mèneraient nulle part
 * ici.
 *
 * Aucun bouton d'action : ces pages ne vendent rien. Y poser « Prendre
 * contact » ferait d'une page de mentions légales une page d'acquisition, ce
 * qu'elle n'est pas.
 */
export function NavInstitutionnelle({ locale }: { locale: string }) {
  const nav = useTranslations("nav");
  const t = useTranslations("welcome");

  return (
    <SiteNav
      logo={<Logo className="[&_img]:h-9" />}
      libelles={{ ouvrirMenu: nav("menuOpen"), fermerMenu: nav("menuClose") }}
      liens={[
        { cle: "accueil", libelle: nav("home"), href: `/${locale}`, interne: false },
        {
          cle: "universite",
          libelle: t("doors.universite.name"),
          href: "/universite",
          interne: true,
        },
        {
          cle: "college",
          libelle: t("doors.college.name"),
          href: "/college",
          interne: true,
        },
        {
          cle: "docs",
          libelle: nav("docs"),
          href: `/${locale}/docs`,
          icone: BookOpen,
          iconeDansLaBarre: true,
        },
        groupeEntreprise(locale, nav("entreprise")),
      ]}
    />
  );
}
