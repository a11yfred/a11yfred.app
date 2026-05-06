import { useEffect, useRef } from 'react'

/**
 * Returns a ref. Attach it to any element with tabIndex={-1} and that
 * element will receive programmatic focus the moment it mounts.
 *
 * tabIndex={-1} makes the element focusable without adding it to the
 * sequential tab order, the standard pattern for focus management
 * on page/panel transitions (WCAG 2.4.3).
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
