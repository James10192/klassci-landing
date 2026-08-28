import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/sections/footer";
import { ReinscriptionChrome } from "@/components/portail/reinscription-chrome";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "inscription.meta" });

  return buildUniverseMetadata({
    locale: safeLocale,
    noindex: true,
    title: t("title"),
    description: t("description"),
    path: "/inscription",
  });
}

/**
 * L'entree generale : college ou universite.
 *
 * Ce choix n'existe QUE sur ce chemin. Depuis la page « Universite et grandes
 * ecoles », le bouton envoie directement a l'etape suivante — quelqu'un qui
 * lit deja la page d'un produit n'a pas a redire lequel il veut.
 */
export default async function ChoixEdition({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "inscription" });

  return (
    <>
      <ReinscriptionChrome />
      <main className="min-h-screen bg-bg pt-[57px] text-text">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-xl">
            <header className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {t("hero.eyebrow")}
              </p>
              <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-text-secondary">
                {t("hero.subtitle")}
              </p>
            </header>

            <div className="mt-10 rounded-[20px] bg-bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04),0_16px_40px_-12px_rgba(16,24,40,0.10)] sm:p-8">
              <h2 className="text-balance text-xl font-semibold tracking-tight">
                {t("edition.titre")}
              </h2>
              <p className="mt-1.5 text-pretty text-sm text-text-secondary">{t("edition.aide")}</p>

              <div className="mt-5 space-y-3">
                <Link
                  href={`/${locale}/inscription/universite`}
                  className="flex items-start gap-3 rounded-xl border border-border p-4 transition-[border-color,background-color,scale] duration-200 hover:border-accent hover:bg-accent-light active:scale-[0.96]"
                >
                  <span className="flex-1">
                    <span className="block font-semibold">{t("edition.universite.titre")}</span>
                    <span className="mt-1 block text-pretty text-sm leading-relaxed text-text-secondary">
                      {t("edition.universite.texte")}
                    </span>
                  </span>
                </Link>

                {/* College est un produit separe, sur sa propre pile. Tant que
                    son canal n'existe pas, on renvoie vers son site plutot que
                    de faire croire a un formulaire qui n'aboutirait nulle part. */}
                <a
                  href="https://college.klassci.com"
                  className="flex items-start gap-3 rounded-xl border border-border p-4 transition-[border-color,background-color,scale] duration-200 hover:border-accent hover:bg-accent-light active:scale-[0.96]"
                >
                  <span className="flex-1">
                    <span className="block font-semibold">{t("edition.college.titre")}</span>
                    <span className="mt-1 block text-pretty text-sm leading-relaxed text-text-secondary">
                      {t("edition.college.texte")}
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
