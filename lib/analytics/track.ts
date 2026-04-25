import posthog from "posthog-js";
import type { AnalyticsEventName, EventProps } from "./events";

export function track<N extends AnalyticsEventName>(
  name: N,
  props: EventProps<N>,
): void {
  if (typeof window === "undefined") return;
  posthog.capture(name, props as Record<string, unknown>);
}
