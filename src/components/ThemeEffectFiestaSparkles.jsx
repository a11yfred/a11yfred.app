import { useEffect, useRef } from 'react'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#ff6b81', '#74c0fc']
const COUNT = 14

export default function ThemeEffectFiestaSparkles({ active }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!active || prefersReducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function spawnAt(x, y) {
      for (let i = 0; i < COUNT; i++) {
        const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.9
        const speed = 2.5 + Math.random() * 4.5
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 4 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 1,
          decay: 0.022 + Math.random() * 0.018,
          star: Math.random() > 0.5,
        })
      }
    }

    function onClick(e) {
      spawnAt(e.clientX, e.clientY)
    }
    document.addEventListener('click', onClick)

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.18
        p.life -= p.decay
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        if (p.star) {
          drawStar(ctx, p.x, p.y, p.size * 0.45, p.size, 5)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      animRef.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(animRef.current)
      particlesRef.current = []
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null

  return <canvas ref={canvasRef} className="sparkles-canvas" aria-hidden="true" />
}

function drawStar(ctx, cx, cy, innerR, outerR, points) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI * i) / points - Math.PI / 2
    i === 0
      ? ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
      : ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
  }
  ctx.closePath()
  ctx.fill()
}
