import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

/**
 * Hash-based SPA router. Reads/writes window.location.hash so the
 * browser's back button works and no server redirect config is needed.
 * Routes are the hash fragment without the '#', e.g. '/' or '/settings'.
 */
/**
 * @param {string} [appName] - Base application name used by usePageTitle to
 *   build "AppName | Page" strings and to restore the title on page unmount.
 *   Pass once here; every usePageTitle call reads it from context.
 */
export function Router({ children, appName = '' }) {
  const getRoute = () => {
    const hash = window.location.hash
    return hash ? hash.slice(1) : '/'
  }

  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    // Ensure a clean initial hash without triggering hashchange
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/')
    }
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Initialise the document title to the base app name on first mount.
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
