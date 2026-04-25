import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export function Support() {
  const t = useTranslations("support");
  const locale = useLocale() as "fr" | "en";

  const eyebrowLabel = locale === "fr" ? "Support" : "Support";

  return (
    <section
      className="py-section container"
      aria-labelledby="support-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text — left (reversed direction vs Security for editorial rhythm) */}
        <div className="lg:order-1">
          <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
            09 — {eyebrowLabel.toUpperCase()}
          </p>
          <h2
            id="support-heading"
            className="font-serif font-light text-section-h2 text-accent mb-6"
          >
            {t("title")}
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            {t("p1")}
          </p>
          <p className="text-text-secondary leading-relaxed">
            {t("p2")}
          </p>
        </div>

        {/* Image — right */}
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-border bg-bg-alt lg:order-2">
          <Image
            src={t("image")}
            alt={t("alt")}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
