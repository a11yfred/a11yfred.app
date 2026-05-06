import { useEffect } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Restricts Tab / Shift+Tab to elements within `ref.current` while `active`.
 * Use on modals, bottom sheets, and off-canvas panels, any layer that should
 * hold focus until explicitly dismissed.
 *
 * @param {React.RefObject} ref      - container element to trap focus within
 * @param {boolean}         active   - trap is only active when true
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return

    const container = ref.current

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
        (el) => !el.closest('[inert]')
      )

    const handler = (e) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [ref, active])
}
