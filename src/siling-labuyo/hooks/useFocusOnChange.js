import { useEffect, useRef } from 'react'

/**
 * Moves focus to `ref.current` whenever `dep` changes, but NOT on initial mount.
 * Use when a mounted element needs to reclaim focus after its content changes.
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
