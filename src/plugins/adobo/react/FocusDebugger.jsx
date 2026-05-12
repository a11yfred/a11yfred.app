import { useState, useEffect, useRef } from 'react'
import '../debug.css'
import { createFocusWatcher } from '../core/focus.js'

const IS_DEV = import.meta.env.DEV

export function FocusDebugger({ enabled = true }) {
  const [toast, setToast] = useState(null)
  const showTimer = useRef(null)
  const fadeTimer = useRef(null)

  useEffect(() => {
    if (!IS_DEV || !enabled) return

    const watcher = createFocusWatcher((data) => {
      clearTimeout(showTimer.current)
      clearTimeout(fadeTimer.current)
      setToast({ ...data, fading: false })
      showTimer.current = setTimeout(() => {
        setToast(prev => prev ? { ...prev, fading: true } : null)
        fadeTimer.current = setTimeout(() => setToast(null), 400)
      }, 3000)
    })

    return () => {
      watcher.destroy()
      clearTimeout(showTimer.current)
      clearTimeout(fadeTimer.current)
    }
  }, [enabled])

  if (!IS_DEV || !enabled || !toast) return null

  return (
    <div className={`focus-toast${toast.fading ? ' focus-toast--fading' : ''}`} aria-hidden="true">
      <div className="focus-toast__row">
        <span className="focus-toast__label">KB Focus</span>
        <code className="focus-toast__target">{toast.label}</code>
      </div>
      <div className="focus-toast__indicators">
        <span className={`focus-toast__indicator${toast.hasFocusOutline ? ' focus-toast__indicator--on' : ' focus-toast__indicator--off'}`}>
          :focus {toast.hasFocusOutline ? '✓' : '✗'}
        </span>
        <span className={`focus-toast__indicator${toast.isFocusVisible ? ' focus-toast__indicator--on' : ' focus-toast__indicator--off'}`}>
          :focus-visible {toast.isFocusVisible ? '✓' : '✗'}
        </span>
      </div>
    </div>
  )
}
