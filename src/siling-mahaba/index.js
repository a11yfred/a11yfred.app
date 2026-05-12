// @ulam/siling-mahaba — Remix adapter for @ulam/sili focus management
// Drop-in replacement for siling-labuyo when migrating to Remix.
// Import from this package instead of siling-labuyo in Remix route modules.

// All sili React hooks are re-exported unchanged — they are router-agnostic
export { useFocusTrap }       from '../siling-labuyo/hooks/useFocusTrap.js'
export { useAriaHide }        from '../siling-labuyo/hooks/useAriaHide.js'
export { useReturnFocus }     from '../siling-labuyo/hooks/useReturnFocus.js'
export { useEscapeKey }       from '../siling-labuyo/hooks/useEscapeKey.js'
export { useFocusOnMount }    from '../siling-labuyo/hooks/useFocusOnMount.js'
export { useFocusOnChange }   from '../siling-labuyo/hooks/useFocusOnChange.js'
export { usePaginationFocus } from '../siling-labuyo/hooks/usePaginationFocus.js'
export { useDir }             from '../siling-labuyo/hooks/useDir.js'
export { useMediaQuery }      from '../siling-labuyo/hooks/useMediaQuery.js'

// Overlay components are router-agnostic — re-exported unchanged
export { default as Modal }       from '../siling-labuyo/components/ModalReact.jsx'
export { default as Drawer }      from '../siling-labuyo/components/DrawerReact.jsx'
export { default as Sheet }       from '../siling-labuyo/components/SheetReact.jsx'

// Remix-backed router hooks — replace siling-labuyo's hash-router equivalents
export { useRouter, useRouteMatch } from './router/useRouter.js'

// No-op shim — migrate call sites to Remix meta exports, then delete
export { usePageTitle } from './router/usePageTitle.js'

// Vanilla adapter (no framework dependency)
export { mountRouteFocus, focusPageHeading } from './routeFocus.js'
