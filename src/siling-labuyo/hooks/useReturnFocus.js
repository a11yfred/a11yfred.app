import { useEffect, useRef } from 'react'
import { returnFocus } from '../../sili/core/returnFocus.js'

/**
 * Saves the currently focused element on mount and returns focus to it on unmount.
 * Use in any panel that temporarily takes focus so keyboard users land back where
 * they started after closing.
 */
export function useReturnFocus() {
  const savedRef = useRef(null)

  useEffect(() => {
    savedRef.current = document.activeElement
    return () => {
      returnFocus(savedRef.current)
    }
  }, [])
}
