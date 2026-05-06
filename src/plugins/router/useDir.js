import { useState, useEffect } from 'react'

/**
 * Returns the current document writing direction, 'ltr' or 'rtl'.
 * Reactively updates whenever document.documentElement.dir changes,
 * so components re-render automatically when the user switches to/from
 * a right-to-left language.
 *
 * Usage:
 *   const dir = useDir()
 *   const isRTL = dir === 'rtl'
 */
export function useDir() {
  const [dir, setDir] = useState(() => document.documentElement.dir || 'ltr')

  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => {
      setDir(el.dir || 'ltr')
    })
    observer.observe(el, { attributes: true, attributeFilter: ['dir'] })
    return () => observer.disconnect()
  }, [])

  return dir
}
