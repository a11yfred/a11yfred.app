# ulam → Vanilla / Remix 3 Migration Plan

Remix 3 drops React as a hard dependency. This document is the plan for making
ulam framework-agnostic so a11yhelper can migrate to Remix 3 without rewriting
the framework from scratch.

Two separate efforts — do them in order:

1. **Framework migration** — make ulam packages vanilla-first
2. **App migration** — migrate a11yhelper itself to Remix 3 on top of the new framework

---

## Current state

### Already vanilla (no changes needed)

| Package | Status |
|---------|--------|
| `@ulam/sili` | Pure vanilla JS — focus primitives |
| `@ulam/taho` | Pure vanilla JS — live region core |
| `@ulam/palaman` | Pure vanilla JS — linting, dev-only |

### Remix adapters already built (but re-export React components)

| Package | What's done | What's missing |
|---------|-------------|----------------|
| `@ulam/siling-mahaba` | `useRouter`, `useRouteMatch`, `usePageTitle` shim | Re-exports React `Modal`, `Drawer`, `BottomSheet` from siling-labuyo — need vanilla replacements |
| `@ulam/taho-pandan` | `useRouteAnnouncer` | Complete — no changes needed |

### React-dependent (needs migration)

| Package | React surface | Effort |
|---------|--------------|--------|
| `@ulam/calamansi` | `I18nProvider` context, `useT`, `usePref` hooks | Small |
| `@ulam/adobo` | 8 debug components | Medium — already architected for this |
| `@ulam/ube` | 22 UI components | Large |
| `@ulam/siling-labuyo` | hooks + `Modal`, `Drawer`, `BottomSheet` components | Medium (hooks stay, components move to vanilla) |
| `@ulam/taho-bayabas` | `Announcer`, `useAnnounce` | Small |
| `@ulam/halohalo` | `useCompletion`, `useProviderConfig` hooks | Small |
| `@ulam/sawsawan` | `useSawsawan` hook | Trivial |

---

## Part 1 — Framework migration (ulam packages)

### Phase 1 — calamansi (unblocks everything else)

**Goal:** Replace React context with a vanilla module-level singleton.

**Why first:** `t()` already works as a plain function. The context wrapper is
the only React part. Once calamansi is vanilla, sawsawan and ube can follow
without a React dependency.

**Changes:**
- Replace `I18nProvider` / `useT` context pattern with a module-level `setLocale(locale, messages)` / `getT()` API
- `t(key, vars)` stays identical — callers don't change
- `usePref` becomes a plain `getPref(key, default)` / `setPref(key, value)` API backed by sawsawan storage adapter
- Keep a thin `@ulam/calamansi/react` subpath that re-exports React hooks as a compatibility shim for any React consumers during transition

**Files to change:**
- `src/calamansi/index.jsx` → `index.js` (remove React, export module API)
- `src/calamansi/usePref.js` → `pref.js` (plain get/set, no hook)
- Add `src/calamansi/react.js` (shim: `useT`, `usePref` as React hooks wrapping the new module API)

---

### Phase 2 — adobo (already architected for this)

**Goal:** Extract DOM inspection logic to vanilla core; make React an optional mount wrapper.

**Why next:** The adobo README already documents this split. The DOM inspection
logic never needed React — `getBoundingClientRect`, `focusin` listeners,
`querySelectorAll` are all plain browser APIs. React is just the mount/unmount
lifecycle.

**Target architecture:**
```text
@ulam/adobo
├── core/        vanilla JS — focus detection, name computation, heading scan, tab order
├── overlay/     vanilla JS + HTML/CSS — self-contained panel UI, no framework
└── react/       thin React wrapper — calls core.init() / core.destroy() in useEffect
```

**Changes per component:**

| Component | Core logic (→ vanilla) | React wrapper (thin) |
|-----------|----------------------|---------------------|
| `FocusDebugger` | `focusin` listener, toast DOM creation | `useEffect` calls `init`/`destroy` |
| `NamesDebugger` | `mousemove` listener, name computation | `useEffect` calls `init`/`destroy` |
| `TabStopsDebugger` | `focusin` listener, SVG line drawing | `useEffect` calls `init`/`destroy` |
| `HeadingMapDebugger` | `querySelectorAll`, `ResizeObserver` | `useEffect` calls `init`/`destroy` |
| `DebugLauncher` | Command parsing, menu/input DOM | `useEffect` mount, prop → attribute bridge |
| `DeployBanner` | Static DOM element | Trivial wrapper |
| `DebugHelp` | Static DOM panel | Trivial wrapper |

**Ships as:**
- Script tag drop-in: `<script src="adobo.js">` — calls `adobo.init({ commands: [...] })`
- npm: `import { initAdobo } from '@ulam/adobo'`
- React optional: `import { FocusDebugger } from '@ulam/adobo/react'`

---

### Phase 3 — ube components (largest effort)

**Goal:** Rewrite 22 React components as vanilla Web Components or plain JS +
HTML template functions. CSS stays entirely unchanged.

**Approach — plain JS render functions, not Web Components:**
Web Components have good browser support but add boilerplate and shadow DOM
friction. The simpler path is plain JS functions that return DOM nodes, matching
the existing CSS class names exactly. Framework adapters (React, Remix) wrap
these in thin components.

**Architecture:**
```text
@ulam/ube
├── core/         plain JS render functions — Button(), Toggle(), SearchInput(), etc.
├── css/          existing CSS, unchanged
├── react/        thin React wrappers (forwardRef → core function)
└── remix/        Remix component exports (server-renderable HTML + progressive enhancement)
```

**Component migration groups:**

**Group A — stateless, trivial (1–2 hours each):**
`Badge`, `InfoBox`, `BackButton`, `NoResults`, `ButtonLink`, `SourceLinks`, `LinkTitle`, `ResultListSkeleton`

**Group B — simple state (half day each):**
`Button`, `IconButton`, `Toggle`, `RadioChip`, `Radio`, `Select`

**Group C — refs + event wiring (full day each):**
`SearchInput`, `InputWithClear`, `Field`, `Panel`, `PanelShell`

**Group D — complex / portal-dependent (1–2 days each):**
`Modal`, `Drawer`, `BottomSheet`, `DataError`

**Theme:**
- `useThemeManager` → plain `setTheme(theme)` function that writes `data-theme` to `<html>`
- Remix: set via loader data, no client hook needed

---

### Phase 4 — siling-labuyo overlay components

**Goal:** `Modal`, `Drawer`, `BottomSheet` move to vanilla JS using sili
primitives. React versions become thin wrappers around the vanilla implementation.

**Changes:**
- `Modal` → vanilla: `sili.focusTrap` + `sili.ariaHide` + `sili.escapeKey` + DOM template
- `Drawer` → same
- `BottomSheet` → same
- `siling-labuyo/components/` becomes thin React wrappers calling the vanilla implementations
- `siling-mahaba` stops re-exporting from siling-labuyo — imports from vanilla core instead

**Hooks stay React** — `useEscapeKey`, `useFocusTrap`, etc. are already thin
`useEffect` wrappers around sili. They stay in `siling-labuyo` for React
consumers. Remix consumers use sili directly or via Remix's server lifecycle.

---

### Phase 5 — taho-bayabas, halohalo, sawsawan (cleanup)

**taho-bayabas:**
- `Announcer` component → vanilla: plain DOM element created by `taho` core
- `useAnnounce` → keep as React hook; add `@ulam/taho-bayabas/react` subpath
- `announce()` is already callable from anywhere — no change

**halohalo:**
- `useCompletion` → plain async `streamCompletion(options)` function
- `useProviderConfig` → plain `getProviderConfig()` / `setProviderConfig()` module API
- Add `@ulam/halohalo/react` shim for React consumers during transition
- Remix: wire to `loader` / `action` patterns for server-side AI calls

**sawsawan:**
- `useSawsawan` → plain `initSawsawan(locale, t, announceKey)` function
- One `useEffect` becomes a module-level side effect called once at app init

---

## Part 2 — App migration (a11yhelper → Remix 3)

Do this after Part 1 is complete. The app migration is straightforward once the
framework packages are vanilla.

### Phase 0 — Prerequisites (done)
- `siling-mahaba` router hooks implemented ✓
- `taho-pandan` route announcer implemented ✓
- Remix 3 released and stable

### Phase 1 — Install and configure Remix 3
- Replace Vite SPA config with Remix 3 Vite plugin
- Set up `app/root.tsx` with `<Links>`, `<Meta>`, `<Scripts>`, `<Outlet>`
- Add `useRouteAnnouncer` from `@ulam/taho-pandan` to root layout
- Wire `handle.appName` on root route for `useRouter` in siling-mahaba

### Phase 2 — Route file structure
Current hash routes → Remix file-based routes:

| Current hash route | Remix route file |
|-------------------|-----------------|
| `#/` | `app/routes/_index.tsx` |
| `#/results/all` | `app/routes/results.all.tsx` |
| `#/finding/:id/:slug` | `app/routes/finding.$id.$slug.tsx` |
| `#/settings` | `app/routes/settings.tsx` |
| `#/admin` | `app/routes/admin.tsx` |
| `#/onboarding` | `app/routes/onboarding.tsx` |

### Phase 3 — Loaders replace client-side data fetching
- Corpus JSON → `loader` functions (served at build time or edge)
- Search/filter state → URL search params + `loader`
- Remove `useFindingSearch` hook — replace with `useLoaderData`

### Phase 4 — Component migration
- Replace all `import { X } from '@ulam/siling-labuyo'` with `@ulam/siling-mahaba`
- Replace `I18nProvider` / `useT` with vanilla calamansi API
- Replace `usePageTitle` calls with `meta` exports per route
- Replace `useThemeManager` with loader-driven `data-theme` on `<html>`

### Phase 5 — adobo in Remix
- Replace React adobo component tree with `adobo.init()` call in root layout effect
- Or: keep React wrappers via `@ulam/adobo/react` subpath — no urgency to change

---

## What does NOT change

- All CSS — zero changes to any `.css` file
- `@ulam/sili` and `@ulam/taho` — already vanilla
- `@ulam/palaman` — linting, unaffected
- The `@ulam/*/react` subpath shims — React consumers keep working throughout
- Token names, component names, command names — all stable public API

---

## Sequencing summary

```
Part 1 (framework — do in order):
  1. calamansi   — 1–2 days   — unblocks everything
  2. adobo       — 3–4 days   — self-contained, already designed for this
  3. ube Group A — 1 day      — stateless components
  4. ube Group B — 2–3 days   — simple state
  5. ube Group C — 3–4 days   — refs + event wiring
  6. siling-labuyo overlays — 2–3 days — Modal, Drawer, BottomSheet
  7. ube Group D — 2–3 days   — portals (can use vanilla overlay work from step 6)
  8. taho-bayabas, halohalo, sawsawan — 1–2 days — cleanup

Part 2 (app — after Part 1):
  0. Wait for Remix 3 stable
  1. Install + configure Remix 3     — 1 day
  2. Route file structure            — 1–2 days
  3. Loaders replace data fetching   — 3–5 days (largest app change)
  4. Component migration             — 2–3 days
  5. adobo in Remix                  — half day
```

Total framework migration estimate: **~3 weeks** (can be done incrementally —
each phase ships independently behind the existing `@ulam/*/react` shims).

Total app migration estimate: **~2 weeks** after framework is done and Remix 3
is stable.
