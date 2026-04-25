import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";
import type { ReactNode } from "react";

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
      }}
    >
      {children}
    </DocsLayout>
  );
}
