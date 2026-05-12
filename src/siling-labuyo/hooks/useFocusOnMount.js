import { useEffect, useRef } from 'react'

/**
 * Returns a ref. Attach it to any element with tabIndex={-1} and that element
 * will receive programmatic focus the moment it mounts (WCAG 2.4.3).
 *
 * Usage:
 *   const headingRef = useFocusOnMount()
 *   <h2 ref={headingRef} tabIndex={-1}>Settings</h2>
 */
export function useFocusOnMount() {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}
