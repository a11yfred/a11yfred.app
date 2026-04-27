import { useState, useRef } from 'react'

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

/**
 * Dev-only toast indicating whether an AI assist feature was toggled on or off.
 * Project-specific addon — wire up via useAiDebugToast() in your App.
 *
 * Props:
 *   state   'on' | 'off' | null
 *   fading  boolean
 */
export function AiDebugToast({ state, fading }) {
  if (!IS_DEV || !state) return null
  return (
    <div className={`ai-debug-toast${fading ? ' ai-debug-toast--fading' : ''}`} aria-hidden="true">
      AI Assist {state === 'on' ? 'ON ✓' : 'OFF ✗'}
    </div>
  )
}

/**
 * Returns { toast, fading, fire } for controlling the AI debug toast.
 *   fire('on')  — show "AI Assist ON ✓"
 *   fire('off') — show "AI Assist OFF ✗"
 */
export function useAiDebugToast() {
  const [toast, setToast] = useState(null)
  const [fading, setFading] = useState(false)
  const timers = useRef([null, null])

  const fire = (state) => {
    timers.current.forEach(id => clearTimeout(id))
    setToast(state)
    setFading(false)
    timers.current[0] = setTimeout(() => setFading(true), 3600)
    timers.current[1] = setTimeout(() => { setToast(null); setFading(false) }, 4000)
  }

  return { toast, fading, fire }
}
