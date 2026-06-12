import { useRef, useEffect, type RefObject } from "react"

type SessionPhase = "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"

interface PresenceOrbProps {
  analyserRef: RefObject<AnalyserNode | null>
  phase: SessionPhase
  side: "user" | "ai"
}

export function PresenceOrb({ analyserRef, phase, side }: PresenceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = (t: number) => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height) * dpr
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }

      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const baseR = size * 0.18

      const analyser = analyserRef.current
      let energy = 0
      if (analyser && (phase === "ai_speaking" || phase === "user_speaking")) {
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]!
        energy = sum / data.length / 255
      } else if (phase === "ready") {
        energy = 0.08 + Math.sin(t / 900) * 0.04
      }

      const accent =
        side === "ai" && phase === "ai_speaking"
          ? "rgba(184, 168, 138, 0.9)"
          : side === "user" && phase === "user_speaking"
            ? "rgba(236, 234, 230, 0.85)"
            : "rgba(236, 234, 230, 0.35)"

      // Expanding rings
      for (let i = 0; i < 4; i++) {
        const pulse = ((t / 2400 + i * 0.25) % 1)
        const r = baseR + pulse * size * 0.32 + energy * size * 0.08
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * (1 - pulse) + energy * 0.06})`
        ctx.lineWidth = 1 * dpr
        ctx.stroke()
      }

      // Core orb
      const coreR = baseR * (0.55 + energy * 0.45)
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
      grad.addColorStop(0, accent.replace("0.9", "0.25").replace("0.85", "0.22").replace("0.35", "0.12"))
      grad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fill()

      // Wave trace ring
      const points = 64
      ctx.beginPath()
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const wobble =
          Math.sin(angle * 6 + t / 400) * energy * 12 * dpr +
          Math.sin(angle * 3 - t / 600) * 4 * dpr
        const r = baseR * 1.35 + wobble
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = accent
      ctx.globalAlpha = 0.35 + energy * 0.45
      ctx.lineWidth = 1.25 * dpr
      ctx.stroke()
      ctx.globalAlpha = 1

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 3 * dpr, 0, Math.PI * 2)
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.7 + energy * 0.3
      ctx.fill()
      ctx.globalAlpha = 1

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyserRef, phase, side])

  return (
    <canvas
      ref={canvasRef}
      className="interview-presence-orb"
      aria-hidden
    />
  )
}
