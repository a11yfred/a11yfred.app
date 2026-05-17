import { useState, useEffect, useRef } from 'react'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion.js'

const DURATION_MS = 200

/**
 * Cross-fades between children whenever `watchKey` changes.
 * During the transition the outgoing snapshot is frozen while fading out,
 * then the live children fade in. Between transitions, children render live.
 *
 * @param {*}      children    - content to display
 * @param {*}      watchKey    - changing this triggers the cross-fade
 * @param {string} [className] - extra class on the wrapper div
 * @param {'ltr'|'rtl'} [direction] - slide direction for carousel-style transitions
 */
export default function FadeTransition({ children, watchKey, className, direction }) {
  const [outgoing, setOutgoing] = useState(null)
  const [phase, setPhase] = useState('idle')        // 'idle' | 'out' | 'in'
  const [activeDirection, setActiveDirection] = useState(null)
  const prevKeyRef = useRef(watchKey)
  const timerRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prevKeyRef.current === watchKey) return
    prevKeyRef.current = watchKey

    if (prefersReducedMotion) return

    setActiveDirection(direction ?? null) // eslint-disable-line react-hooks/set-state-in-effect
    setOutgoing(children)
    setPhase('out')

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setOutgoing(null)
      setPhase('in')
      timerRef.current = setTimeout(() => setPhase('idle'), DURATION_MS)
    }, DURATION_MS)

    return () => clearTimeout(timerRef.current)
  }, [watchKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const dirMod = activeDirection ? ` fade-transition--${activeDirection}` : ''

  const cls = [
    'fade-transition',
    phase === 'in' ? `fade-transition--in${dirMod}` : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  if (phase === 'out' && outgoing) {
    return (
      <div className={`fade-transition fade-transition--out${dirMod}${className ? ` ${className}` : ''}`}>
        {outgoing}
      </div>
    )
  }

  return <div className={cls}>{children}</div>
}
