import { announce } from '../taho/announce.js'

/**
 * Vanilla route announcer — no React dependency.
 *
 * Listens for navigation events and announces the new route to screen readers
 * via taho's live region. Works with any router that fires either:
 *   - The browser Navigation API (navigate event) — modern browsers
 *   - hashchange / popstate — legacy SPA routers
 *
 * Usage:
 *   import { mountRouteAnnouncer } from '@ulam/taho-pandan/routeAnnouncer'
 *
 *   const unmount = mountRouteAnnouncer()
 *   // or with a custom label resolver:
 *   const unmount = mountRouteAnnouncer(() => document.title)
 *
 *   // call unmount() to remove all listeners (e.g. during SSR teardown)
 *
 * For framework routers that don't fire browser navigation events (e.g. a
 * custom Remix 3 router), use notifyRouteChange() directly:
 *   import { notifyRouteChange } from '@ulam/taho-pandan/routeAnnouncer'
 *   router.on('navigate', ({ pathname }) => notifyRouteChange(pathname))
 *
 * @param {() => string} [getLabel]
 *   Returns the announcement text. Called after navigation settles.
 *   Defaults to document.title. In practice wire to the new page heading:
 *     mountRouteAnnouncer(() => document.querySelector('h1')?.textContent ?? document.title)
 */

let _prevPathname = typeof location !== 'undefined' ? location.pathname : ''

export function notifyRouteChange(pathname, getLabel) {
  if (pathname === _prevPathname) return
  _prevPathname = pathname
  const label = getLabel ? getLabel(pathname) : document.title
  if (label) announce(label, { priority: 'polite' })
}

export function mountRouteAnnouncer(getLabel) {
  if (typeof window === 'undefined') return () => {}

  const cleanups = []

  // Navigation API — fires for all navigations including push-state
  if ('navigation' in window) {
    const onNavigate = (e) => {
      // navigateSuccess fires after the navigation commits
      e.intercept?.({
        handler: async () => {
          const url = new URL(e.destination.url)
          notifyRouteChange(url.pathname, getLabel)
        },
      })
    }

    // navigatesuccess fires after a navigation completes without interception
    const onSuccess = () => {
      notifyRouteChange(location.pathname, getLabel)
    }

    window.navigation.addEventListener('navigate', onNavigate)
    window.navigation.addEventListener('navigatesuccess', onSuccess)
    cleanups.push(() => {
      window.navigation.removeEventListener('navigate', onNavigate)
      window.navigation.removeEventListener('navigatesuccess', onSuccess)
    })
  } else {
    // Fallback: popstate (back/forward) + hashchange (hash routers)
    const onPopState = () => notifyRouteChange(location.pathname, getLabel)
    const onHashChange = () => notifyRouteChange(location.hash || '/', getLabel)

    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    cleanups.push(() => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    })
  }

  return () => cleanups.forEach(fn => fn())
}
