import { useEffect } from 'react'
import { trapFocus } from '../../sili/core/focusTrap.js'

/**
 * Restricts Tab / Shift+Tab to elements within `ref.current` while `active`.
 *
 * @param {React.RefObject} ref    - container element to trap focus within
 * @param {boolean}         active - trap is only active when true
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return
    return trapFocus(ref.current)
  }, [ref, active])
}
