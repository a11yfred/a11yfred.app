import { useState, useEffect, useRef } from 'react'
import { useT } from '@ulam/calamansi/react'
import { ANIMATION_COMPLETE_DELAY } from '../utils/constants.js'

export default function A11yFiestaBanner() {
  const t = useT()
  const [animating, setAnimating] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setAnimating(false), ANIMATION_COMPLETE_DELAY)
    return () => clearTimeout(timerRef.current)
  }, [])

  function handleMouseEnter() {
    clearTimeout(timerRef.current)
    setAnimating(true)
    timerRef.current = setTimeout(() => setAnimating(false), ANIMATION_COMPLETE_DELAY)
  }

  return (
    <div
      className={`fiesta-banner${animating ? '' : ' fiesta-banner--still'}`}
      aria-hidden="true"
      onMouseEnter={handleMouseEnter}
    >
      {t('party.banner')}
    </div>
  )
}
