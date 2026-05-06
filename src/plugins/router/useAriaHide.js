import { useEffect } from 'react'

const MARKER = 'data-overlay-aria-hidden'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Hides all document.body children from the accessibility tree while the
 * overlay panel is open, then restores them on close.
 *
 * Before hiding, focus is moved into the panel so that no focused element
 * ends up inside an aria-hidden ancestor, which is an invalid state per
 * WAI-ARIA and generates a browser console warning.
 *
 * Stacking: if a body child is already aria-hidden by another overlay, the
 * MARKER is not added, so this instance won't accidentally restore it when it
 * closes. Each overlay only cleans up what it personally hid.
 *
 * @param {React.RefObject} panelRef  ref attached to the overlay panel element
 * @param {boolean}         open      whether the overlay is currently visible
 */
export function useAriaHide(panelRef, open) {
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const targets = [...document.body.children].filter(el => !el.contains(panel))

    // If the currently-focused element is inside a target that will be hidden,
    // move focus into the panel first so aria-hidden never covers a focused element.
    const active = document.activeElement
    if (active && targets.some(el => el.contains(active))) {
      const first = panel.querySelector(FOCUSABLE)
      first?.focus()
    }

    targets.forEach(el => {
      if (!el.hasAttribute('aria-hidden')) {
        el.setAttribute('aria-hidden', 'true')
        el.setAttribute(MARKER, '')
      }
    })

    return () => {
      targets.forEach(el => {
        if (el.hasAttribute(MARKER)) {
          el.removeAttribute('aria-hidden')
          el.removeAttribute(MARKER)
        }
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps -- panelRef is stable
}
