"use client";

import { AnimatePresence, m } from "framer-motion";
import { forwardRef } from "react";

/**
 * Les pièces communes du portail public.
 *
 * Elles vivaient en trois exemplaires — un par écran — et elles avaient déjà
 * commencé à diverger : le ressort d'animation à 25 ici et 39 là, le décalage
 * des blocs à 0.05 d'un côté et 0.06 de l'autre, la marge d'un champ à
 * `mt-1.5` puis `mt-2`. Trois portes du même bâtiment qui ne s'ouvrent pas
 * tout à fait pareil : personne ne le remarque en relisant un fichier, tout le
 * monde le sent en passant d'un écran à l'autre.
 *
 * Les valeurs retenues sont celles de la réinscription, qui est en production
 * depuis plus longtemps et fait donc foi.
 */

export const RESSORT = { type: "spring", duration: 0.3, bounce: 0 } as const;

/** Chaque bloc entre décalé du précédent : l'écran se compose au lieu d'apparaître. */
export function entree(rang: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { ...RESSORT, delay: rang * 0.06 },
  };
}

/**
 * `text-[16px]` n'est pas une coquette : en dessous de 16px, Safari iOS zoome
 * de lui-même au focus et l'écran part de travers.
 */
export const champ =
  "mt-2 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[16px] text-text " +
  "placeholder:text-text-muted transition-[border-color,box-shadow] duration-200 " +
  "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-light";

/**
 * Une date de naissance saisie en trois cases est-elle complète ET plausible ?
 *
 * Les deux parcours posent la même question et n'y répondaient pas pareil : la
 * réinscription bornait chaque case, la candidature se contentait de compter
 * les chiffres. Un « 99 » dans la case du jour passait donc côté candidature,
 * jusqu'au 422 du serveur — soit un aller-retour réseau pour dire ce que le
 * navigateur savait déjà. C'est exactement le genre d'écart que ce fichier
 * existe pour supprimer.
 */
export function dateNaissanceValide(jour: string, mois: string, annee: string): boolean {
  const borne = (valeur: string, min: number, max: number) => {
    if (!/^\d+$/.test(valeur)) return false;
    const n = Number(valeur);

    return n >= min && n <= max;
  };

  // La borne haute est l'année en cours, et non une année ronde lointaine :
  // le serveur exige `before:today`, donc « 2100 » passait ici pour revenir en
  // 422 — l'aller-retour que cette fonction existe justement pour éviter.
  return borne(jour, 1, 31) && borne(mois, 1, 12) && borne(annee, 1900, new Date().getFullYear());
}

/** Rayon concentrique : la carte à 20px, les champs internes à 12px pour 8px de marge. */
export function Carte({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04),0_16px_40px_-12px_rgba(16,24,40,0.10)] sm:p-8">
      {children}
    </div>
  );
}

export function Section({ titre }: { titre: string }) {
  return (
    <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted first:mt-4">
      {titre}
    </h3>
  );
}

/**
 * Le message d'erreur d'un champ.
 *
 * Il n'affiche que le premier : sur un formulaire public, une pile de reproches
 * sous un même champ décourage plus qu'elle n'aide.
 */
export function Erreurs({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return <p className="mt-1 text-xs text-[#b91c1c]">{messages[0]}</p>;
}

export function Champ({
  label,
  value,
  onChange,
  aide,
  type = "text",
  inputMode,
  maxLength,
  chiffresSeulement = false,
  autoComplete = "off",
  erreurs,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aide?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  /** Même borne que la règle serveur : on refuse la frappe plutôt que l'envoi. */
  maxLength?: number;
  chiffresSeulement?: boolean;
  /**
   * Par defaut coupe, comme les cases de date dont ce composant descend. Mais
   * un formulaire public se remplit au telephone : les champs qui ont un
   * equivalent standard (nom, telephone, ville) doivent le declarer, sinon on
   * prive le candidat du remplissage automatique de son navigateur.
   */
  autoComplete?: string;
  erreurs?: string[];
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={(e) =>
          onChange(chiffresSeulement ? e.target.value.replace(/\D/g, "") : e.target.value)
        }
        className={champ}
      />
      {aide && <p className="mt-1 text-xs text-text-muted">{aide}</p>}
      <Erreurs messages={erreurs} />
    </label>
  );
}

type ProprietesCaseDate = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder: string;
  onEnter?: () => void;
};

/**
 * Une case de date.
 *
 * Elle porte une `ref` parce que le jour passe la main au mois, et le mois à
 * l'année, dès que la case est pleine : on tape sa date de naissance d'un
 * trait, sans jamais viser un champ. La candidature n'enchaîne pas les cases,
 * elle passe donc sans `ref` ni `onEnter` — les deux sont facultatifs.
 */
export const CaseDate = forwardRef<HTMLInputElement, ProprietesCaseDate>(function CaseDate(
  { label, value, onChange, max, placeholder, onEnter },
  ref,
) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-muted">{label}</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, max))}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        // Chiffres a chasse fixe : la largeur ne saute pas pendant la frappe.
        className={`${champ} mt-1 text-center tabular-nums`}
      />
    </label>
  );
});

export function Liste({
  label,
  vide,
  options,
  value,
  onChange,
  aide,
  erreurs,
}: {
  label: string;
  vide: string;
  options: { valeur: string; libelle: string }[];
  value: string;
  onChange: (v: string) => void;
  aide?: string;
  erreurs?: string[];
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={champ}>
        <option value="">{vide}</option>
        {options.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.libelle}
          </option>
        ))}
      </select>
      {aide && <p className="mt-1 text-xs text-text-muted">{aide}</p>}
      <Erreurs messages={erreurs} />
    </label>
  );
}

export function BoutonPrincipal({
  children,
  onClick,
  disabled,
  occupe,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  occupe?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={occupe}
      className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-accent px-5 text-[15px] font-semibold text-white transition-[background-color,scale,opacity] duration-200 hover:bg-accent-hover active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
    >
      {children}
    </button>
  );
}

/**
 * Le bandeau d'état, sous le formulaire.
 *
 * Il ne traduit rien lui-même, et c'est délibéré : chaque parcours a son
 * propre espace de messages, et un espace passé en paramètre serait une chaîne
 * quelconque — `useTranslations` ne saurait plus vérifier que la clé existe,
 * et une clé absente s'afficherait au visiteur telle quelle,
 * `inscription.etats.invalide.titre` en toutes lettres. Les deux textes sont
 * donc résolus chez l'appelant, où l'espace est écrit en dur et vérifié.
 *
 * `cle` sert uniquement à l'animation : c'est elle qui dit à `AnimatePresence`
 * qu'un message a été remplacé par un autre plutôt que simplement modifié.
 *
 * AUCUN texte passé ici ne doit contenir un mot de position — « ci-dessous »,
 * « plus haut », « à droite ». Ce bandeau se pose là où le doigt vient
 * d'appuyer, c'est-à-dire au bas de la carte : tout ce qu'il désigne est
 * au-dessus de lui. Un « les champs signalés en dessous » y a vécu le temps
 * d'une revue, et envoyait un bachelier faire défiler vers un écran vide alors
 * que la marque rouge était un écran et demi plus haut.
 */
export function Alerte({
  etat,
}: {
  etat: { cle: string; titre: string; texte: string } | null;
}) {
  return (
    <AnimatePresence initial={false}>
      {etat && (
        <m.div
          key={etat.cle}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={RESSORT}
          role="status"
          aria-live="polite"
          className="mt-5 rounded-xl border border-border bg-bg-alt p-4"
        >
          <p className="text-sm font-semibold text-text">{etat.titre}</p>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-text-secondary">
            {etat.texte}
          </p>
        </m.div>
      )}
    </AnimatePresence>
  );
}

/** Une des deux portes du portail : nouveau candidat, ou ancien étudiant. */
export function Porte({
  titre,
  texte,
  onClick,
}: {
  titre: string;
  texte: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-border p-4 text-left transition-[border-color,background-color,scale] duration-200 hover:border-accent hover:bg-accent-light active:scale-[0.96]"
    >
      <span className="flex-1">
        <span className="block font-semibold">{titre}</span>
        <span className="mt-1 block text-pretty text-sm leading-relaxed text-text-secondary">
          {texte}
        </span>
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-1 h-4 w-4 shrink-0 text-text-muted"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}
