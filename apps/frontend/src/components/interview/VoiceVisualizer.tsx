import { useRef, useEffect, type RefObject } from "react"

interface VoiceVisualizerProps {
  analyserRef: RefObject<AnalyserNode | null>
  active: boolean
  side: "user" | "ai"
}

export function VoiceVisualizer({
  analyserRef,
  active,
  side,
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const color =
    side === "user" ? "var(--color-accent)" : "var(--color-success)"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bars = 32
    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth * dpr
      const h = canvas.clientHeight * dpr
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.clearRect(0, 0, w, h)

      const barWidth = w / bars
      const gap = 2

      const analyser = analyserRef.current
      let values: Uint8Array

      if (analyser && active) {
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        values = data
      } else {
        values = new Uint8Array(bars).fill(0)
      }

      for (let i = 0; i < bars; i++) {
        const idx = Math.floor((i / bars) * values.length)
        const raw = values[idx] ?? 0
        const norm = raw / 255
        const barH = Math.max(2, norm * h * 0.85)

        ctx.fillStyle = color
        ctx.globalAlpha = active ? 0.85 : 0.2
        ctx.beginPath()
        const x = i * barWidth + gap / 2
        const bw = barWidth - gap
        const r = Math.min(bw / 2, 2)
        const y = h - barH
        ctx.roundRect(x, y, bw, barH, r)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyserRef, active, color])

  return (
    <canvas
      ref={canvasRef}
      className="w-24 h-6"
      style={{ width: 96, height: 24 }}
    />
  )
}
