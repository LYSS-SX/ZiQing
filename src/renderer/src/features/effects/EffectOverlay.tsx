import { useEffect, useRef } from 'react'
import './effects.css'

export type EffectKind = 'none' | 'fireworks' | 'slap' | 'flip'

interface Props {
  kind: EffectKind
  level?: 'off' | 'light' | 'standard' | 'wild' | 'full'
  reduceMotion?: boolean
  onDone?: () => void
}

export function EffectOverlay({ kind, level = 'full', reduceMotion, onDone }: Props): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (kind === 'none' || reduceMotion || level === 'off') {
      if (kind !== 'none') {
        const t = setTimeout(() => onDone?.(), 400)
        return () => clearTimeout(t)
      }
      return
    }

    if (kind === 'slap') {
      const t = setTimeout(() => onDone?.(), level === 'wild' ? 900 : 650)
      return () => clearTimeout(t)
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const dpr = window.devicePixelRatio || 1
    const resize = (): void => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      life: number
      color: string
      size: number
    }
    const particles: Particle[] = []
    const colors =
      kind === 'flip'
        ? ['#ffd700', '#fff1a8', '#ff8c00', '#ffffff']
        : ['#ff4d6d', '#ffd166', '#06d6a0', '#4cc9f0', '#c77dff', '#ffffff']

    const bursts = level === 'full' || level === 'wild' ? 6 : 3
    for (let b = 0; b < bursts; b++) {
      const cx = window.innerWidth * (0.2 + Math.random() * 0.6)
      const cy = window.innerHeight * (0.15 + Math.random() * 0.35)
      const count = level === 'full' || level === 'wild' ? 55 : 30
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 6
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3
        })
      }
    }

    const start = performance.now()
    const tick = (t: number): void => {
      if (!running) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.life -= 0.012
        if (p.life <= 0) continue
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (t - start < 1600 && particles.some((p) => p.life > 0)) {
        raf = requestAnimationFrame(tick)
      } else {
        onDone?.()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [kind, level, reduceMotion, onDone])

  if (kind === 'none') return null

  if (kind === 'slap' && level !== 'off' && !reduceMotion) {
    return (
      <div className={`slap-layer slap-${level === 'light' ? 'light' : 'wild'}`} onAnimationEnd={() => onDone?.()}>
        <div className="slap-flash" />
        <div className="slap-hand" aria-hidden>
          🖐️
        </div>
        <div className="slap-text">啪！再试一次也能翻盘</div>
      </div>
    )
  }

  if (kind === 'fireworks' || kind === 'flip') {
    if (reduceMotion || level === 'off') {
      return (
        <div className="toast-success" onAnimationEnd={() => onDone?.()}>
          {kind === 'flip' ? '翻盘成功！' : '答对啦！'}
        </div>
      )
    }
    return <canvas ref={canvasRef} className="fx-canvas" />
  }

  return null
}
