"use client";

import Image from "next/image";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Laptop from "lucide-react/dist/esm/icons/laptop";
import School from "lucide-react/dist/esm/icons/school";
import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState, type ReactNode } from "react";

import { Logo } from "@/components/ui/logo";
import { SiteNav } from "@/components/sections/site-nav";
import { UniverseContactDialog } from "@/components/universe/universe-contact-dialog";
import { SceneProduit } from "@/components/vitrine/scene-produit";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics/track";

type DoorKey = "universite" | "college" | "lms";
type DoorIcon = typeof GraduationCap;

const DOORS: Array<{
  key: DoorKey;
  href: "/universite" | "/college" | "/lms";
  Icon: DoorIcon;
  image: string;
  tone: string;
  accent: string;
}> = [
  {
    key: "universite",
    href: "/universite",
    Icon: GraduationCap,
    image: "/img/dashboard/01-dashboard.png",
    tone: "from-[#0453cb]/70 to-[#0b1f45]/55",
    accent: "#0453cb",
  },
  {
    key: "college",
    href: "/college",
    Icon: School,
    image: "/img/college/current-dashboard.png",
    tone: "from-[#f58220]/50 to-[#0453cb]/40",
    accent: "#f58220",
  },
  {
    key: "lms",
    href: "/lms",
    Icon: Laptop,
    image: "/img/impact/virtual-class.svg",
    tone: "from-[#0453cb]/50 to-[#f58220]/30",
    accent: "#0453cb",
  },
];

/**
 * Le bandeau des etablissements arrive en PROP et non par un import : il est
 * rendu sur le serveur, ou vivent les adresses des instances, et traverse cette
 * frontiere deja construit.
 */
export function UniverseHub({ bandeauEtablissements }: { bandeauEtablissements?: ReactNode }) {
  const t = useTranslations("welcome");
  const nav = useTranslations("nav");
  const locale = useLocale() as "fr" | "en";
  const [contactOpen, setContactOpen] = useState(false);
  const [activeDoor, setActiveDoor] = useState<DoorKey | null>(null);
  const docsHref = `/${locale}/docs`;
  const homeHref = `/${locale}`;
  const mainDoors = DOORS.filter((door) => door.key !== "lms");
  const virtualDoor = DOORS.find((door) => door.key === "lms");
  const ouvrirContact = useCallback(() => {
    setContactOpen(true);
    track("cta_click", { location: "hub_nav_contact", locale });
  }, [locale]);

  return (
    <main className="min-h-screen overflow-hidden scroll-smooth bg-bg text-text">
      <SiteNav
        logo={<Logo className="[&_img]:h-9" />}
        libelles={{ ouvrirMenu: nav("menuOpen"), fermerMenu: nav("menuClose") }}
        liens={[
          { cle: "accueil", libelle: nav("home"), href: homeHref },
          ...DOORS.map(({ key, href, Icon }) => ({
            cle: key,
            libelle: t(`doors.${key}.name`),
            href,
            interne: true,
            icone: Icon,
          })),
          { cle: "docs", libelle: nav("docs"), href: docsHref, icone: BookOpen },
          {
            cle: "inscription",
            libelle: nav("inscription"),
            href: `/${locale}/inscription`,
            enAvant: true,
            onClick: () => track("cta_click", { location: "hub_inscription", locale }),
          },
        ]}
        action={({ fermerMenu, contexte }) => (
          <button
            type="button"
            onClick={() => {
              fermerMenu();
              ouvrirContact();
            }}
            className={
              contexte === "barre"
                ? "hidden min-h-11 items-center rounded border border-accent bg-accent px-3.5 text-sm font-medium text-white transition-all hover:bg-accent-hover sm:inline-flex"
                : "min-h-11 font-serif text-[1.75rem] font-light text-accent"
            }
          >
            {contexte === "barre" ? nav("contact") : nav("contactCta")}
          </button>
        )}
      />

      <UniverseContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />

      <section className="relative flex min-h-screen items-center pt-20">
        <div className="absolute inset-0 opacity-70" aria-hidden>
          <div className="hub-grid absolute inset-0" />
          <div className="hub-stage absolute inset-x-0 top-20 mx-auto h-[42rem] max-w-5xl" />
        </div>

        <div className="container relative z-10 grid gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="animate-fade-up">
            <Image
              src="/img/logo-klassci-full.png"
              alt="KLASSCI"
              width={469}
              height={179}
              priority
              className="mb-7 h-16 w-auto"
            />
            <p className="mb-5 inline-flex rounded border border-border bg-bg-card px-3 py-1 text-xs font-medium text-text-secondary shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              {t("kicker")}
            </p>
            <h1 className="max-w-[11ch] font-serif text-[clamp(3rem,8vw,5.8rem)] font-light leading-none text-text">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {t("subtitle")}
            </p>
            <p className="mt-8 max-w-md text-sm text-text-muted">
              {t("footNote")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#univers"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#f58220] px-5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(245,130,32,0.28)] transition-transform hover:-translate-y-0.5"
              >
                Voir les univers
                <ChevronDown className="h-4 w-4" aria-hidden />
              </a>
              {/* La porte des familles. Elle ne vivait que dans la barre de
                  navigation, c'est-a-dire nulle part sur mobile tant que le
                  menu reste ferme. */}
              <a
                href={`/${locale}/inscription`}
                onClick={() => track("cta_click", { location: "hub_inscription", locale })}
                aria-label={nav("inscriptionAria")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-accent px-5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
              >
                <GraduationCap className="h-4 w-4" aria-hidden />
                {nav("inscription")}
              </a>
            </div>
          </div>

          <SceneProduit
            etiquettes={{
              pilotage: t("demo.pilotage"),
              caisse: t("demo.caisse"),
              mobile: t("demo.mobile"),
            }}
          />
        </div>
      </section>

      {bandeauEtablissements}

      <section id="univers" className="relative z-10 scroll-mt-20 px-4 pb-20 md:px-6">
        <div className="container mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">{t("selector.eyebrow")}</p>
            <h2 className="mt-2 font-serif text-3xl font-light text-accent md:text-5xl">{t("selector.title")}</h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-relaxed text-text-secondary md:block">{t("selector.intro")}</p>
        </div>

        <div className="mx-auto flex max-w-[118rem] flex-col gap-3 md:h-[58vh] md:min-h-[30rem] md:flex-row">
          {mainDoors.map(({ key, href, Icon, image, tone, accent }) => {
            const isActive = activeDoor === key;
            const isMuted = activeDoor !== null && !isActive;
            const panelFlex = activeDoor === null ? "1 1 0%" : isActive ? "1.46 1 0%" : "0.74 1 0%";

            return (
              <m.article
                key={key}
                onMouseEnter={() => setActiveDoor(key)}
                onMouseLeave={() => setActiveDoor(null)}
                onFocus={() => setActiveDoor(key)}
                onBlur={() => setActiveDoor(null)}
                animate={{ flex: panelFlex }}
                transition={{ type: "spring", stiffness: 170, damping: 26 }}
                className="group relative min-h-[28rem] overflow-hidden rounded-lg border border-border bg-[#08152d] shadow-[0_24px_75px_rgba(4,83,203,0.14)] outline-none [transform-style:preserve-3d] md:min-h-0"
              >
                <img
                  src={image}
                  alt=""
                  className={[
                    "absolute inset-0 h-full w-full object-cover object-top transition duration-700",
                    isMuted ? "scale-[1.01] opacity-45 grayscale" : "scale-100 opacity-75 group-hover:scale-[1.055] group-hover:opacity-95",
                  ].join(" ")}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,21,45,0.04),rgba(8,21,45,0.86))]" />
                <div className={`absolute inset-0 bg-gradient-to-br ${tone} transition-opacity duration-500 ${isActive ? "opacity-20" : "opacity-50"}`} />

                <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                  <span className="rounded border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {t(`doors.${key}.tag`)}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/30 bg-white/15 text-white backdrop-blur-sm">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                </div>

                <div className="relative flex h-full min-h-[28rem] flex-col justify-end p-5 text-white md:min-h-0 md:p-7 lg:p-9">
                  <p className="mb-3 max-w-sm font-mono text-[0.72rem] uppercase tracking-[0.08em] text-white/70">
                    {t(`doors.${key}.power`)}
                  </p>
                  <h2 className="max-w-[12ch] font-serif text-4xl font-light leading-none text-white md:text-5xl">
                    {t(`doors.${key}.name`)}
                  </h2>
                  <p className="mt-5 max-w-xl text-sm font-medium leading-relaxed text-white/90 md:text-base">
                    {t(`doors.${key}.desc`)}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-white/22 bg-white/12 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                      {t(`doors.${key}.metric`)}
                    </span>
                    <span className="rounded border border-white/22 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
                      {key === "universite" ? t("selector.compatibleUniversity") : t("selector.compatibleCollege")}
                    </span>
                  </div>
                  <Link
                    href={href}
                    className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded border border-white/28 bg-white px-4 text-sm font-semibold text-[#08152d] transition-all group-hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    style={{ boxShadow: `0 16px 35px ${accent}2d` }}
                  >
                    {t(`doors.${key}.cta`)}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </div>
              </m.article>
            );
          })}
        </div>

        {virtualDoor && (
          <div className="container mt-4">
            <Link
              href={virtualDoor.href}
              className="group grid gap-4 rounded-lg border border-border bg-bg-card p-4 shadow-[0_18px_50px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-border-strong md:grid-cols-[auto_1fr_auto] md:items-center md:p-5"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded border border-border bg-bg-alt text-accent">
                <virtualDoor.Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">{t("selector.virtualTag")}</span>
                <span className="mt-1 block font-serif text-2xl font-light text-text">{t("selector.virtualTitle")}</span>
                <span className="mt-1 block text-sm leading-relaxed text-text-secondary">{t("selector.virtualText")}</span>
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                {t("selector.virtualPrimary")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </div>
        )}
      </section>

      <style jsx>{`
        .hub-grid {
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at 50% 35%, black, transparent 70%);
          opacity: 0.28;
        }

        .hub-stage {
          background: linear-gradient(135deg, rgba(4, 83, 203, 0.14), rgba(245, 130, 32, 0.12));
          clip-path: polygon(8% 10%, 92% 0, 100% 72%, 18% 100%);
        }

      `}</style>
    </main>
  );
}
