import { useEffect, useRef } from 'react'

/**
 * Moves focus to `ref.current` whenever `dep` changes, but NOT on initial mount.
 * Use when the same mounted element needs to reclaim focus after its content
 * changes — e.g. a detail view that stays mounted but swaps to a different item.
 *
 * Contrast with useFocusOnMount (fires once on mount) and usePaginationFocus
 * (fires on page change inside a paginated overlay, guards against same content).
 *
 * The target element must have tabIndex={-1} so it can receive programmatic
 * focus without entering the natural tab order.
 *
 * @param {React.RefObject} ref - element to focus on change
 * @param {*}               dep - value to watch; focus fires when this changes
 */
export function useFocusOnChange(ref, dep) {
  const isMountRef = useRef(true)

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false
      return
    }
    ref.current?.focus()
  }, [dep]) // eslint-disable-line react-hooks/exhaustive-deps -- ref is stable
}
