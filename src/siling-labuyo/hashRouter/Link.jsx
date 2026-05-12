import { useRouter } from './Router.jsx'

/**
 * Navigation link for hash-based routing. Renders a real <a> so right-click,
 * middle-click, and keyboard activation all work without special handling.
 *
 * Props:
 *   to    string  route path, e.g. '/settings'
 */
export default function Link({ to, children, ...rest }) {
  const { navigate } = useRouter()

  const handleClick = (e) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault()
      navigate(to)
    }
    rest.onClick?.(e)
  }

  return (
    <a href={`#${to}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
