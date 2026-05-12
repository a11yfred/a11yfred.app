import { useState, useEffect } from 'react'

/**
 * Reactive wrapper around window.matchMedia. Returns true when the media query
 * matches and updates automatically if the viewport changes.
 *
 * Usage:
 *   const isDesktop = useMediaQuery('(width >= 768px)')
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches) // eslint-disable-line react-hooks/set-state-in-effect
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}
