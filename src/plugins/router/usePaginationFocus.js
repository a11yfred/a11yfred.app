import { useEffect, useRef } from 'react'

/**
 * Moves focus to `ref.current` whenever `page` changes — but NOT on initial
 * mount, and NOT if the element's innerHTML is the same as the previous page.
 * Use inside paginated modals and bottom sheets so keyboard and screen
 * reader users land at the top of the new page content rather than wherever
 * focus happened to be inside the previous page.
 *
 * Pair with useFocusOnMount (on the close button) for the initial open;
 * usePaginationFocus handles every subsequent page transition.
 *
 * The target element must have tabIndex={-1} so it can receive programmatic
 * focus without entering the natural tab order.
 *
 * @param {React.RefObject} ref   - heading or top-of-page element to focus
 * @param {*}               page  - current page identifier (number, string, etc.)
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
    // Only focus if the content has changed
    if (currentContent !== previousContentRef.current) {
      ref.current?.focus()
    }
    previousContentRef.current = currentContent
  }, [ref, page])
}
