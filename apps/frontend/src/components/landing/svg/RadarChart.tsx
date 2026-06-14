import { motion } from "motion/react"

const RADIUS = 80
const CENTER = 110
const POINTS = 6

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function hexPath(r: number): string {
  const pts = Array.from({ length: POINTS }, (_, i) => {
    const p = polarToCartesian(CENTER, CENTER, r, (360 / POINTS) * i)
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }).join(" ")
  return `${pts} Z`
}

export function RadarChart({ className = "" }: { className?: string }) {
  const outerPath = hexPath(RADIUS)
  const midPath = hexPath(RADIUS * 0.6)
  const innerPath = hexPath(RADIUS * 0.3)
  const mapPath = hexPath(RADIUS * 0.85)

  return (
    <svg viewBox="0 0 220 220" fill="none" className={className} aria-hidden>
      {/* Guidance rings */}
      <path d={outerPath} className="stroke-[var(--landing-line)]" strokeWidth="0.5" opacity="0.15" fill="none" />
      <path d={midPath} className="stroke-[var(--landing-line)]" strokeWidth="0.5" opacity="0.1" fill="none" />
      <path d={innerPath} className="stroke-[var(--landing-line)]" strokeWidth="0.5" opacity="0.08" fill="none" />

      {/* Crosshairs */}
      {Array.from({ length: POINTS }, (_, i) => {
        const p = polarToCartesian(CENTER, CENTER, RADIUS, (360 / POINTS) * i)
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={p.x}
            y2={p.y}
            className="stroke-[var(--landing-line)]"
            strokeWidth="0.5"
            opacity="0.06"
          />
        )
      })}

      {/* Filled map */}
      <motion.path
        d={mapPath}
        className="fill-[var(--landing-accent)]"
        fillOpacity="0.06"
        stroke="var(--landing-accent)"
        strokeWidth="1"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Center dot */}
      <circle cx={CENTER} cy={CENTER} r="2" className="fill-[var(--landing-accent)]" opacity="0.5" />
    </svg>
  )
}
