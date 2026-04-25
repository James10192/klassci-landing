import { useTranslations } from "next-intl";

interface SmallFeature {
  title: string;
  description: string;
}

export function FeaturesSmall() {
  const t = useTranslations("features");
  const items = t.raw("small") as SmallFeature[];

  return (
    <section
      className="container"
      aria-label="Fonctionnalités secondaires"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-border">
        {items.map((feature, index) => (
          <article
            key={feature.title}
            className="features-small-card relative overflow-hidden py-10 px-6 border-b border-border md:border-b-0 md:border-r md:border-border last:border-b-0 md:last:border-r-0 transition-colors duration-200 ease-klassci hover:bg-accent-light/40"
          >
            <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
            <h4 className="mt-3 font-sans font-semibold text-[0.95rem] text-text">
              {feature.title}
            </h4>
            <p className="mt-2 text-text-secondary text-[0.875rem] leading-relaxed">
              {feature.description}
            </p>
          </article>
        ))}
      </div>

      {/* Subtle left-to-right shine on hover — pure CSS, respects reduced motion */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .features-small-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.18) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        html.dark .features-small-card::after {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
        }
        .features-small-card:hover::after {
          transform: translateX(100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .features-small-card::after {
            transition: none;
          }
          .features-small-card:hover::after {
            transform: translateX(-100%);
          }
        }
      `,
        }}
      />
    </section>
  );
}
