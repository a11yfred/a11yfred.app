import { useEffect } from 'react'

/**
 * Attach a keydown listener to a target element (or document) and clean up on unmount.
 *
 * @param {Function} handler - Keydown event handler. Should be stable (useCallback or defined outside render).
 * @param {{ target?: EventTarget|React.RefObject<EventTarget>, capture?: boolean }} [opts]
 *   target  — DOM node, React ref, or null/undefined (falls back to document).
 *   capture — whether to use capture phase (default false).
 */
export function useKeydown(handler, { target, capture = false } = {}) {
  useEffect(() => {
    const el = target && 'current' in target ? target.current : (target ?? document)
    if (!el) return
    el.addEventListener('keydown', handler, capture)
    return () => el.removeEventListener('keydown', handler, capture)
  }, [handler, target, capture])
}
