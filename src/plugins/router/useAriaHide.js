import { useEffect } from 'react'

const MARKER = 'data-overlay-hidden'

/**
 * Hides all document.body children from the accessibility tree while the
 * overlay panel is open, then restores them on close.
 *
 * Uses the `inert` attribute (HTML spec, widely supported) instead of
 * aria-hidden. `inert` simultaneously removes elements from the a11y tree
 * AND prevents focus, eliminating the "focused element inside aria-hidden
 * ancestor" browser warning that aria-hidden alone requires manual focus
 * management to avoid.
 *
 * Stacking: if a body child is already inert via another overlay, the MARKER
 * is not added, so this instance won't accidentally restore it on close. Each
 * overlay only cleans up what it personally set.
 *
 * @param {React.RefObject} panelRef  ref attached to the overlay panel element
 * @param {boolean}         open      whether the overlay is currently visible
 */
export function useAriaHide(panelRef, open) {
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const targets = [...document.body.children].filter(el =>
      !el.contains(panel) && !el.querySelector('.sheet-panel.is-open')
    )

    targets.forEach(el => {
      if (!el.hasAttribute('inert')) {
        el.setAttribute('inert', '')
        el.setAttribute(MARKER, '')
      }
    })

    return () => {
      targets.forEach(el => {
        if (el.hasAttribute(MARKER)) {
          el.removeAttribute('inert')
          el.removeAttribute(MARKER)
        }
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps -- panelRef is stable
}
