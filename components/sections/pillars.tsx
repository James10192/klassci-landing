import { useTranslations } from "next-intl";

interface Pillar {
  title: string;
  description: string;
}

export function Pillars() {
  const t = useTranslations("pillars");
  const items = t.raw("items") as Pillar[];

  return (
    <section
      className="container"
      aria-label="Trois piliers"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-border">
        {items.map((pillar, index) => (
          <article
            key={pillar.title}
            className="py-12 px-6 md:px-10 border-b border-border md:border-b-0 md:border-r md:border-border last:border-b-0 md:last:border-r-0 transition-colors duration-200 ease-klassci hover:bg-accent-light/40"
          >
            <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
            <h3 className="mt-4 font-serif font-light text-2xl md:text-3xl text-text">
              {pillar.title}
            </h3>
            <p className="mt-4 text-text-secondary text-[0.95rem] leading-relaxed">
              {pillar.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
