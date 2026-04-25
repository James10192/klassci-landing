"use client";

import { useEffect } from "react";

// Fumadocs SearchDialog uses next/navigation router.push to navigate to
// docs results. Two known Next.js App Router pitfalls bite us here:
//   1. router.push('/page#anchor') doesn't scroll if the path was already
//      the active one (no re-render fires) — same-page hash nav is silent.
//   2. Even on cross-page nav the target heading can be missing from the
//      DOM the first frame after URL update, so a single-shot scroll
//      attempt loses the race.
//
// This component:
//   - polls window.location.hash every 100ms to detect router-driven hash
//     changes that don't fire native `hashchange`
//   - retries scrollIntoView a few times until the element is mounted
//   - listens for the native hashchange event so plain <a href="#x">
//     clicks still work
function tryScrollToHash(maxAttempts = 10): void {
  if (typeof window === "undefined" || !window.location.hash) return;
  const id = decodeURIComponent(window.location.hash.slice(1));

  let attempts = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (++attempts < maxAttempts) {
      setTimeout(attempt, 50);
    }
  };
  requestAnimationFrame(attempt);
}

export function HashScroll() {
  useEffect(() => {
    let lastHash = window.location.hash;

    // Honour any hash present at first paint (e.g., direct deep-link).
    tryScrollToHash();

    const poll = setInterval(() => {
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash;
        tryScrollToHash();
      }
    }, 100);

    const onHashChange = () => {
      lastHash = window.location.hash;
      tryScrollToHash();
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      clearInterval(poll);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
