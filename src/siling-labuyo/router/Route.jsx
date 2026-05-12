import { useRouter } from './Router.jsx'

/**
 * Renders children only when the current route matches `path`.
 */
export default function Route({ path, children }) {
  const { route } = useRouter()
  return route === path ? children : null
}
