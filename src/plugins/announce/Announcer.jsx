import { useState, useEffect, useRef } from 'react'
import { _subscribe } from './announce.js'
import './announce.css'

const IS_DEV = import.meta.env.DEV

/**
 * Renders two visually-hidden ARIA live regions: one polite, one assertive.
 * Mount this once, near the top of your app tree (e.g. just inside <body>
 * or as a sibling to your main layout wrapper). It has no visible output.
 *
 * <Announcer /> must be mounted before any announce() call fires.
 * Mounting it in App.jsx satisfies this for all app-level flows.
 *
 * Each message is cleared from the DOM ~1 s after it is announced so that
 * screen reader users navigating the page do not encounter stale announcement
 * text sitting in the live region.
 */
export function Announcer({ devEnabled = true }) {
  const [politeMsg, setPoliteMsg] = useState('')
  const [assertiveMsg, setAssertiveMsg] = useState('')
  const politeTimer = useRef(null)
  const assertiveTimer = useRef(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const toastFadeTimer = useRef(null)
  const devEnabledRef = useRef(devEnabled)
  devEnabledRef.current = devEnabled // eslint-disable-line react-hooks/refs

  useEffect(() => {
    const unsub = _subscribe((message, priority) => {
      if (priority === 'assertive') {
        setAssertiveMsg('')
        clearTimeout(assertiveTimer.current)
        assertiveTimer.current = setTimeout(() => {
          setAssertiveMsg(message)
          // Longer hold for assertive messages so screen readers finish reading
          // before the DOM text is cleared, 50ms per character, min 2500ms
          const hold = Math.max(2500, message.length * 50)
          assertiveTimer.current = setTimeout(() => setAssertiveMsg(''), hold)
        }, 50)
      } else {
        setPoliteMsg('')
        clearTimeout(politeTimer.current)
        politeTimer.current = setTimeout(() => {
          setPoliteMsg(message)
          politeTimer.current = setTimeout(() => setPoliteMsg(''), 1000)
        }, 50)
      }

      if (IS_DEV && devEnabledRef.current) {
        setToast({ message, priority, fading: false })
        clearTimeout(toastTimer.current)
        clearTimeout(toastFadeTimer.current)
        toastTimer.current = setTimeout(() => {
          setToast(prev => prev ? { ...prev, fading: true } : null)
          toastFadeTimer.current = setTimeout(() => setToast(null), 400)
        }, 3600)
      }
    })
    return () => {
      unsub()
      clearTimeout(politeTimer.current)
      clearTimeout(assertiveTimer.current)
      clearTimeout(toastTimer.current)
      clearTimeout(toastFadeTimer.current)
    }
  }, [])

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMsg}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMsg}
      </div>
      {IS_DEV && devEnabled && toast && (
        <div className={`announce-toast announce-toast--${toast.priority}${toast.fading ? ' announce-toast--fading' : ''}`} aria-hidden="true">
          <span className="announce-toast__badge">{toast.priority}</span>
          {toast.message}
        </div>
      )}
    </>
  )
}
