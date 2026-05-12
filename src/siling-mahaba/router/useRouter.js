import { useNavigate, useLocation, useMatches } from '@remix-run/react'
import { matchRoute } from '../../siling-labuyo/router/Router.jsx'

/**
 * Drop-in replacement for siling-labuyo's useRouter, backed by Remix.
 *
 * Returns the same { route, navigate, appName } shape so all consumers
 * work unchanged when swapping siling-labuyo → siling-mahaba.
 *
 * appName is read from the root route's handle.appName if provided:
 *   // app/root.tsx
 *   export const handle = { appName: 'A11yHelper' }
 *
 * Falls back to the first segment of document.title if handle is absent.
 */
export function useRouter() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const matches    = useMatches()

  const appName = matches[0]?.handle?.appName
    ?? document.title.split(' | ')[0]
    ?? ''

  return {
    route:    location.pathname + location.search + location.hash,
    navigate: (path) => navigate(path),
    appName,
  }
}

/**
 * Drop-in replacement for siling-labuyo's useRouteMatch.
 * Matches a pattern string (e.g. '/findings/:id') against the current pathname.
 * Returns a params object on match, null otherwise.
 */
export function useRouteMatch(pattern) {
  const location = useLocation()
  return matchRoute(pattern, location.pathname)
}
