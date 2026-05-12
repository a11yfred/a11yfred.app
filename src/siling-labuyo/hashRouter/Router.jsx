// HASH ROUTER — SPA only. Remove when migrating to Remix 3.
// Replace with Remix 3 file-based routing + siling-mahaba adapter.
// See REMIX-MIGRATION.md Part 2 Phase 2.
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

/**
 * Hash-based SPA router. Reads/writes window.location.hash so the browser's
 * back button works without server redirect config.
 *
 * @param {string} [appName] - Base app name used by usePageTitle to build
 *   "AppName | Page" strings and to restore the title on page unmount.
 */
export function Router({ children, appName = '' }) {
  const getRoute = () => {
    const hash = window.location.hash
    const full = hash ? hash.slice(1) : '/'
    return full.includes('?') ? full.slice(0, full.indexOf('?')) : full
  }

  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/')
    }
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

  const navigate = useCallback((path) => {
    window.location.hash = path
  }, [])

  return (
    <RouterContext.Provider value={{ route, navigate, appName }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside <Router>')
  return ctx
}

export function matchRoute(pattern, route) {
  const patternParts = pattern.split('/')
  const routeParts = route.split('/')
  if (patternParts.length !== routeParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = routeParts[i]
    } else if (patternParts[i] !== routeParts[i]) {
      return null
    }
  }
  return params
}

export function useRouteMatch(pattern) {
  const { route } = useRouter()
  return matchRoute(pattern, route)
}
