"use client";

import { motion } from "framer-motion";

interface SdgItem {
  number: string;
  name: string;
  text: string;
}

const SDG_IMAGES: Record<string, string> = {
  "04": "/img/impact/odd-04.svg",
  "05": "/img/impact/odd-05.svg",
  "08": "/img/impact/odd-08.svg",
  "09": "/img/impact/odd-09.svg",
  "10": "/img/impact/odd-10.svg",
  "12": "/img/impact/odd-12.svg",
  "13": "/img/impact/odd-13.svg",
  "16": "/img/impact/odd-16.svg",
  "17": "/img/impact/odd-17.svg",
};

export function SdgImpactGrid({ items }: { items: SdgItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.article
          key={item.number}
          whileHover={{ y: -3, scale: 1.008 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={[
            "group relative min-h-[11.5rem] overflow-hidden rounded-lg border border-border bg-bg-card shadow-[0_14px_38px_rgba(0,0,0,0.07)]",
            index === 0 ? "lg:col-span-2" : "",
            index === 8 ? "lg:col-span-2" : "",
          ].join(" ")}
        >
          <img
            src={SDG_IMAGES[item.number] ?? "/img/impact/odd-04.svg"}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,31,0.02),rgba(8,15,31,0.74))] transition-opacity duration-300 group-hover:opacity-85" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,83,203,0.28),rgba(245,130,32,0.20))] opacity-50 transition-opacity duration-300 group-hover:opacity-24" />

          <div className="relative flex min-h-[11.5rem] flex-col justify-between p-4 text-white">
            <span className="inline-flex h-8 w-fit min-w-8 items-center justify-center rounded border border-white/35 bg-white/15 px-2 font-mono text-[0.72rem] font-semibold backdrop-blur-sm">
              {item.number}
            </span>
            <div>
              <h3 className={index === 0 ? "font-serif text-2xl font-light leading-tight text-white drop-shadow-sm lg:text-3xl" : "font-serif text-xl font-light leading-tight text-white drop-shadow-sm"}>
                {item.name}
              </h3>
              <p className="mt-2 max-w-xl text-xs font-medium leading-relaxed text-white/90">{item.text}</p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
