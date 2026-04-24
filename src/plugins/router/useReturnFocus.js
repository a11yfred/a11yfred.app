import { useEffect, useRef } from 'react'

/**
 * Saves the currently focused element when the component mounts and
 * returns focus to it when the component unmounts.
 *
 * Use this in any panel or page that temporarily takes focus away
 * from a trigger element (e.g. a settings button), so keyboard and
 * screen reader users land back where they started after closing.
 *
 * Usage:
 *   function SettingsPanel() {
 *     useReturnFocus()
 *     // ...
 *   }
 */
export function useReturnFocus() {
  const savedRef = useRef(null)

  useEffect(() => {
    savedRef.current = document.activeElement
    return () => {
      savedRef.current?.focus()
    }
  }, [])
}
