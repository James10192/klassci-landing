"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

interface Client {
  name: string;
  detail: string;
  logo: string;
}

export function ClientMarquee() {
  const t = useTranslations("socialProof");
  const locale = useLocale() as "fr" | "en";

  const clients = t.raw("clients") as Client[];

  const eyebrowLabel = locale === "fr" ? "Confiance" : "Trusted by";

  // Duplicate clients once to enable a seamless CSS marquee loop
  const marqueeItems = [
    ...clients.map((c, i) => ({ ...c, key: `a-${i}` })),
    ...clients.map((c, i) => ({ ...c, key: `b-${i}` })),
  ];

  return (
    <section
      className="py-section overflow-hidden"
      aria-labelledby="clients-heading"
    >
      {/* Section header */}
      <div className="container text-center mb-12">
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
          01 — {eyebrowLabel}
        </p>
        <h2
          id="clients-heading"
          className="font-serif font-light text-section-h2 text-accent max-w-[40ch] mx-auto"
        >
          {t("title")}
        </h2>
      </div>

      {/* Marquee — full bleed, 5 client cards (doubled) scrolling, paused on hover */}
      <div className="relative -mx-[calc(50vw-50%)] w-screen overflow-hidden marquee-fade py-3">
        <div className="client-marquee-track flex gap-6 w-fit">
          {marqueeItems.map((item) => (
            <div
              key={item.key}
              className="flex flex-col items-center gap-3 px-10 py-8 min-w-[240px] flex-shrink-0 bg-bg-card border border-border rounded-lg transition-all duration-200 ease-klassci hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(4,83,203,0.08)]"
            >
              <div className="relative h-16 w-16 flex items-center justify-center">
                <Image
                  src={item.logo}
                  alt=""
                  width={64}
                  height={64}
                  sizes="64px"
                  className="object-contain h-16 w-16"
                  loading="lazy"
                  priority={false}
                />
              </div>
              <div className="font-sans font-semibold text-[0.9rem] text-text text-center">
                {item.name}
              </div>
              <div className="font-mono uppercase tracking-[0.06em] text-[0.7rem] text-text-muted text-center">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .client-marquee-track {
          animation: clientMarquee 40s linear infinite;
        }

        :global(.marquee-fade:hover) .client-marquee-track {
          animation-play-state: paused;
        }

        @keyframes clientMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.75rem));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .client-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
