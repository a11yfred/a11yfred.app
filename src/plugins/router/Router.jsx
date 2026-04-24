import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

/**
 * Hash-based SPA router. Reads/writes window.location.hash so the
 * browser's back button works and no server redirect config is needed.
 * Routes are the hash fragment without the '#', e.g. '/' or '/settings'.
 */
export function Router({ children }) {
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

  const navigate = useCallback((path) => {
    window.location.hash = path
  }, [])

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside <Router>')
  return ctx
}
