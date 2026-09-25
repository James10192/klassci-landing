"use client";

import { useId, useState } from "react";

/**
 * Deux captures du même écran, comparées au curseur : on fait glisser la
 * poignée (ou on utilise les flèches du clavier) pour découvrir l'« après ».
 *
 * Utilisé dans le journal des versions (content/docs/changelog*.mdx).
 * Les deux images doivent avoir le même cadrage ; la légende dit ce qui a
 * changé, pas ce que montre l'image.
 */
interface AvantApresProps {
  avant: string;
  apres: string;
  legende?: string;
  alt?: string;
  /** "telephone" limite la largeur pour une capture de téléphone. */
  format?: "bureau" | "telephone";
  libelleAvant?: string;
  libelleApres?: string;
}

export function AvantApres({
  avant,
  apres,
  legende,
  alt = "",
  format = "bureau",
  libelleAvant = "Avant",
  libelleApres = "Après",
}: AvantApresProps) {
  const [position, setPosition] = useState(50);
  const id = useId();
  const largeur = format === "telephone" ? "max-w-[340px]" : "max-w-full";

  return (
    <figure className={`not-prose mx-auto my-6 ${largeur}`}>
      <div className="relative select-none overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-[0_8px_30px_rgba(4,83,203,0.10)]">
        {/* L'« après » occupe le fond ; l'« avant » est découpé par-dessus. */}
        <img
          src={apres}
          alt={alt ? `${alt} — ${libelleApres}` : libelleApres}
          className="block h-auto w-full"
          loading="lazy"
          draggable={false}
        />
        <img
          src={avant}
          alt={alt ? `${alt} — ${libelleAvant}` : libelleAvant}
          className="absolute inset-0 block h-full w-full object-cover object-top"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          loading="lazy"
          draggable={false}
        />

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-slate-900/75 px-2.5 py-1 text-xs font-semibold text-white">
          {libelleAvant}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#0453cb] px-2.5 py-1 text-xs font-semibold text-white">
          {libelleApres}
        </span>

        {/* Ligne et poignée */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(4,83,203,0.35)]"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#0453cb]/30 bg-white text-[#0453cb] shadow-md">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        {/* Le curseur natif porte la souris, le doigt et le clavier. */}
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label={`Comparer ${libelleAvant.toLowerCase()} et ${libelleApres.toLowerCase()}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {legende ? (
        <figcaption className="mt-2.5 text-center text-sm text-fd-muted-foreground">
          {legende}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Même composant, libellés anglais par défaut (changelog.en.mdx). */
export function BeforeAfter(props: Omit<AvantApresProps, "legende"> & { caption?: string }) {
  const { caption, libelleAvant = "Before", libelleApres = "After", ...reste } = props;
  return <AvantApres {...reste} legende={caption} libelleAvant={libelleAvant} libelleApres={libelleApres} />;
}
