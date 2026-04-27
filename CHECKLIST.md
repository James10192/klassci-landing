# KLASSCI Landing — Implementation Checklist

This document is the handoff for follow-up sessions. It splits the work into shippable
phases so each session can pick up cleanly. The scaffold (Phase 1a) is done; everything
below is the remaining work.

---

## Done in this session (2026-04-25)

- [x] Phase 0 — recon (welcome.blade.php content extraction + design tokens audit + klassci.com URL crawl + lang/ audit + live klassci.com a11y snapshot via chrome-devtools)
- [x] Phase 1a — scaffold the new repo
  - [x] package.json + tsconfig + next.config.mjs + tailwind.config.ts
  - [x] postcss + .gitignore + .npmrc + .env.local.example + next-env.d.ts
  - [x] next-intl wiring (routing.ts + navigation.ts + request.ts + middleware.ts)
  - [x] messages/fr.json — 100% content from welcome.blade.php (17 sections, 6 modals, 4 pricing tiers, 6 FAQ, 3 testimonials, contact form, footer)
  - [x] messages/en.json — full professional EN translation
  - [x] app/[locale]/layout.tsx with IBM Plex fonts, PostHog provider, theme bootstrap, metadata
  - [x] app/globals.css with KLASSCI design tokens (light + dark) and reusable utilities
  - [x] components/analytics/posthog-provider.tsx (canonical pattern, direct host)
  - [x] components/motion-config-provider.tsx (LazyMotion + domMax)
  - [x] lib/analytics/events.ts (typed catalog) + track.ts
- [x] Phase 1b — 3 critical sections + nav UI
  - [x] components/ui/logo.tsx, theme-toggle.tsx, language-switcher.tsx
  - [x] components/sections/nav.tsx (sticky, blur backdrop, mobile menu, theme + lang)
  - [x] components/sections/hero.tsx (gradient h1 + 9-screenshot CSS marquee, paused on hover, prefers-reduced-motion respected)
  - [x] components/sections/footer.tsx (bleu accent, 4 columns, social icons)
- [x] Phase 1c (partial — 8 of 14 sections shipped via parallel agents)
  - [x] components/sections/pillars.tsx — 3-col border-grid, RSC, eyebrow numbering
  - [x] components/sections/features-big.tsx — 6 alternating image/text rows + modal triggers
  - [x] components/sections/feature-modal.tsx — native `<dialog>` data-driven for 6 features
  - [x] components/sections/features-small.tsx — 3-col border-grid with subtle hover shine
  - [x] components/sections/testimonials.tsx — 3 cards, featured top-edge highlight, monogram avatar fallback for missing photos
  - [x] components/sections/pricing.tsx — 4-tier border-grid, popular badge, all CTAs → #contact
  - [x] components/sections/faq.tsx — native `<details>`/`<summary>` accordion with onToggle analytics
  - [x] components/sections/contact.tsx — full form, success/error states, /api/contact + native fallback
  - [x] components/sections/letter-cta.tsx — single-card centered CTA
  - [x] app/[locale]/page.tsx — wired all sections in DOM order (Hero → Pillars → FeaturesBig → FeaturesSmall → Testimonials → Pricing → Faq → Contact → LetterCta)

## Decisions resolved (2026-04-25 live audit of klassci.com)

| Question | Resolution | Source |
|----------|-----------|--------|
| Pricing CTAs (Stripe / Wave / contact?) | **All 4 tiers → `#contact`** | Live snapshot: every tier href is `https://klassci.com/#contact` |
| Avatars Ama Bamba / Tarek Mehdy | **Monogram blue fallback** (`AB` / `TM` on `bg-accent`). Dr. Soro Kouadio keeps `/img/avatars/soro-kouadio.png`. | Live snapshot confirmed Unsplash random URLs are still in use, so we drop the external dependency for the new build |
| `/docs`, `/api-reference`, `/changelog` | **Vercel rewrites → `docs.klassci.com/...`** | Live audit (chrome-devtools) revealed these are NOT orphan stubs — they are full polished documentation with sidebar (Mise en route / Par rôle / Par module), 15-20+ nested pages (`/docs/getting-started`, `/docs/superadmin/onboarding`, `/docs/secretaire/inscriptions`, etc.), and the same beige editorial style as the landing. They MUST be preserved at their current URLs. **Plan:** create a new CNAME `docs.klassci.com` on cpanel pointing to the existing Laravel host (`91.234.194.113`). Vercel `next.config.mjs` proxies `/docs/*`, `/api-reference/*`, `/changelog/*` to `docs.klassci.com/...` via rewrites (URLs stay clean from the visitor's perspective, SEO continuity preserved). The rewrites are already wired in `next.config.mjs` and read `LARAVEL_DOCS_HOST` env var. |
| PostHog key | **Marcel sets `NEXT_PUBLIC_POSTHOG_KEY` in Vercel project env vars** at deploy time. Local dev keeps `NEXT_PUBLIC_DISABLE_ANALYTICS=true`. | posthog-cli is not auth'd locally; the key only lives in the ADC Vercel project env (not committed). Same key (project 1508541) works for the new project. |

---

## Phase 1c — Remaining 6 visual sections (next session)

Insert these between the Hero and the Footer per the original `welcome.blade.php` order.
The aesthetic must keep matching **zed.dev tech-editorial** — monochrome serré, fine
borders, sub-200ms ease-out animations, IBM Plex Mono for tech labels, **no gradient
orbs / glassmorphism / blur effects**.

Sections to build:

1. **`client-marquee.tsx`** — 5 client cards (ESBTP Abidjan / Yamoussoukro / Institut Pascal / San Andrea / ITS) doubled for seamless loop. Same hover-pause as Hero marquee. Place between `Pillars` and `FeaturesBig` to anchor the section header "Adopté par des établissements...". Reuse the `marquee-fade` utility from `globals.css`.
2. **`partnership-banner.tsx`** — Single full-width image, `next/image` with priority off and `sizes="100vw"`. Place between `Testimonials` and the Video. Image: `/img/sections/partnership.png`.
3. **`video-testimonial.tsx`** — 2-col (text + 9:16 video). Lazy-load the `<video>` via Intersection Observer (don't ship the `<source>` until visible). Click toggles play/pause and unmutes on first play. Fire `video_play` analytics. Source: `/videos/testimonial.mp4`.
4. **`security.tsx`** — 2-col (image + text), `text-section-h2` heading "Sécurité et confiance totales". Image: `/img/sections/security.png`.
5. **`support.tsx`** — Reverse 2-col (text + image), heading "Support client disponible 24h/24". Image: `/img/sections/support.png`.
6. **`image-banner.tsx`** — Full-width hero image of students. Image: `/img/sections/students-banner.png`. Optional CTA overlay (anchor `#contact`).

After all sections exist, slot them into `app/[locale]/page.tsx` between the
already-wired sections so the page reflects the welcome.blade.php DOM order:

```
Nav → Hero → Pillars → ClientMarquee → FeaturesBig → FeaturesSmall →
Testimonials → PartnershipBanner → VideoTestimonial → Security → Support →
ImageBanner → Pricing → Faq → Contact → LetterCta → Footer
```

NOTE: live klassci.com places `Testimonials` directly after `ClientMarquee` (both inside
a `proof` section). That ordering is fine — the messages JSON has them under `socialProof`
together. Either keep the components separate (current approach) or merge into a single
`SocialProof.tsx` if a tighter visual chunk is preferred.

---

## Phase 2 — Static assets (image compression)

Source assets live in `C:/Users/yabla/Downloads/dev/KLASSCIv2/public/images/`.
Compress and copy them into `public/img/` of this repo. Use `sharp` for images and
`ffmpeg` for the video.

| Source | Destination | Target weight |
|--------|-------------|---------------|
| `images/landing/hero_section.png` | `public/img/dashboard/01-dashboard.png` | < 200 KB WebP/AVIF |
| `images/landing/page-étudiants.png` | `public/img/dashboard/02-students.png` | < 200 KB |
| `images/landing/nuvelle_inscription.png` | `public/img/dashboard/03-enrolment.png` | < 200 KB |
| `images/landing/resultats.png` | `public/img/dashboard/04-results.png` | < 200 KB |
| `images/landing/planning-général.png` | `public/img/dashboard/05-planning.png` | < 200 KB |
| `images/landing/gestion-presences.png` | `public/img/dashboard/06-attendance.png` | < 200 KB |
| `images/landing/parcours-lmd.png` | `public/img/dashboard/07-lmd.png` | < 200 KB |
| `images/landing/gestion-personnel.png` | `public/img/dashboard/08-staff.png` | < 200 KB |
| `images/landing/code-emargement.png` | `public/img/dashboard/09-signin-code.png` | < 200 KB |
| `images/landing/Saisie_des_notes_et_bulletins.png` | `public/img/dashboard/notes-bulletins.png` | < 250 KB |
| `images/landing/Suivi_financier_en_temps_réel.png` | `public/img/dashboard/finance.png` | < 250 KB |
| `images/landing/esbtp_logo.png` | `public/img/clients/esbtp.png` | < 30 KB |
| `images/landing/institut-pascal-logo.jpeg` | `public/img/clients/institut-pascal.jpg` | < 30 KB |
| `images/landing/san-andrea-school.jpeg` | `public/img/clients/san-andrea.jpg` | < 30 KB |
| `images/landing/its-logo.jpeg` | `public/img/clients/its.jpg` | < 30 KB |
| `images/Images landingPage/Sans titre - 2-02.png` | `public/img/sections/partnership.png` | < 400 KB |
| `images/Images landingPage/Sans titre - 2-03.png` | `public/img/sections/students-banner.png` | < 400 KB |
| `images/Images landingPage/Sans titre - 2-04.png` | `public/img/sections/security.png` | < 300 KB |
| `images/Images landingPage/bulles.png` | `public/img/sections/support.png` | < 200 KB |
| `images/Images landingPage/Sans titre - 2-11.png` | `public/img/avatars/soro-kouadio.png` | < 50 KB |
| `images/WhatsApp Video 2025-11-02 at 12.10.55 PM.mp4` | `public/videos/testimonial.mp4` | < 3 MB H.264 / 720p / muted by default |
| `images/LOGO-KLASSCI-PNG.png` | `public/img/logo-klassci.svg` | hand-redraw as SVG |

**For Ama Bamba & Tarek Mehdy avatars**: the Blade currently uses random Unsplash
photos. Replace with real headshots if Marcel can get them, otherwise use a neutral
KLASSCI-blue monogram (`AB` / `TM`) on `#0453cb` background.

**OG image** (`public/img/og/default.png`, 1200×630): hero screenshot with KLASSCI
wordmark + tagline, dark KLASSCI blue overlay.

---

## Phase 3 — API routes

### `app/api/contact/route.ts`

Proxy POST to Laravel `/contact-demo` (`process.env.CONTACT_DEMO_URL`). Forward the
form fields, return a uniform `{ ok: true }` or `{ ok: false, error: '...' }` shape.
Rate-limit to 5 req / 5 min / IP via Vercel KV (or simple in-memory bucket if KV
isn't provisioned yet).

---

## Phase 4 — KLASSCIv2 Laravel changes (separate PR)

### Files to delete

- `resources/views/welcome.blade.php` (2988 L) — landing moves to Vercel
- `resources/views/welcome-redesign.blade.php` (1407 L) — orphan since 2026-03
- `resources/views/welcome-software.blade.php` (4835 L) — never routed
- `resources/views/layouts/landing.blade.php` (178 L)
- Any `LandingController` / `WelcomeController` that exists
- `public/images/landing/*` and `public/images/Images landingPage/*` (~25 MB) — assets now live in the new repo

### `routes/web.php` changes

```diff
- Route::get('/', function () { return view('welcome')->withHeaders([...]); })->name('welcome');
- Route::get('/school', fn() => view('welcome-redesign'))->name('welcome.school');
+ // Apex root is now served by Vercel — keep route only for healthcheck if needed
+ Route::get('/', fn() => redirect()->away(env('LANDING_URL', 'https://klassci.com')))->name('welcome');
```

The redirect is a safety net only; once DNS is cut over, this Laravel route never fires
because the apex resolves to Vercel.

### `routes/api.php` — add tenant lookup

```php
Route::post('/tenant-lookup', [TenantLookupController::class, 'lookup'])
    ->middleware('throttle:30,1');
```

### `app/Http/Controllers/Api/TenantLookupController.php`

```php
public function lookup(Request $request)
{
    $request->validate(['identifier' => 'required|string|max:255']);
    $id = trim($request->input('identifier'));

    $isEmail = filter_var($id, FILTER_VALIDATE_EMAIL);

    $user = User::query()
        ->when($isEmail, fn($q) => $q->where('email', $id))
        ->when(!$isEmail, fn($q) => $q->where('username', $id))
        ->with('tenant:id,subdomain')
        ->first();

    // Always 200 — uniform response prevents enumeration
    return response()->json([
        'found' => (bool) ($user && $user->tenant),
        'subdomain' => $user?->tenant?->subdomain,
    ]);
}
```

### `auth/login.blade.php` — slim refresh

Per the critic's recommendation (B2B login convention): keep the two-panel layout,
just refresh the typography (already IBM Plex) and add a small header bar with the
tenant logo + name + a discreet `← klassci.com` link. Drop the animated stat
counters from the left panel (move them to the new landing if they belong somewhere).

Source for tenant info: existing `GET /api/tenant-info` endpoint, returns
`{ tenant_code, name, logo_url, timezone }`.

---

## Phase 5 — DNS cutover

### Pre-cutover (J-7)

- [ ] Email all 5 active tenants (ESBTP Abidjan, ESBTP Yamoussoukro, Institut Pascal, San Andrea, ITS): "Migrating klassci.com landing to a new platform — your `<tenant>.klassci.com` access stays the same."
- [ ] Lower TTL on the apex `A` record at cpanel to 60 s (24 h before)
- [ ] Confirm Vercel project deployed at `klassci.com` (preview URL works first)
- [ ] Test smoke: contact form submission round-trips Vercel → Laravel `/contact-demo`
- [ ] Submit new sitemap to Google Search Console (after Phase 1c is complete)

### Cutover (J-0, Sunday)

1. **PREREQUISITE — add `docs.klassci.com` CNAME on cpanel** *before* changing the apex A record. Point `docs.klassci.com.` `A 91.234.194.113` (or `CNAME klassci.com.` if cpanel allows). Verify with `nslookup docs.klassci.com` returns the Laravel IP. Test that `https://docs.klassci.com/docs/getting-started` serves the existing docs page identical to `https://klassci.com/docs/getting-started` today. SSL must be issued by cpanel for the new subdomain.
2. Add domain `klassci.com` + `www.klassci.com` in Vercel project. Set `LARAVEL_DOCS_HOST=https://docs.klassci.com` in Vercel env vars.
3. Smoke-test the Vercel preview deployment proxies properly: `https://klassci-landing.vercel.app/docs` should render the Laravel docs page (Vercel rewrites are active).
4. cpanel DNS Zone Editor:
   - Change `klassci.com.` `A` record from `91.234.194.113` to Vercel IP `216.198.79.1`
   - Add `www.klassci.com.` `CNAME cname.vercel-dns.com.`
   - **Do NOT touch** `*.klassci.com`, any tenant subdomain, or the new `docs.klassci.com.`
5. Wait for `nslookup klassci.com` to return Vercel IP (5–15 min)
6. Vercel auto-issues Let's Encrypt SSL (5–10 min)
7. Smoke test:
   - `https://klassci.com` → Vercel landing (FR)
   - `https://klassci.com/en` → Vercel landing (EN)
   - `https://klassci.com/docs/getting-started` → Laravel docs (proxied via rewrite)
   - `https://klassci.com/api-reference` → Laravel api ref (proxied)
   - `https://klassci.com/changelog` → Laravel changelog (proxied)
   - `https://docs.klassci.com/docs/getting-started` → same Laravel docs (direct)
   - `https://esbtp-yakro.klassci.com` → cpanel Laravel still up
   - `https://esbtp-yakro.klassci.com/login` → Laravel login refresh

### Post-cutover (J+1 to J+7)

- [ ] Monitor Vercel logs for unexpected 404s, patch redirects in `next.config.mjs`
- [ ] Check Google Search Console for crawl errors

---

## Risks to keep in mind

- **Email transactional links** (password reset etc.) hit `klassci.com/password/reset/<token>`. After cutover those URLs land on Vercel and break — build a thin `/password-reset-redirect?token=...` Vercel page that asks the user for their school identifier and redirects them to `<tenant>.klassci.com/password/reset/<token>`.
- **Vercel CDN cache** — Vercel chunk-splits aggressively. After every PostHog or analytics change, validate with `curl https://klassci.com/?cb=$(date +%s)` to bypass CDN cache.
- **Vercel Hobby + private repo = 409**. Confirm the GitHub repo is **public** before connecting Vercel, or use a Pro plan.
- **PostHog `_is_bot()` filter** — DevTools / Puppeteer / Playwright trigger `navigator.webdriver === true` and PostHog silently drops events. Real users are never affected. To verify events in automated tests, override `posthog._is_bot = () => false` in the page console.
- **next-intl twin-file vs JSON** — this repo uses messages JSON (cleaner for 150+ marketing strings). The ADC repo uses twin-file pattern; do not blindly copy patterns between the two.
- **framer-motion above the fold** — never wrap the hero in `motion.div` with `initial: { opacity: 0 }`. It tanks LCP. Static HTML hero, `LazyMotion` only for interactions below the fold.
- **CSS migration option C (hybride)** — the current scaffold goes Tailwind-first. The original Blade has 2070 lines of custom CSS; only port the patterns that Tailwind can't express (gradient text shimmer, marquee, theme bootstrap script). Don't paste the whole `<style>` block.
- **KLASSCI brand fidelity** — the only colours are `#0453cb` accent + `#f6f4f0` beige + monochrome neutrals + sparing semantic accents (`#10b981` success, `#f59e0b` warning, `#ef4444` danger). No purple, no orange, no rebrand.

---

## Quick verification commands

```bash
# After pnpm install, validate the scaffold compiles and types check
pnpm tsc --noEmit
pnpm lint
pnpm dev                         # http://localhost:3000

# After implementing sections, test FR + EN
curl -s http://localhost:3000 | grep "Gestion scolaire"
curl -s http://localhost:3000/en | grep "School management"

# Cache-busting check after any Vercel deploy
curl -sI "https://klassci.com/?cb=$(date +%s)" | head -20
```
