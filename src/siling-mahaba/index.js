// @ulam/siling-mahaba — Remix adapter for sili focus management
// Wraps siling-labuyo hooks/components with Remix's router and data primitives.
// Replaces siling-labuyo when migrating a11yhelper to Remix.

// All sili React hooks are re-exported unchanged — they don't touch routing
export { useFocusTrap } from '../siling-labuyo/hooks/useFocusTrap.js'
export { useAriaHide } from '../siling-labuyo/hooks/useAriaHide.js'
export { useReturnFocus } from '../siling-labuyo/hooks/useReturnFocus.js'
export { useEscapeKey } from '../siling-labuyo/hooks/useEscapeKey.js'
export { useFocusOnMount } from '../siling-labuyo/hooks/useFocusOnMount.js'
export { useFocusOnChange } from '../siling-labuyo/hooks/useFocusOnChange.js'
export { usePaginationFocus } from '../siling-labuyo/hooks/usePaginationFocus.js'
export { useDir } from '../siling-labuyo/hooks/useDir.js'
export { useMediaQuery } from '../siling-labuyo/hooks/useMediaQuery.js'

// React component shells — unchanged, they don't use the router
export { default as Modal } from '../siling-labuyo/components/Modal.jsx'
export { default as Drawer } from '../siling-labuyo/components/Drawer.jsx'
export { default as BottomSheet } from '../siling-labuyo/components/BottomSheet.jsx'

// Router — stubs to be replaced with Remix equivalents
// TODO: replace with Remix useNavigate, useLocation, Link, NavLink, useMatches
export { useRouter, useRouteMatch } from './router/useRouter.js'
export { usePageTitle } from './router/usePageTitle.js'
