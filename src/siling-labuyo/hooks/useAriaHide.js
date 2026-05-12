import { useEffect } from 'react'
import { hideBackground } from '../../sili/core/ariaHide.js'

/**
 * Hides all document.body children from the a11y tree while the overlay is open,
 * then restores them on close. Stacking-safe — only restores what this call set.
 *
 * @param {React.RefObject} panelRef - ref attached to the overlay panel element
 * @param {boolean}         open     - whether the overlay is currently visible
 */
export function useAriaHide(panelRef, open) {
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    return hideBackground(panel)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps -- panelRef is stable
}
