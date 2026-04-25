import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export function Security() {
  const t = useTranslations("security");
  const locale = useLocale() as "fr" | "en";

  const eyebrowLabel = locale === "fr" ? "Sécurité" : "Security";

  return (
    <section
      className="py-section container"
      aria-labelledby="security-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image — left */}
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-border bg-bg-alt">
          <Image
            src={t("image")}
            alt={t("alt")}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
            className="object-cover"
          />
        </div>

        {/* Text — right */}
        <div>
          <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
            08 — {eyebrowLabel}
          </p>
          <h2
            id="security-heading"
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
      </div>
    </section>
  );
}
