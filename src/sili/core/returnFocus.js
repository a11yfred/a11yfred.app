/**
 * returnFocus(el) — programmatic focus that always shows the visible focus ring.
 *
 * Plain .focus() only triggers :focus-visible when the browser's keyboard-modality
 * flag is set. When a dialog closes after a mouse-click open, .focus() returns
 * silently with no ring. This utility adds `data-focus-return` before calling
 * .focus() so the CSS rule `[data-focus-return]:focus { outline: … }` fires
 * unconditionally, then removes the attribute on the next blur or pointerdown.
 */
export function returnFocus(el) {
  if (!el) return
  el.setAttribute('data-focus-return', '')
  el.focus()
  const cleanup = () => el.removeAttribute('data-focus-return')
  el.addEventListener('blur', cleanup, { once: true })
  el.addEventListener('pointerdown', cleanup, { once: true })
}
