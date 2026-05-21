/**
 * Minimaler Canvas-Confetti-Effekt ohne Dependencies.
 *
 * `fireConfetti(target, opts?)` malt ~3 Sekunden lang Konfetti vom unteren
 * Bildschirmrand in den übergebenen Container. Container muss `position:
 * relative|absolute` haben — wir spannen ein absolutes Canvas darin auf.
 */

type ConfettiOptions = {
  duration?: number
  particleCount?: number
  colors?: string[]
  /** Confetti shoots from this anchor (0..1 in container coords). Default: bottom-center. */
  origin?: { x: number; y: number }
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  shape: 'rect' | 'circle'
  rotation: number
  rotationSpeed: number
  life: number
}

const DEFAULT_COLORS = ['#1a2332', '#00b0f0', '#10b981', '#fbbf24', '#ec4899', '#a855f7']

export function fireConfetti(container: HTMLElement, opts: ConfettiOptions = {}): () => void {
  const duration = opts.duration ?? 3000
  const totalParticles = opts.particleCount ?? 140
  const colors = opts.colors ?? DEFAULT_COLORS
  const origin = opts.origin ?? { x: 0.5, y: 0.95 }

  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.inset = '0'
  canvas.style.pointerEvents = 'none'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  container.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    container.removeChild(canvas)
    return () => {}
  }

  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const particles: Particle[] = []
  const startTime = performance.now()
  let lastEmit = startTime
  const emitInterval = duration / totalParticles * 0.6

  function spawnParticle() {
    const angle = (Math.random() - 0.5) * Math.PI * 0.9 - Math.PI / 2
    const speed = 6 + Math.random() * 6
    particles.push({
      x: origin.x * rect.width,
      y: origin.y * rect.height,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      life: 1,
    })
  }

  let raf = 0
  let cancelled = false

  function tick(now: number) {
    const elapsed = now - startTime
    ctx!.clearRect(0, 0, rect.width, rect.height)

    if (elapsed < duration && now - lastEmit > emitInterval) {
      spawnParticle()
      lastEmit = now
    }

    for (const p of particles) {
      p.vy += 0.22 // Gravitation
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.rotationSpeed
      p.life -= 0.006

      if (p.life <= 0 || p.y > rect.height + 20) continue

      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.rotation)
      ctx!.globalAlpha = Math.max(p.life, 0)
      ctx!.fillStyle = p.color
      if (p.shape === 'rect') {
        ctx!.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5)
      } else {
        ctx!.beginPath()
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.restore()
    }

    const aliveCount = particles.filter((p) => p.life > 0 && p.y <= rect.height + 20).length
    if (cancelled) return
    if (elapsed < duration || aliveCount > 0) {
      raf = requestAnimationFrame(tick)
    } else {
      cleanup()
    }
  }

  function cleanup() {
    cancelAnimationFrame(raf)
    if (canvas.parentElement === container) {
      container.removeChild(canvas)
    }
  }

  raf = requestAnimationFrame(tick)

  return () => {
    cancelled = true
    cleanup()
  }
}
