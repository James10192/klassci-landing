import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { HashScroll } from "@/components/docs/hash-scroll";
import { source } from "@/lib/source";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { locale } = await params;
  // With i18n on the loader, pageTree is { [locale]: Root }. getPageTree(locale)
  // returns the per-locale tree so sidebar links carry the right URLs
  // (`/docs/...` for FR, `/en/docs/...` for EN).
  const tree = source.getPageTree(locale);

  return (
    <DocsLayout
      tree={tree}
      i18n
      nav={{
        title: (
          <span className="inline-flex items-center gap-2">
            <Image
              src="/img/logo-klassci-full.png"
              alt="KLASSCI"
              width={469}
              height={179}
              priority
              className="h-6 w-auto"
            />
            <span className="font-serif text-[0.85em] text-text-muted">
              / Docs
            </span>
          </span>
        ),
        url: locale === "fr" ? "/" : `/${locale}`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
        // La documentation etait un puits : vingt-quatre pages, treize a
        // dix-neuf liens sortants chacune, et pas un seul retour vers les
        // pages produit. Elle recevait de l'autorite des pages vitrine sans
        // jamais en restituer — et un lecteur venu par une recherche
        // reglementaire n'avait aucun chemin vers ce que vend le site.
        footer: (
          <div className="mt-4 rounded-lg border border-border bg-bg-card p-4">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.06em] text-text-muted">
              {locale === "fr" ? "Le produit" : "The product"}
            </p>
            <ul className="mt-3 space-y-2 text-[0.85rem]">
              <li>
                <Link href={`/${locale}/universite`} className="text-text-secondary hover:text-accent">
                  {locale === "fr"
                    ? "Universite et grandes ecoles"
                    : "University and higher education"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/college`} className="text-text-secondary hover:text-accent">
                  {locale === "fr" ? "College et lycee" : "Middle and high school"}
                </Link>
              </li>
              {locale === "fr" && (
                <li>
                  <Link href="/fr/blog" className="text-text-secondary hover:text-accent">
                    Guides et ressources
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ),
      }}
    >
      <HashScroll />
      {children}
    </DocsLayout>
  );
}
