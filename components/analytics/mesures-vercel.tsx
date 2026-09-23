"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { filtrerMesureVercel } from "@/lib/analytics/confidentialite";

/**
 * Vercel Analytics et Speed Insights, avec le même filtre que PostHog.
 *
 * Composant client parce que `beforeSend` est une fonction : la mise en page,
 * rendue côté serveur, ne peut pas la transmettre elle-même.
 */
export function MesuresVercel() {
  return (
    <>
      <Analytics beforeSend={filtrerMesureVercel} />
      <SpeedInsights beforeSend={(evenement) => filtrerMesureVercel(evenement)} />
    </>
  );
}
