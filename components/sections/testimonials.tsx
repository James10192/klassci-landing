import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

interface Testimonial {
  quote: string;
  highlight: string;
  author: string;
  role: string;
  avatar: string;
  featured: boolean;
}

// Avatars that don't have a real image yet — we render a monogram instead.
// Avoid 404s on `next/image` by short-circuiting to the fallback.
const MISSING_AVATARS = new Set<string>([
  "/img/avatars/ama-bamba.jpg",
  "/img/avatars/tarek-mehdy.jpg",
]);

function getInitials(name: string): string {
  const parts = name
    .replace(/^Dr\.?\s+/i, "")
    .replace(/^M(?:r|me|lle)\.?\s+/i, "")
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MonogramAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-accent text-white font-mono font-semibold text-[0.78rem] shrink-0"
    >
      {getInitials(name)}
    </span>
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  if (!src || MISSING_AVATARS.has(src)) {
    return <MonogramAvatar name={name} />;
  }
  return (
    <span className="relative inline-block h-10 w-10 rounded-full overflow-hidden bg-bg-alt shrink-0">
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
      />
    </span>
  );
}

// Render the quote with the highlight wrapped in <mark>.
// Splits the string instead of using dangerouslySetInnerHTML to avoid XSS.
function QuoteWithHighlight({
  quote,
  highlight,
}: {
  quote: string;
  highlight: string;
}) {
  if (!highlight) {
    return <>{quote}</>;
  }
  const idx = quote.indexOf(highlight);
  if (idx === -1) {
    return <>{quote}</>;
  }
  const before = quote.slice(0, idx);
  const after = quote.slice(idx + highlight.length);
  return (
    <>
      {before}
      <mark className="bg-accent-light text-text px-0.5 rounded-sm">
        {highlight}
      </mark>
      {after}
    </>
  );
}

export function Testimonials() {
  const t = useTranslations("socialProof");
  const locale = useLocale() as "fr" | "en";
  const testimonials = t.raw("testimonials") as Testimonial[];

  const eyebrowLabel = locale === "fr" ? "Témoignages" : "Testimonials";

  return (
    <section
      className="py-section container"
      aria-labelledby="testimonials-heading"
    >
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
          02 — {eyebrowLabel}
        </p>
        <h2
          id="testimonials-heading"
          className="font-serif font-light text-section-h2 max-w-[40ch] mx-auto"
        >
          {t("title")}
        </h2>
      </div>

      {/* 3-card grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {testimonials.map((testimonial, index) => {
          const isFeatured = testimonial.featured;
          return (
            <article
              key={`${testimonial.author}-${index}`}
              className={[
                "flex flex-col h-full p-6 lg:p-8 rounded-lg bg-bg-card",
                "border border-border",
                isFeatured ? "border-t-2 border-t-accent" : "",
                "transition-all duration-300 ease-klassci",
                "hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <blockquote className="font-serif font-light text-[1.05rem] leading-[1.7] text-text mb-6 flex-1">
                <QuoteWithHighlight
                  quote={testimonial.quote}
                  highlight={testimonial.highlight}
                />
              </blockquote>

              <figcaption className="flex items-center gap-3 mt-auto not-italic">
                <Avatar src={testimonial.avatar} name={testimonial.author} />
                <div className="min-w-0">
                  <div className="font-sans font-semibold text-[0.875rem] text-text truncate">
                    {testimonial.author}
                  </div>
                  <div className="text-text-muted text-[0.78rem] font-mono uppercase tracking-[0.06em] truncate">
                    {testimonial.role}
                  </div>
                </div>
              </figcaption>
            </article>
          );
        })}
      </div>
    </section>
  );
}
