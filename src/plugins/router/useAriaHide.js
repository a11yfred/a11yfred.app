import { useEffect } from 'react'

// Marker attribute used to track which elements this hook hid,
// so cleanup only removes what this instance added.
const MARKER = 'data-overlay-aria-hidden'

/**
 * Hides all document.body children from the accessibility tree while the
 * overlay panel is open, then restores them on close.
 *
 * Designed for portaled overlays (Modal, BottomSheet) that render their panel
 * as a direct child of document.body. The hook excludes the panel itself (via
 * `el.contains(panel)`) so the overlay stays reachable by screen readers while
 * everything else — including #root — gets aria-hidden="true".
 *
 * Stacking: if a body child is already aria-hidden by another overlay, the
 * MARKER is not added, so this instance won't accidentally restore it when it
 * closes. Each overlay only cleans up what it personally hid.
 *
 * Non-portaled overlays (Drawer): this hook is not used because the Drawer
 * lives inside #root. For that case, set aria-hidden on the background content
 * wrapper alongside the existing `inert` attribute (see App.jsx).
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
