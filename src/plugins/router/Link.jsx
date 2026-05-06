import { useRouter } from './Router.jsx'

/**
 * Navigation link for hash-based routing. Renders a real <a> so
 * right-click → "Copy link", middle-click, and keyboard activation
 * all work without special handling.
 *
 * Props:
 *   to        string , route path, e.g. '/settings'
 *   ...rest         , forwarded to the underlying <a>
 */
export default function Link({ to, children, ...rest }) {
  const { navigate } = useRouter()

  const handleClick = (e) => {
    // Let modifier-key clicks (open in new tab, etc.) pass through
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
