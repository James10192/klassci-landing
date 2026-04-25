"use client";

import { LazyMotion, domMax } from "framer-motion";
import type { ReactNode } from "react";

export function MotionConfigProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
