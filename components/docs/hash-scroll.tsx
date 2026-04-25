"use client";

import { useEffect } from "react";

// Why this exists at all:
// Fumadocs' SearchDialog navigates via next/navigation router.push, and the
// App Router has two well-known pitfalls with #anchors:
//   1. Pushing to the SAME path with only a different #hash is silent —
//      no re-render fires, so neither React's effects nor the browser's
//      native anchor scroll kick in.
//   2. On cross-page navs, the target heading often isn't in the DOM yet
//      the first frame after the URL update, so a single-shot scrollIntoView
//      loses the race against the React render.
//
// We poll location.hash, listen for native hashchange, retry until the
// element appears, and fall back to a slug variant if the encoded hash and
// the rendered id slugify slightly differently (accent vs. no accent).
const POLL_INTERVAL_MS = 100;
const RETRY_INTERVAL_MS = 60;
const MAX_RETRIES = 25; // ~1.5 seconds of patience before giving up

function findById(rawId: string): HTMLElement | null {
  // Try the exact id first.
  let el = document.getElementById(rawId);
  if (el) return el;

  // Browsers can deliver location.hash either pre-decoded or URL-encoded
  // depending on how the URL was set. Try the decoded variant.
  try {
    const decoded = decodeURIComponent(rawId);
    if (decoded !== rawId) {
      el = document.getElementById(decoded);
      if (el) return el;
    }
  } catch {
    // Malformed % sequence — ignore and continue.
  }

  // Final fallback: stripped-of-diacritics slug. github-slugger and similar
  // tools can disagree on whether `é` collapses to `e`; try the stripped
  // form too so search-index slugs match either spelling.
  const stripped = rawId.normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (stripped !== rawId) {
    el = document.getElementById(stripped);
    if (el) return el;
  }

  return null;
}

function scrollToCurrentHash(): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.slice(1);

  let attempts = 0;
  const attempt = () => {
    const el = findById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (++attempts < MAX_RETRIES) {
      setTimeout(attempt, RETRY_INTERVAL_MS);
    }
  };
  requestAnimationFrame(attempt);
}

export function HashScroll() {
  useEffect(() => {
    let lastHash = window.location.hash;

    // Honour any hash present at first paint (deep link).
    scrollToCurrentHash();

    // Detect router-driven hash changes that don't fire `hashchange`.
    const poll = setInterval(() => {
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash;
        scrollToCurrentHash();
      }
    }, POLL_INTERVAL_MS);

    // Plain anchor clicks fire this natively.
    const onHashChange = () => {
      lastHash = window.location.hash;
      scrollToCurrentHash();
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      clearInterval(poll);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
