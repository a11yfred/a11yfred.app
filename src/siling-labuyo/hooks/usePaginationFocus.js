import { useEffect, useRef } from 'react'

/**
 * Moves focus to `ref.current` whenever `page` changes, but NOT on initial mount,
 * and NOT if the element's innerHTML is unchanged. Use inside paginated overlays
 * so keyboard/screen reader users land at the top of new page content.
 *
 * @param {React.RefObject} ref   - heading or top-of-page element to focus
 * @param {*}               page  - current page identifier
 */
export function usePaginationFocus(ref, page) {
  const isMountRef = useRef(true)
  const previousContentRef = useRef(null)

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false
      previousContentRef.current = ref.current?.innerHTML
      return
    }

    const currentContent = ref.current?.innerHTML
    if (currentContent !== previousContentRef.current) {
      ref.current?.focus()
    }
    previousContentRef.current = currentContent
  }, [ref, page])
}
