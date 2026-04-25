import { useEffect, useRef } from 'react'

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#ff63c3', '#20c997']
const COUNT = 110
const DURATION_MS = 5000
const FADE_MS = 800

function makeParticle(canvasWidth, canvasHeight) {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight - canvasHeight,
    velX: (Math.random() - 0.5) * 2.5,
    velY: Math.random() * 2.5 + 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 9 + 4,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.08,
    rect: Math.random() > 0.45,
  }
}

export default function Confetti({ active }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!active || prefersReduced) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: COUNT }, () =>
      makeParticle(canvas.width, canvas.height)
    )

    startTimeRef.current = performance.now()

    const draw = (now) => {
      const elapsed = now - startTimeRef.current
      if (elapsed >= DURATION_MS + FADE_MS) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      // Fade out over the last FADE_MS
      const alpha = elapsed < DURATION_MS
        ? 1
        : 1 - (elapsed - DURATION_MS) / FADE_MS

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = alpha

      particles.forEach(p => {
        p.x += p.velX
        p.y += p.velY
        p.velX += (Math.random() - 0.5) * 0.06
        p.rotation += p.rotSpeed

        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color

        if (p.rect) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      aria-hidden="true"
    />
  )
}
