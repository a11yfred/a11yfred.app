# @ulam/sawsawan

Integration bridge wiring ube, calamansi, and rogers together. The dipping sauce of the [ulam](../../docs/ulam.md) framework.

Named for sawsawan, the Filipino dipping sauce: no purpose alone, exists only to bring other things together.

## Packages

Sawsawan is one of four ulam packages:

```text
ulam
├── @ulam/ube          sweet  : UI, components, CSS, theming, router, announce
├── @ulam/calamansi    sour   : i18n, hooks, utilities, logic
├── @a11yfred/rogers               : a11y debug panel, vanilla-first
└── @ulam/sawsawan     bridge : wires the three together  ← you are here
```

## Dependency rule

Sawsawan is the only package that imports from the other three. None of them import from sawsawan or from each other.

```text
ube ──────────┐
calamansi ────┤──► sawsawan
rogers ────────┘
```

## Responsibilities

- Set `html[lang]` when locale switches
- Set `html[dir]` for RTL locales
- Wire `t()` output into `announce()` on locale change
- Connect rogers debug notifications through ube's announce channel

## Usage

```jsx
import { useSawsawan } from './sawsawan'
import { useT } from './calamansi'

function App() {
  const [locale, setLocale] = useState('en')
  const t = useT()

  useSawsawan(locale, t, 'locale.switched')

  return <AppShell />
}
```

## Why ube and calamansi do not depend on each other

`announce()` accepts any string: no knowledge of where it came from. `t()` returns any string: no knowledge of where it goes. The app or sawsawan wires them: `announce(t('locale.switched'))`. Neither package knows the other exists. Integration is function composition at the call site, owned by sawsawan.

## License

MIT
