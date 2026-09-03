import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

import { Footer } from "@/components/sections/footer";

/**
 * Le 404 localise.
 *
 * Une page d'erreur n'est pas une impasse : c'est une page que Google
 * rencontre, que des visiteurs atteignent depuis un lien perime, et qui doit
 * les remettre en route. On y remet donc les quatre entrees du site plutot
 * qu'un simple message d'excuse.
 */
export default async function Introuvable() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");

  const destinations = [
    { href: `/${locale}/universite`, cle: "universite" },
    { href: `/${locale}/college`, cle: "college" },
    { href: `/${locale}/docs`, cle: "docs" },
    { href: `/${locale}`, cle: "accueil" },
  ] as const;

  return (
    <>
      <main className="container py-section min-h-[60vh] flex flex-col justify-center">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
            404
          </p>

          <h1 className="font-serif font-light text-section-h2 text-accent mt-3 mb-4">
            {t("titre")}
          </h1>

          <p className="text-text-secondary max-w-[46ch] mx-auto mb-10">
            {t("texte")}
          </p>

          <nav aria-label={t("aria")}>
            <ul className="grid gap-3 sm:grid-cols-2 text-left">
              {destinations.map(({ href, cle }) => (
                <li key={cle}>
                  <Link
                    href={href}
                    className="block bg-bg-card border border-border rounded-lg p-4 transition-colors duration-200 hover:border-accent"
                  >
                    <span className="block text-text font-medium">
                      {t(`liens.${cle}.titre`)}
                    </span>
                    <span className="block text-text-muted text-[0.875rem] mt-1">
                      {t(`liens.${cle}.texte`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
