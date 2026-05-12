import { useState, useEffect } from 'react'

/**
 * Returns the current document writing direction ('ltr' or 'rtl').
 * Updates reactively whenever document.documentElement.dir changes.
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
