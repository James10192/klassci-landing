# klassci-landing

Marketing site for **klassci.com** apex — Next.js 14.2 on Vercel, hand-fed from the
canonical `welcome.blade.php` of the `KLASSCIv2` Laravel app.

The Laravel app continues to serve the authenticated SaaS at `<tenant>.klassci.com`
subdomains (cpanel `91.234.194.113`). Only the apex moves to Vercel.

## Stack

- Next.js 14.2 (App Router) + TypeScript strict
- Tailwind v3 with KLASSCI brand tokens (palette `#0453cb` accent on `#f6f4f0` beige)
- next-intl 4.9 — FR default at `/`, EN at `/en/...`
- IBM Plex Serif + Sans + Mono (via `next/font/google`)
- framer-motion (`LazyMotion + domMax`) for restrained micro-interactions
- PostHog (`posthog-js/react` canonical pattern, direct host — no `/ingest` proxy)
- Vercel Analytics + Speed Insights
- pnpm with `node-linker=hoisted`

## Local dev

```bash
pnpm install
cp .env.local.example .env.local       # then fill the PostHog key
pnpm dev
```

## Architecture

```
app/
├── layout.tsx                  # passthrough — locale layout does the work
├── globals.css                 # KLASSCI design tokens (light + dark)
└── [locale]/
    ├── layout.tsx              # IBM Plex fonts, PostHog, theme bootstrap, metadata
    └── page.tsx                # home (assembles sections)

components/
├── analytics/
│   └── posthog-provider.tsx    # canonical setup (= MailPulse / ADC pattern)
├── motion-config-provider.tsx
├── sections/
│   ├── nav.tsx
│   ├── hero.tsx
│   └── footer.tsx
└── ui/
    ├── logo.tsx
    ├── theme-toggle.tsx
    └── language-switcher.tsx

i18n/
├── routing.ts                  # locales=['fr','en'], defaultLocale='fr'
├── navigation.ts               # Link / useRouter / usePathname locale-aware
└── request.ts                  # message loader

messages/
├── fr.json                     # extracted from welcome.blade.php
└── en.json                     # full pro EN translation

lib/analytics/
├── events.ts                   # typed event catalog
└── track.ts                    # posthog.capture wrapper
```

## Brand tokens

CSS variables live in `app/globals.css`. Tailwind reads them via
`tailwind.config.ts` so `bg-accent`, `text-text-secondary`, `border-border-strong`,
etc. all map to the same palette. Dark mode is class-based via `html.dark`.

## Status

This is the **scaffold + Phase 1a foundation**. See `CHECKLIST.md` for everything
that still needs shipping (12 sections + tenant lookup API + image compression +
KLASSCIv2 Laravel cleanup PR + login refresh + DNS cutover).
