// TODO: Remix 3 adapter — rewrite this file once the Remix 3 routing API stabilises.
// As of the beta (April 2026), the routing primitives replacing useNavigate /
// useLocation / useMatches are not yet documented. This file currently wraps
// React Router 7 (@remix-run/react) which is NOT available in Remix 3.
//
// Contract this file must keep (do not change the return shapes):
//   useRouter()     → { route: string, navigate: (path: string) => void, appName: string }
//   useRouteMatch() → params object | null
//
// When Remix 3 API is known:
//   1. Replace the @remix-run/react imports with Remix 3 equivalents
//   2. Update appName to come from the Remix 3 route handle equivalent
//   3. Remove this comment block

import { useNavigate, useLocation, useMatches } from '@remix-run/react'
import { matchRoute } from '../../siling-labuyo/hashRouter/Router.jsx'

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const matches  = useMatches()

  const appName = matches[0]?.handle?.appName
    ?? document.title.split(' | ')[0]
    ?? ''

  return {
    route:    location.pathname + location.search + location.hash,
    navigate: (path) => navigate(path),
    appName,
  }
}

export function useRouteMatch(pattern) {
  const location = useLocation()
  return matchRoute(pattern, location.pathname)
}
