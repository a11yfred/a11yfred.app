# ulam → Vanilla / Remix 3 Migration Plan

Remix 3 drops React as a hard dependency. This document is the plan for making
ulam framework-agnostic so a11yfred can migrate to Remix 3 without rewriting
the framework from scratch.

Two separate efforts: do them in order:

1. **Framework migration**: make ulam packages vanilla-first
2. **App migration**: migrate a11yfred itself to Remix 3 on top of the new framework

---

## Current state

### Already vanilla (no changes needed)

| Package | Status |
| --------- | -------- |
| `@ulam/sili` | Pure vanilla JS: focus primitives |
| `@ulam/taho` | Pure vanilla JS: live region core |
| `@a11yfred/neighbor` | Pure vanilla JS: linting, dev-only |

### Remix adapters

| Package | Status |
| --- | --- |
| `@ulam/siling-mahaba` | Complete: re-exports `Modal`, `Drawer`, `Sheet` from siling-labuyo React wrappers |
| `@ulam/taho-pandan` | Complete: no changes needed |

### React-dependent (needs migration)

| Package | React surface | Status |
| --------- | -------------- | -------- |
| `@ulam/calamansi` | `I18nProvider` context, `useT`, `usePref` hooks | ✅ DONE |
| `@a11yfred/rogers` | 8 debug components | ✅ DONE |
| `@ulam/ube` | UI components | ✅ DONE (Groups A–D) |
| `@ulam/siling-labuyo` | hooks + `Modal`, `Drawer`, `Sheet` components | ✅ DONE |
| `@ulam/taho-bayabas` | `Announcer`, `useAnnounce` | In progress |
| `@ulam/halohalo` | `useCompletion`, `useProviderConfig` hooks | In progress |
| `@ulam/sawsawan` | `useSawsawan` hook | In progress |

---

## Part 1: Framework migration (ulam packages)

### Phase 1: calamansi ✅ DONE

**Shipped:** `f5a289b`

- `src/calamansi/index.js`: vanilla core: `setLocale()`, `getT()`, `_subscribe()`, `getPref()`, `setPref()`
- `src/calamansi/pref.js`: plain `getPref` / `setPref` backed by localStorage
- `src/calamansi/react.js`: React shim: `I18nProvider`, `useT`, `usePref` wrapping the vanilla API
- All app React consumers updated to import from `calamansi/react.js`
- Vanilla consumers (services, hooks) import from `calamansi/index.js` directly

---

### Phase 2: rogers ✅ DONE

**Shipped:** `d49d80a`

Three-layer architecture:

```text
@a11yfred/rogers
├── core/        vanilla JS: createFocusWatcher, createNamesWatcher, createHeadingWatcher, createTabStopWatcher
├── overlay/     vanilla JS DOM mounting: mountFocusDebugger, mountNamesDebugger, mountHeadingMapDebugger,
│                mountTabStopsDebugger, mountDebugLauncher, mountDebugHelp, mountDeployBanner
└── react.js     thin React shims: FocusDebugger, NamesDebugger, TabStopsDebugger, HeadingMapDebugger,
                 DebugLauncher, DebugHelp, DeployBanner (all via useOverlay helper)
```

- `index.js` exports vanilla only (`core/`, `overlay/`)
- `react.js` exports React components: `import { FocusDebugger } from '@a11yfred/rogers/react'`
- React marked as optional peer dep

---

### Phase 3: ube components ✅ DONE

**Shipped:** `caf371e` (Groups A–D) + related commits

Component naming conventions established:

- `Panel` / `PanelReact`: primitive shell vs sili-wired React version
- `ButtonIcon`, `InputSearch`, `InputWithClear`: noun-modifier naming
- `LinkSkipTo`, `BackButton`, `ButtonLink`: directional naming

Lucide removed from all ube primitives: icons are inline SVGs with prop injection
fallbacks (`retryIcon`, `closeIcon`, `backLtrIcon`, `backRtlIcon`, `collapseIcon`).

App-specific components extracted to `src/components/` with `A11y` prefix:

- `A11yPanelAbout`, `A11yPanelHelp`, `A11yPanelSettings`, `A11yPanelAdmin`
- `A11yListResult`, `A11yListResultSkeleton`, `A11yListRelated`, `A11yLinksSource`
- `A11yLinkSc`, `A11yLinkTitle`, `A11yTextareaCopyable`, `A11yInputSearchHero`
- `A11yToastAiDebug`

Other app components renamed to noun-modifier convention:

- `SheetDetail`, `CarouselOnboarding`, `TileAd`, `EffectConfetti`, `EffectFiestaSparkles`,

  `WidgetFiestaMusicPlayer`, `WidgetKofi`, `ThemeFiestaMode.css`

Subpath exports:

```json
{ "exports": { ".": "./index.js", "./react": "./react.js" } }
```

---

### Phase 4: siling-labuyo overlay components ✅ DONE

**Shipped:** `cd9bb81`

Each overlay now has a primitive/React split:

| Primitive (no sili deps) | React wrapper (sili-wired) | Exported as |
| --- | --- | --- |
| `Modal.jsx` | `ModalReact.jsx` | `Modal` |
| `Drawer.jsx` | `DrawerReact.jsx` | `Drawer` |
| `Sheet.jsx` | `SheetReact.jsx` | `Sheet` |

- `BottomSheet` renamed to `Sheet` throughout
- Primitives exported as `ModalPrimitive`, `DrawerPrimitive`, `SheetPrimitive` from index
- React wrappers exported as `Modal`, `Drawer`, `Sheet`: same names, `/react` subpath is the signal
- `siling-mahaba` updated to re-export `Sheet` instead of `BottomSheet`

---

### Phase 5: taho-bayabas, halohalo, sawsawan

**taho-bayabas:**

- `Announcer` component → vanilla: plain DOM element created by `taho` core
- `useAnnounce` → keep as React hook; add `@ulam/taho-bayabas/react` subpath
- `announce()` is already callable from anywhere: no change

**halohalo:**

- `useCompletion` → plain async `streamCompletion(options)` function
- `useProviderConfig` → plain `getProviderConfig()` / `setProviderConfig()` module API
- Add `@ulam/halohalo/react` shim for React consumers during transition

**sawsawan:**

- `useSawsawan` → plain `initSawsawan(locale, t, announceKey)` function
- One `useEffect` becomes a module-level side effect called once at app init

---

## Part 2: App migration (a11yfred → Remix 3)

Do this after Part 1 is complete and Remix 3 is stable.

### Phase 0: Prerequisites

- `siling-mahaba` router hooks implemented ✓
- `taho-pandan` route announcer implemented ✓
- Remix 3 released and stable: **waiting**

### Phase 1: Install and configure Remix 3

- Replace Vite SPA config with Remix 3 Vite plugin
- Set up `app/root.tsx` with `<Links>`, `<Meta>`, `<Scripts>`, `<Outlet>`
- Add `useRouteAnnouncer` from `@ulam/taho-pandan` to root layout
- Wire `handle.appName` on root route for `useRouter` in siling-mahaba

### Phase 2: Route file structure

Current hash routes → Remix file-based routes:

| Current hash route | Remix route file |
| ------------------- | ----------------- |
| `#/` | `app/routes/_index.tsx` |
| `#/results/all` | `app/routes/results.all.tsx` |
| `#/finding/:id/:slug` | `app/routes/finding.$id.$slug.tsx` |
| `#/settings` | `app/routes/settings.tsx` |
| `#/admin` | `app/routes/admin.tsx` |
| `#/onboarding` | `app/routes/onboarding.tsx` |

### Phase 3: Loaders replace client-side data fetching

- Corpus JSON → `loader` functions (served at build time or edge)
- Search/filter state → URL search params + `loader`
- Remove `useFindingSearch` hook: replace with `useLoaderData`

### Phase 4: Component migration

- Replace all `import { X } from '@ulam/siling-labuyo'` with `@ulam/siling-mahaba`
- Replace `I18nProvider` / `useT` with vanilla calamansi API
- Replace `usePageTitle` calls with `meta` exports per route
- Replace `useThemeManager` with loader-driven `data-theme` on `<html>`

### Phase 5: rogers in Remix

- Replace React rogers component tree with `rogers.init()` call in root layout effect
- Or: keep React wrappers via `@a11yfred/rogers/react` subpath: no urgency to change

---

## What does NOT change

- All CSS: zero changes to any `.css` file
- `@ulam/sili` and `@ulam/taho`: already vanilla
- `@a11yfred/neighbor`: linting, unaffected
- The `@ulam/*/react` subpath shims: React consumers keep working throughout
- Token names, component names, command names: all stable public API

---

## Sequencing summary

```text
Part 1 (framework):

  1. calamansi              ✅ DONE: f5a289b
  2. rogers                  ✅ DONE: d49d80a
  3. ube Groups A–D         ✅ DONE: caf371e + naming commits
  4. siling-labuyo overlays ✅ DONE: cd9bb81
  5. taho-bayabas, halohalo, sawsawan: in progress

Part 2 (app: after Part 1 + Remix 3 stable):

  0. Wait for Remix 3 stable
  1. Install + configure Remix 3    : 1 day
  2. Route file structure           : 1–2 days
  3. Loaders replace data fetching  : 3–5 days (largest app change)
  4. Component migration            : 2–3 days
  5. rogers in Remix                 : half day

```
