import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import {
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Habillage du journal des versions (/docs/changelog) : une frise par mois,
 * une pastille par rubrique, une carte par entrée. Le MDX reste du Markdown
 * ordinaire — seuls les titres et les listes sont rendus autrement, et
 * uniquement sur cette page.
 */

type Rubrique = { icone: LucideIcon; ton: string };

const RUBRIQUES: Record<string, Rubrique> = {
  ajouts: { icone: Sparkles, ton: "bg-[#0453cb] text-white" },
  added: { icone: Sparkles, ton: "bg-[#0453cb] text-white" },
  "améliorations": { icone: TrendingUp, ton: "bg-[#0453cb]/10 text-[#0453cb] ring-1 ring-inset ring-[#0453cb]/25" },
  improved: { icone: TrendingUp, ton: "bg-[#0453cb]/10 text-[#0453cb] ring-1 ring-inset ring-[#0453cb]/25" },
  corrections: { icone: Wrench, ton: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/25 dark:text-emerald-300" },
  correctifs: { icone: Wrench, ton: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/25 dark:text-emerald-300" },
  fixed: { icone: Wrench, ton: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/25 dark:text-emerald-300" },
  "sécurité": { icone: ShieldCheck, ton: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" },
  security: { icone: ShieldCheck, ton: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" },
  suppressions: { icone: Trash2, ton: "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-400/30 dark:text-slate-300" },
  removed: { icone: Trash2, ton: "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-400/30 dark:text-slate-300" },
};

function texteDe(noeud: ReactNode): string {
  if (typeof noeud === "string" || typeof noeud === "number") return String(noeud);
  if (Array.isArray(noeud)) return noeud.map(texteDe).join("");
  if (noeud && typeof noeud === "object" && "props" in noeud) {
    return texteDe((noeud as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function Mois({ children, id, ...reste }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 id={id} {...reste} className="jv-mois">
      <span className="jv-point" aria-hidden />
      <a href={id ? `#${id}` : undefined} className="no-underline">
        {children}
      </a>
    </h2>
  );
}

function RubriqueTitre({ children, id, ...reste }: ComponentPropsWithoutRef<"h3">) {
  const cle = texteDe(children).trim().toLowerCase();
  const rubrique = RUBRIQUES[cle];
  if (!rubrique) {
    return <h3 id={id} {...reste}>{children}</h3>;
  }
  const Icone = rubrique.icone;
  return (
    <h3 id={id} {...reste} className="jv-rubrique">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8rem] font-semibold ${rubrique.ton}`}>
        <Icone className="size-3.5" aria-hidden />
        {children}
      </span>
    </h3>
  );
}

export const composantsJournal: MDXComponents = {
  h2: Mois,
  h3: RubriqueTitre,
};
