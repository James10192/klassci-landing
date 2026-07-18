"use client";

import Database from "lucide-react/dist/esm/icons/database";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Headphones from "lucide-react/dist/esm/icons/headphones";
import LineChart from "lucide-react/dist/esm/icons/chart-no-axes-combined";
import Rocket from "lucide-react/dist/esm/icons/rocket";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

interface DeploymentItem {
  title: string;
  text: string;
}

const DEPLOYMENT_STEPS = [
  { key: "scoping", icon: SlidersHorizontal },
  { key: "migration", icon: Database },
  { key: "training", icon: GraduationCap },
  { key: "launch", icon: Rocket },
] as const;
const DEPLOYMENT_ASSURANCES = [
  { key: "backups", icon: ShieldCheck },
  { key: "support", icon: Headphones },
  { key: "adoption", icon: LineChart },
] as const;

export function Deployment() {
  const t = useTranslations("deployment");
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-y border-border bg-bg-alt/55 py-16 lg:py-20" aria-labelledby="deployment-title">
      <div className="container">
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-text-muted">{t("eyebrow")}</p>
          <h2 id="deployment-title" className="mt-4 font-serif text-4xl font-light text-accent lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-text-secondary">{t("intro")}</p>
        </header>

        <motion.ol
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="relative mt-12 grid gap-8 before:absolute before:bottom-8 before:left-5 before:top-6 before:w-px before:bg-border-strong md:grid-cols-4 md:gap-6 md:before:left-[12.5%] md:before:right-[12.5%] md:before:top-5 md:before:h-px md:before:w-auto"
        >
          {DEPLOYMENT_STEPS.map(({ key, icon: Icon }, index) => {
            const step = t.raw(`steps.${key}`) as DeploymentItem;
            return (
              <motion.li
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
                className="relative grid grid-cols-[2.5rem_1fr] gap-4 md:block md:text-center"
              >
                <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-bg-card text-accent md:mx-auto">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.07em] text-text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-sans text-base font-semibold text-text">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.text}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>

        <div className="mt-12 grid overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {DEPLOYMENT_ASSURANCES.map(({ key, icon: Icon }) => {
            const assurance = t.raw(`assurances.${key}`) as DeploymentItem;
            return (
              <article key={key} className="flex gap-4 bg-bg-card p-5 lg:p-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-accent/20 bg-accent-light text-accent">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-text">{assurance.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{assurance.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
