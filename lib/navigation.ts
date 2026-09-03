import type { GroupeNav } from "@/components/sections/site-nav";
import {
  cheminInstitutionnel,
  PAGES_INSTITUTIONNELLES,
  type SlugInstitutionnel,
} from "@/lib/institutionnel-pages";

/**
 * Le groupe « L'entreprise » de la barre de navigation.
 *
 * Défini une fois, ici, parce qu'il doit être identique sur les six pages qui
 * portent la barre. La version précédente n'existait nulle part : les quatre
 * pages institutionnelles n'étaient dans aucun menu, et les atteindre
 * supposait de descendre jusqu'au pied de page — où elles étaient d'ailleurs
 * éparpillées entre « Ressources » et « Contact », deux pour deux.
 *
 * Ce sont pourtant les pages qu'on cherche au moment précis où l'on hésite :
 * une direction qui s'apprête à confier l'état civil de ses élèves à un
 * prestataire veut lire sa page sécurité et ses mentions légales avant de
 * signer, pas après.
 *
 * L'ordre suit ce que quelqu'un cherche, pas l'alphabet : d'abord qui nous
 * sommes, puis ce que nous faisons de ses données, puis les deux pages
 * juridiques.
 */

const ORDRE: readonly SlugInstitutionnel[] = [
  "a-propos",
  "securite",
  "confidentialite",
  "mentions-legales",
] as const;

const LIBELLES: Record<"fr" | "en", Record<SlugInstitutionnel, string>> = {
  fr: {
    "a-propos": "À propos",
    securite: "Sécurité des données",
    confidentialite: "Confidentialité",
    "mentions-legales": "Mentions légales",
  },
  en: {
    "a-propos": "About",
    securite: "Data security",
    confidentialite: "Privacy",
    "mentions-legales": "Legal notice",
  },
};

/**
 * Le groupe, prêt à poser dans `liens`.
 *
 * `intitule` vient de l'appelant plutôt que d'être lu ici : ce module est
 * importé par des composants serveur comme par des composants clients, et
 * faire dépendre les deux du catalogue de traduction obligerait à choisir
 * entre `getTranslations` et `useTranslations` — c'est-à-dire à en écrire deux
 * versions.
 */
export function groupeEntreprise(locale: string, intitule: string): GroupeNav {
  const langue = locale === "en" ? "en" : "fr";

  // On part du registre plutôt que d'une liste recopiée : une cinquième page
  // institutionnelle apparaîtrait dans le menu sans qu'on y pense, et une page
  // supprimée en disparaîtrait sans laisser un lien mort.
  const connues = ORDRE.filter((slug) => PAGES_INSTITUTIONNELLES.includes(slug));
  const oubliees = PAGES_INSTITUTIONNELLES.filter((slug) => !ORDRE.includes(slug));

  return {
    cle: "entreprise",
    libelle: intitule,
    groupe: true,
    liens: [...connues, ...oubliees].map((slug) => ({
      cle: slug,
      libelle: LIBELLES[langue][slug] ?? slug,
      href: cheminInstitutionnel(slug),
      interne: true,
    })),
  };
}
