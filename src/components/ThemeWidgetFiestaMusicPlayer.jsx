import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../siling-labuyo/index.js'
import { startSong2 } from '../utils/fiestaSongs.js'
import { useT } from '../calamansi/react.js'

function rndPos() {
  return {
    top: `${10 + Math.random() * 72}vh`,
    left: `${5 + Math.random() * 82}vw`,
  }
}

export default function ThemeWidgetFiestaMusicPlayer({ active }) {
  const t = useT()
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(() => rndPos())
  const { route } = useRouter()
  const stopRef = useRef(null)

  useEffect(() => {
    setPos(rndPos()) // eslint-disable-line react-hooks/set-state-in-effect
    stopRef.current?.()
    stopRef.current = null
    setPlaying(false)
  }, [route])

  useEffect(() => {
    if (!active) {
      stopRef.current?.()
      stopRef.current = null
      setPlaying(false) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [active])

  useEffect(() => {
    return () => { stopRef.current?.() }
  }, [])

  function handleClick() {
    if (playing) {
      stopRef.current?.()
      stopRef.current = null
      setPlaying(false)
    } else {
      stopRef.current = startSong2()
      setPlaying(true)
    }
  }

  if (!active) return null

  return (
    <button
      className="fiesta-player"
      style={{ top: pos.top, left: pos.left }}
      onClick={handleClick}
      aria-label={playing ? t('party.stop') : t('party.play')}
      aria-pressed={playing}
    >
      {playing ? (
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <polygon points="3,1 13,8 3,15" />
        </svg>
      )}
    </button>
  )
}
