// Local utility for managing aria-disabled state
export function setAriaDisabled(element, disabled) {
  if (!element) return
  if (disabled) {
    element.setAttribute('aria-disabled', 'true')
  } else {
    element.removeAttribute('aria-disabled')
  }
}
