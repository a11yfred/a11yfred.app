import { useState, useEffect, useRef } from 'react'
import { _subscribe } from './announce.js'

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
export function Announcer() {
  const [politeMsg, setPoliteMsg] = useState('')
  const [assertiveMsg, setAssertiveMsg] = useState('')
  const politeTimer = useRef(null)
  const assertiveTimer = useRef(null)

  useEffect(() => {
    const unsub = _subscribe((message, priority) => {
      if (priority === 'assertive') {
        setAssertiveMsg('')
        clearTimeout(assertiveTimer.current)
        assertiveTimer.current = setTimeout(() => {
          setAssertiveMsg(message)
          assertiveTimer.current = setTimeout(() => setAssertiveMsg(''), 1000)
        }, 50)
      } else {
        setPoliteMsg('')
        clearTimeout(politeTimer.current)
        politeTimer.current = setTimeout(() => {
          setPoliteMsg(message)
          politeTimer.current = setTimeout(() => setPoliteMsg(''), 1000)
        }, 50)
      }
    })
    return () => {
      unsub()
      clearTimeout(politeTimer.current)
      clearTimeout(assertiveTimer.current)
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
    </>
  )
}
