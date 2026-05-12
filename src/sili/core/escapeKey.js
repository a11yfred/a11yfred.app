/**
 * Registers a keydown listener that calls `onEscape` when Escape is pressed.
 * Returns a cleanup fn. Pass `useCapture: true` for high-priority handlers
 * (e.g. Modal that should dismiss before underlying Drawer/Sheet handlers fire).
 *
 * @param {() => void} onEscape
 * @param {{ useCapture?: boolean, stopPropagation?: boolean }} [options]
 */
export function onEscapeKey(onEscape, { useCapture = false, stopPropagation = false } = {}) {
  const handler = (e) => {
    if (e.key !== 'Escape') return
    if (stopPropagation) e.stopImmediatePropagation()
    onEscape()
  }
  document.addEventListener('keydown', handler, useCapture)
  return () => document.removeEventListener('keydown', handler, useCapture)
}
