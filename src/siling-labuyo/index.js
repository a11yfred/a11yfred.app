// @ulam/siling-labuyo — React adapter for sili focus management
// Re-exports all hooks and component shells for React / React Router apps.
// For Remix, use @ulam/siling-mahaba instead.

// Vanilla core (re-exported for convenience)
export { returnFocus } from '../sili/core/returnFocus.js'
export { onEscapeKey } from '../sili/core/escapeKey.js'
export { trapFocus, getFocusable } from '../sili/core/focusTrap.js'
export { hideBackground } from '../sili/core/ariaHide.js'
export { lockScroll } from '../sili/core/scrollLock.js'

// React hooks
export { useFocusTrap } from './hooks/useFocusTrap.js'
export { useAriaHide } from './hooks/useAriaHide.js'
export { useReturnFocus } from './hooks/useReturnFocus.js'
export { useEscapeKey } from './hooks/useEscapeKey.js'
export { useFocusOnMount } from './hooks/useFocusOnMount.js'
export { useFocusOnChange } from './hooks/useFocusOnChange.js'
export { usePaginationFocus } from './hooks/usePaginationFocus.js'
export { useDir } from './hooks/useDir.js'
export { useMediaQuery } from './hooks/useMediaQuery.js'
export { usePageTitle } from './hooks/usePageTitle.js'

// React components (fully wired with sili hooks)
export { default as Modal } from './components/ModalReact.jsx'
export { default as Drawer } from './components/DrawerReact.jsx'
export { default as Sheet } from './components/SheetReact.jsx'

// Primitive shells (structure only, no sili hooks) — for framework-agnostic use
export { default as ModalPrimitive } from './components/Modal.jsx'
export { default as DrawerPrimitive } from './components/Drawer.jsx'
export { default as SheetPrimitive } from './components/Sheet.jsx'

// Hash router — SPA only, remove when migrating to Remix 3 (see REMIX-MIGRATION.md Part 2 Phase 2)
export { Router, useRouter, useRouteMatch, matchRoute } from './hashRouter/Router.jsx'
export { default as Route } from './hashRouter/Route.jsx'
export { default as Link } from './hashRouter/Link.jsx'
