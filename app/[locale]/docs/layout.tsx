import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";
import type { ReactNode } from "react";

import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
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
        url: "/",
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  );
}
