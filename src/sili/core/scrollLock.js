/**
 * Prevents body scroll. Returns a cleanup fn that restores overflow.
 */
export function lockScroll() {
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = '' }
}
