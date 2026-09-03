"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * `domMax` embarquait le moteur de glisser-deposer et celui de projection de
 * mise en page — environ 127 ko de source, une vingtaine de fichiers — alors
 * que le depot ne contient aucun `drag`, aucun `layout`, aucun `layoutId`.
 * `domAnimation` couvre exactement ce qui est utilise : animations, survol,
 * apparition au defilement.
 */
export function MotionConfigProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
