"use client";

import { m } from "framer-motion";

interface SdgItem {
  number: string;
  name: string;
  text: string;
}

type SdgVariant = "university" | "college";

const SDG_IMAGES: Record<string, string> = {
  "04": "/img/impact/odd-04.jpg",
  "05": "/img/impact/odd-05.jpg",
  "08": "/img/impact/odd-08.jpg",
  "09": "/img/impact/odd-09.jpg",
  "10": "/img/impact/odd-10.jpg",
  "12": "/img/impact/odd-12.jpg",
  "13": "/img/impact/odd-13.jpg",
  "16": "/img/impact/odd-16.jpg",
  "17": "/img/impact/odd-17.jpg",
};

const SDG_TONES: Record<string, string> = {
  "04": "from-[#0453cb] to-[#2f80ed]",
  "05": "from-[#cc2d7b] to-[#f06292]",
  "08": "from-[#8f1838] to-[#d23c55]",
  "09": "from-[#d46b08] to-[#f59e0b]",
  "10": "from-[#b4236b] to-[#dd5098]",
  "12": "from-[#8a5f12] to-[#c48a16]",
  "13": "from-[#117a3a] to-[#1fa463]",
  "16": "from-[#075985] to-[#0ea5e9]",
  "17": "from-[#17417f] to-[#0453cb]",
};

const FEATURED_NUMBERS = new Set(["04", "12", "13", "16"]);

function getTone(number: string, variant: SdgVariant) {
  if (variant === "college" && number === "04") {
    return "from-[#0453cb] via-[#2563eb] to-[#f58220]";
  }

  return SDG_TONES[number] ?? "from-[#0453cb] to-[#2f80ed]";
}

export function SdgImpactGrid({
  items,
  variant = "university",
}: {
  items: SdgItem[];
  variant?: SdgVariant;
}) {
  const [heroItem, ...supportItems] = items;
  const spotlightItems = supportItems.filter((item) => FEATURED_NUMBERS.has(item.number));
  const compactItems = supportItems.filter((item) => !FEATURED_NUMBERS.has(item.number));

  return (
    <div className="relative">
      <div className="absolute inset-x-8 top-10 -z-10 h-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
        {heroItem ? <HeroImpactCard item={heroItem} variant={variant} /> : null}

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {spotlightItems.map((item) => (
              <SpotlightImpactCard key={item.number} item={item} variant={variant} />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {compactItems.map((item) => (
              <CompactImpactCard key={item.number} item={item} variant={variant} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroImpactCard({ item, variant }: { item: SdgItem; variant: SdgVariant }) {
  return (
    <m.article
      whileHover={{ y: -5, rotateX: 1.5, rotateY: -1.5 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="group relative min-h-[28rem] overflow-hidden rounded-lg border border-border bg-bg-card shadow-[0_24px_70px_rgba(4,83,203,0.14)] [transform-style:preserve-3d]"
    >
      <div className={`absolute inset-x-0 top-0 h-[58%] bg-gradient-to-br ${getTone(item.number, variant)}`} />
      <img
        src={SDG_IMAGES[item.number] ?? "/img/impact/odd-04.jpg"}
        alt=""
        className="absolute inset-x-0 top-0 h-[58%] w-full object-cover opacity-95 transition duration-700 group-hover:scale-[1.045]"
        loading="lazy"
      />
      <div className="absolute inset-x-0 top-0 h-[58%] bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.42),transparent_32%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

      <div className="absolute left-5 top-5 flex items-center gap-2 text-white">
        <span className="inline-flex h-10 items-center rounded border border-white/35 bg-black/20 px-3 font-mono text-xs font-semibold backdrop-blur-md">
          ODD {item.number}
        </span>
        <span className="hidden rounded border border-white/25 bg-white/15 px-3 py-2 text-xs font-medium backdrop-blur-md sm:inline-flex">
          ONU
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-bg-card p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          ODD / SDG
        </p>
        <h3 className="mt-3 max-w-[12ch] font-serif text-4xl font-light leading-none text-text md:text-5xl">
          {item.name}
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
          {item.text}
        </p>
      </div>
    </m.article>
  );
}

function SpotlightImpactCard({ item, variant }: { item: SdgItem; variant: SdgVariant }) {
  return (
    <m.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group overflow-hidden rounded-lg border border-border bg-bg-card shadow-[0_18px_46px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-36 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getTone(item.number, variant)} opacity-90`} />
        <img
          src={SDG_IMAGES[item.number] ?? "/img/impact/odd-04.jpg"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24))]" />
        <span className="absolute left-4 top-4 rounded border border-white/35 bg-black/20 px-2.5 py-1.5 font-mono text-[0.72rem] font-semibold text-white backdrop-blur-md">
          ODD {item.number}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-2xl font-light leading-tight text-text">
          {item.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {item.text}
        </p>
      </div>
    </m.article>
  );
}

function CompactImpactCard({ item, variant }: { item: SdgItem; variant: SdgVariant }) {
  return (
    <m.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-bg-card p-4 shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getTone(item.number, variant)}`} />
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-border bg-bg-alt">
          <img
            src={SDG_IMAGES[item.number] ?? "/img/impact/odd-04.jpg"}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-accent">
            ODD {item.number}
          </p>
          <h3 className="mt-1 font-sans text-sm font-semibold leading-snug text-text">
            {item.name}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-text-secondary">
        {item.text}
      </p>
    </m.article>
  );
}
