/**
 * Vanilla route focus manager — no React dependency.
 *
 * Moves focus to the page's main heading (h1) after each client-side
 * navigation, per user testing that found heading focus outperforms skip
 * links and container focus for orienting screen reader users after a
 * route change (Gatsby accessible routing research, 2019).
 *
 * Works with any router. Pairs with taho-pandan/routeAnnouncer.js:
 * routeAnnouncer announces the new route, routeFocus moves keyboard
 * position to the new content. Both together are needed for full coverage.
 *
 * Usage — automatic (browser Navigation API / popstate):
 *   import { mountRouteFocus } from '@ulam/siling-mahaba/routeFocus'
 *   const unmount = mountRouteFocus()
 *
 * Usage — manual (custom router callback):
 *   import { focusPageHeading } from '@ulam/siling-mahaba/routeFocus'
 *   router.on('navigate', () => focusPageHeading())
 *
 * The h1 must exist in the DOM before focusPageHeading() is called.
 * If your framework renders the new route asynchronously, call it after
 * the render settles (e.g. in a MutationObserver or router afterEach hook).
 */

const HEADING_SELECTOR = 'h1, [role="heading"][aria-level="1"]'

export function focusPageHeading() {
  if (typeof document === 'undefined') return

  // requestAnimationFrame lets the framework finish rendering the new route
  // before we attempt to find and focus the heading.
  requestAnimationFrame(() => {
    const heading = document.querySelector(HEADING_SELECTOR)
    if (!heading) return

    // Make the heading programmatically focusable if it is not already.
    // tabIndex=-1 allows .focus() without adding it to the tab order.
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1')
      // Remove tabindex after blur so it does not persist in the tab order.
      heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true })
    }

    heading.focus({ preventScroll: false })
  })
}

let _prevPathname = typeof location !== 'undefined' ? location.pathname : ''

function _onNavigate(pathname) {
  if (pathname === _prevPathname) return
  _prevPathname = pathname
  focusPageHeading()
}

export function mountRouteFocus() {
  if (typeof window === 'undefined') return () => {}

  const cleanups = []

  if ('navigation' in window) {
    const onSuccess = () => _onNavigate(location.pathname)
    window.navigation.addEventListener('navigatesuccess', onSuccess)
    cleanups.push(() => window.navigation.removeEventListener('navigatesuccess', onSuccess))
  } else {
    const onPopState = () => _onNavigate(location.pathname)
    const onHashChange = () => _onNavigate(location.hash || '/')
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    cleanups.push(() => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    })
  }

  return () => cleanups.forEach(fn => fn())
}
