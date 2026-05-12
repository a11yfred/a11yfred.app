import { useNavigate, useLocation, useMatches } from 'react-router'
// eslint-disable-next-line @a11yfred/neighbor/no-hash-router-in-remix -- adapter layer; matchRoute is the only dependency on siling-labuyo
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
