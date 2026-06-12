import { useRef, useEffect, type RefObject } from "react"
import { useMotionValue, useSpring } from "motion/react"

interface AmbientVisualizerProps {
  analyserRef: RefObject<AnalyserNode | null>
  active: boolean
  side: "user" | "ai"
  phase: "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"
}

const COLORS = {
  user: ["#7C3AED", "#A78BFA", "#C4B5FD"] as const,
  ai: ["#10B981", "#6EE7B7", "#A7F3D0"] as const,
  idle: ["#2D2D3A", "#3D3D4A", "#4D4D5A"] as const,
}

export function AmbientVisualizer({
  analyserRef,
  active,
  side,
  phase,
}: AmbientVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const bars = 64

  const glowIntensity = useMotionValue(0)
  const glowSpring = useSpring(glowIntensity, { stiffness: 120, damping: 20 })

  useEffect(() => {
    glowIntensity.set(active ? 1 : 0)
  }, [active, glowIntensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const w = rect.width * dpr
      const h = rect.height * dpr
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.clearRect(0, 0, w, h)

      const glow = glowSpring.get()
      const colors = active
        ? (side === "user" ? COLORS.user : COLORS.ai)
        : COLORS.idle

      const analyser = analyserRef.current
      let values: Uint8Array
      if (analyser && active) {
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        values = data
      } else {
        values = new Uint8Array(bars).fill(0)
      }

      const barWidth = w / bars
      const gap = w * 0.004
      const radius = Math.min(barWidth * 0.3, 4)

      for (let i = 0; i < bars; i++) {
        const idx = Math.floor((i / bars) * values.length)
        const raw = values[idx] ?? 0
        const norm = raw / 255
        const targetH = Math.max(2, norm * h * 0.75 + (phase === "ready" ? Math.sin(Date.now() / 800 + i * 0.3) * 2 + 2 : 0))
        const barH = targetH

        const x = i * barWidth + gap / 2
        const bw = barWidth - gap
        const y = h - barH

        const gradient = ctx.createLinearGradient(x, h, x, 0)
        gradient.addColorStop(0, colors[0])
        gradient.addColorStop(0.5, colors[1])
        gradient.addColorStop(1, colors[2])

        ctx.globalAlpha = active ? 0.7 + glow * 0.3 : 0.15 + glow * 0.1
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, bw, barH, radius)
        ctx.fill()

        if (active && glow > 0.1) {
          ctx.globalAlpha = glow * 0.15
          ctx.shadowColor = colors[0]
          ctx.shadowBlur = 20
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyserRef, active, side, phase, glowSpring])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl"
      style={{ minHeight: "100%" }}
    />
  )
}
