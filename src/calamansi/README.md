# @ulam/calamansi

Data-agnostic i18n, hooks, and logic utilities. The sour layer of the [ulam](../../docs/ulam.md) framework.

Named for the iconic Filipino sour citrus. Small, essential, full of character.

## Packages

Calamansi is one of four ulam packages:

```text
ulam
├── @ulam/ube          sweet   — UI, components, CSS, theming, router, announce
├── @ulam/calamansi    sour    — i18n, hooks, utilities, logic  ← you are here
├── @a11yfred/rogers               : a11y debug panel, vanilla-first
└── @ulam/sawsawan     bridge  — wires the three together
```

## i18n

The `t()` function accepts any plain JS object as locale data. No opinions about loaders, caches, or source format. Just lookup and interpolation.

```jsx
import { I18nProvider, useT } from './calamansi'

// Wrap your app
<I18nProvider locale="en">
  <App />
</I18nProvider>

// In components
function MyComponent() {
  const t = useT()
  return <p>{t('hello', { name: 'Mikey' })}</p>
}
```

### Supported features

- **Interpolation** — `t('hello', { name: 'Mikey' })` → `"Hello, Mikey"`
- **Fallback** — missing keys fall back to `en`, never show a raw key
- **59 locale files** — production demonstration included

### Design principles

- **Data-agnostic** — pass any `{ key: value }` object; JSON files, API responses, CMS payloads all work
- **Thin** — just lookup and interpolation; number/date formatting defers to native `Intl` APIs
- **Independently usable** — no dependency on ube; any JS project can use calamansi i18n

## Independence

Calamansi has no dependency on ube. Dependency flows one direction only:

```text
calamansi ──► sawsawan (only cross-importer)
```

Neither ube nor rogers import from calamansi.

## Future: Fork to @ulam/calamansi

This code lives in a11yfred until closer to the webapp launch. Planned subpath exports at fork time:

```text
@ulam/calamansi          — everything
@ulam/calamansi/i18n     — just t(), locale loader, RTL detection
@ulam/calamansi/react    — I18nProvider, useT()
@ulam/calamansi/hooks    — React hooks
@ulam/calamansi/utils    — utilities
```

## License

MIT
