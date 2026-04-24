import { useState, useEffect, useRef } from 'react'
import { _subscribe } from './announce.js'

/**
 * Renders two visually-hidden ARIA live regions: one polite, one assertive.
 * Mount this once, near the top of your app tree (e.g. just inside <body>
 * or as a sibling to your main layout wrapper). It has no visible output.
 *
 * <Announcer /> must be mounted before any announce() call fires.
 * Mounting it in App.jsx satisfies this for all app-level flows.
 */
export function Announcer() {
  const [politeMsg, setPoliteMsg] = useState('')
  const [assertiveMsg, setAssertiveMsg] = useState('')
  const politeTimer = useRef(null)
  const assertiveTimer = useRef(null)

  useEffect(() => {
    const unsub = _subscribe((message, priority) => {
      if (priority === 'assertive') {
        // Clear first so screen readers re-announce even if the text is
        // identical to the previous message, then set after a paint.
        setAssertiveMsg('')
        clearTimeout(assertiveTimer.current)
        assertiveTimer.current = setTimeout(() => setAssertiveMsg(message), 50)
      } else {
        setPoliteMsg('')
        clearTimeout(politeTimer.current)
        politeTimer.current = setTimeout(() => setPoliteMsg(message), 50)
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
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={SR_ONLY}
      >
        {politeMsg}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={SR_ONLY}
      >
        {assertiveMsg}
      </div>
    </>
  )
}

const SR_ONLY = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
}
