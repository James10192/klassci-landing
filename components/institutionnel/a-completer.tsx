import type { ReactNode } from "react";

/**
 * Ce qui manque, dit à l'écran.
 *
 * Les mentions légales exigent des informations que ce dépôt ne contient pas :
 * numéro d'immatriculation, forme juridique, adresse postale, nom du directeur
 * de la publication. Trois façons de traiter ce trou, et une seule est
 * honnête :
 *
 * 1. Inventer une valeur plausible. C'est la pire : une mention légale fausse
 *    est plus grave qu'une mention légale absente, parce qu'elle est opposable.
 * 2. Laisser un commentaire dans le code. Personne ne le lit, et la page part
 *    en production avec une rubrique muette dont personne ne se souvient.
 * 3. Écrire à l'écran ce qui manque, et pourquoi. Le lecteur voit une page
 *    incomplète — ce qu'elle est — et la personne qui la relit avant la mise en
 *    ligne voit sa liste de courses.
 *
 * C'est la troisième. L'encadré est volontairement visible et contrasté : s'il
 * se fondait dans la page, il resterait après la mise en ligne.
 *
 * `titre` est passé depuis le MDX plutôt que déduit de la langue : chaque
 * fichier écrit son propre libellé, et le composant n'a pas besoin de connaître
 * la locale pour être bilingue.
 */
export function ACompleter({
  titre = "À compléter avant mise en ligne",
  children,
}: {
  titre?: string;
  children: ReactNode;
}) {
  return (
    <aside
      role="note"
      className="mt-8 rounded-lg border border-dashed border-brand-orange bg-brand-orange-light p-5 sm:p-6"
    >
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-brand-orange">
        {titre}
      </p>
      <div className="mt-3 text-[0.92rem] leading-relaxed text-text-secondary [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>p]:mt-3 [&>p:first-child]:mt-0">
        {children}
      </div>
    </aside>
  );
}
