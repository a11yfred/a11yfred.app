import { useState, useEffect, useRef } from 'react'
import { _subscribe } from '../taho/announce.js'
import './announcer.css'

const IS_DEV = import.meta.env.DEV

/**
 * Dev-mode toast overlay that makes screen reader announcements visible.
 * Mount once near the top of your app tree.
 *
 * This component does NOT drive the live regions — announce() creates and
 * manages those DOM nodes directly. This component only renders the visible
 * debug toast shown in development so you can see what's being announced.
 *
 * In production (IS_DEV = false) this renders nothing at all and can be
 * omitted entirely — announce() still works without it.
 */
export function Announcer({ devEnabled = true }) {
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const toastFadeTimer = useRef(null)
  const devEnabledRef = useRef(devEnabled)
  useEffect(() => { devEnabledRef.current = devEnabled }, [devEnabled])

  useEffect(() => {
    if (!IS_DEV) return
    const unsub = _subscribe((message, priority) => {
      if (!devEnabledRef.current) return
      setToast({ message, priority, fading: false })
      clearTimeout(toastTimer.current)
      clearTimeout(toastFadeTimer.current)
      toastTimer.current = setTimeout(() => {
        setToast(prev => prev ? { ...prev, fading: true } : null)
        toastFadeTimer.current = setTimeout(() => setToast(null), 400)
      }, 3600)
    })
    return () => {
      unsub()
      clearTimeout(toastTimer.current)
      clearTimeout(toastFadeTimer.current)
    }
  }, [])

  if (!IS_DEV || !devEnabled || !toast) return null

  return (
    <div
      className={`announce-toast announce-toast--${toast.priority}${toast.fading ? ' announce-toast--fading' : ''}`}
      aria-hidden="true"
    >
      <span className="announce-toast__badge">{toast.priority}</span>
      {toast.message}
    </div>
  )
}
