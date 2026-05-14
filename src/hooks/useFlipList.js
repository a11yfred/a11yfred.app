import { useRef, useLayoutEffect } from 'react'

/**
 * FLIP animation for list reordering.
 *
 * Usage:
 *   const { listRef, snapshotPositions } = useFlipList()
 *   // call snapshotPositions() just before triggering a re-sort
 *   // pass listRef to the <ul>
 *
 * Items must have a data-flip-id attribute matching a stable identity
 * (e.g. entry.id). Items currently animating out (opacity: 0 via
 * other classes) are skipped.
 */
export function useFlipList() {
  const listRef = useRef(null)
  const snapshotRef = useRef(null)

  function snapshotPositions() {
    const ul = listRef.current
    if (!ul) return
    const map = {}
    ul.querySelectorAll('[data-flip-id]').forEach(el => {
      map[el.dataset.flipId] = el.getBoundingClientRect().top
    })
    snapshotRef.current = map
  }

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current
    if (!snapshot) return
    snapshotRef.current = null

    const ul = listRef.current
    if (!ul) return

    ul.querySelectorAll('[data-flip-id]').forEach(el => {
      const id = el.dataset.flipId
      const prevTop = snapshot[id]
      if (prevTop === undefined) return

      const nextTop = el.getBoundingClientRect().top
      const delta = prevTop - nextTop
      if (delta === 0) return

      // Apply inverse transform so element appears to stay in place
      el.style.transform = `translateY(${delta}px)`
      el.style.transition = 'none'

      // Force reflow so the browser registers the starting position
      el.getBoundingClientRect()

      // Play forward: animate to natural position
      el.style.transform = ''
      el.style.transition = 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'

      function cleanup() {
        el.style.transition = ''
        el.removeEventListener('transitionend', cleanup)
      }
      el.addEventListener('transitionend', cleanup)
    })
  })

  return { listRef, snapshotPositions }
}
