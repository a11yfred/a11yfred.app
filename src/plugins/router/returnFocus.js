/**
 * returnFocus(el), programmatic focus that always shows the visible focus ring.
 *
 * Plain .focus() only triggers :focus-visible when the browser's keyboard-modality
 * flag is set (i.e. the user was last navigating by keyboard). When a dialog or
 * panel was opened with a mouse click and then dismissed, .focus() moves focus
 * back to the trigger silently, no ring, no visual cue of where you landed.
 *
 * This utility adds `data-focus-return` before calling .focus() so the CSS rule
 *   [data-focus-return]:focus { outline: … }
 * fires unconditionally, then removes the attribute on the next blur or pointerdown
 * so it doesn't linger or fight with subsequent interactions.
 *
 * Use everywhere focus is returned to a trigger after a dialog/panel/sheet closes:
 *   useReturnFocus, BottomSheet, Modal, Drawer, and any future overlay component.
 */
export function returnFocus(el) {
  if (!el) return
  el.setAttribute('data-focus-return', '')
  el.focus()
  const cleanup = () => el.removeAttribute('data-focus-return')
  el.addEventListener('blur', cleanup, { once: true })
  el.addEventListener('pointerdown', cleanup, { once: true })
}
