import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Les composants MDX du blog.
 *
 * La documentation utilise ceux de Fumadocs, qui vont avec sa mise en page. Le
 * blog a la sienne : une colonne de lecture, une typographie serif, et rien
 * d'autre. On declare donc son propre jeu plutot que d'importer une
 * bibliotheque d'interface entiere pour afficher des paragraphes.
 *
 * Les identifiants des titres sont poses en amont par `remarkHeading`
 * (`source.config.ts`) : les ancres fonctionnent sans code supplementaire ici.
 */

function Lien({
  href = "",
  children,
  ...reste
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const interne = href.startsWith("/");
  if (interne) {
    return (
      <Link href={href} className="text-accent underline underline-offset-2 hover:text-accent-hover">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      // Les liens sortants s'ouvrent dans un nouvel onglet : un article
      // reglementaire cite des textes officiels, et le lecteur qui va les
      // verifier ne doit pas perdre sa place.
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent underline underline-offset-2 hover:text-accent-hover"
      {...reste}
    >
      {children}
    </a>
  );
}

export const composantsBlog: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-14 scroll-mt-24 font-serif text-[1.75rem] font-light leading-tight text-accent"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-10 scroll-mt-24 font-serif text-[1.3rem] font-normal text-text"
      {...props}
    />
  ),
  h4: (props) => (
    <h4 className="mt-8 scroll-mt-24 font-sans text-[1.05rem] font-semibold text-text" {...props} />
  ),
  p: (props) => <p className="mt-5 leading-[1.75] text-text-secondary" {...props} />,
  ul: (props) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 leading-[1.75] text-text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 leading-[1.75] text-text-secondary" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  a: Lien,
  strong: (props) => <strong className="font-semibold text-text" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 border-accent bg-bg-alt px-5 py-4 text-text-secondary [&>p]:mt-0"
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-border" />,
  // Un tableau large ne doit pas pousser la page en debordement horizontal :
  // il defile dans son propre cadre.
  table: (props) => (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-[0.9rem]" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-bg-alt" {...props} />,
  th: (props) => (
    <th
      className="border-b border-border px-4 py-3 text-left font-sans text-[0.8rem] font-semibold uppercase tracking-[0.04em] text-text-muted"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-b border-border px-4 py-3 align-top text-text-secondary" {...props} />
  ),
  code: (props) => (
    <code
      className="rounded bg-bg-alt px-1.5 py-0.5 font-mono text-[0.85em] text-text"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-lg border border-border bg-bg-alt p-4 font-mono text-[0.85rem] leading-relaxed"
      {...props}
    />
  ),
};
