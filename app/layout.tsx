// Root layout exists only to keep Next happy — the real work happens
// in app/[locale]/layout.tsx which wraps everything in the locale provider.
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
