const MARKER = 'data-overlay-hidden'

/**
 * Hides all body children except the panel's ancestor from the a11y tree
 * using the `inert` attribute. Returns a cleanup fn that restores only what
 * this call set (stacking-safe — each overlay cleans up after itself only).
 *
 * @param {HTMLElement} panel - the overlay panel element
 */
export function hideBackground(panel) {
  const targets = [...document.body.children].filter(el =>
    !el.contains(panel) &&
    !el.querySelector('.sheet-panel.is-open') &&
    !el.hasAttribute('data-overlay-backdrop')
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
}
