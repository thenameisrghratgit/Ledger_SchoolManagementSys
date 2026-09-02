import { useEffect, useRef } from 'react'

export function SparklesCore({
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1.4,
  particleDensity = 120,
  particleColor = '#C4A15B',
  className = '',
  speed = 0.4,
}) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function makeParticle(w, h) {
      const angle = Math.random() * Math.PI * 2
      const v = 0.08 + Math.random() * speed * 0.3
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: minSize + Math.random() * (maxSize - minSize),
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        opacity: 0.4 + Math.random() * 0.6,
        twinkleSpeed: 0.006 + Math.random() * 0.018,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        minOpacity: 0.15 + Math.random() * 0.25,
        maxOpacity: 0.75 + Math.random() * 0.25,
      }
    }

    function init() {
      const w = canvas.width
      const h = canvas.height
      const count = Math.floor((w * h) / (1000000 / particleDensity))
      particlesRef.current = Array.from({ length: count }, () => makeParticle(w, h))
    }

    function tick() {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (background !== 'transparent') {
        ctx.fillStyle = background
        ctx.fillRect(0, 0, w, h)
      }

      particlesRef.current.forEach((p) => {
        // drift
        p.x += p.vx
        p.y += p.vy

        // wrap around edges
        if (p.x < -2) p.x = w + 2
        if (p.x > w + 2) p.x = -2
        if (p.y < -2) p.y = h + 2
        if (p.y > h + 2) p.y = -2

        // twinkle
        p.opacity += p.twinkleSpeed * p.twinkleDir
        if (p.opacity >= p.maxOpacity) { p.opacity = p.maxOpacity; p.twinkleDir = -1 }
        if (p.opacity <= p.minOpacity) { p.opacity = p.minOpacity; p.twinkleDir = 1 }

        ctx.globalAlpha = p.opacity
        ctx.fillStyle = particleColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(tick)
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      init()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    tick()

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [background, minSize, maxSize, particleDensity, particleColor, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ display: 'block' }}
    />
  )
}
