import { useRouter } from './Router.jsx'

/**
 * Renders children only when the current route matches `path`.
 * Renders nothing otherwise, no placeholder, no hidden element.
 */
export default function Route({ path, children }) {
  const { route } = useRouter()
  return route === path ? children : null
}
