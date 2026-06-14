import { motion } from "motion/react"

interface Peak {
  label: string
  x: number
  height: number // 0-1 — higher means taller peak
}

const peaks: Peak[] = [
  { label: "Communication", x: 80, height: 0.72 },
  { label: "Product", x: 180, height: 0.58 },
  { label: "Technical", x: 280, height: 0.85 },
  { label: "Leadership", x: 380, height: 0.65 },
  { label: "Culture", x: 460, height: 0.52 },
  { label: "Growth", x: 540, height: 0.78 },
]

// Base Y for the terrain line, and amplitude range
const BASE_Y = 240
const MIN_Y = 100
const RANGE = BASE_Y - MIN_Y // 140px of vertical space

/** Get the Y position of a peak on the terrain */
function peakY(height: number): number {
  return BASE_Y - height * RANGE
}

/** Build a smooth terrain path through all peak points */
function buildTerrainPath(): string {
  const points = peaks.map((p) => ({ x: p.x, y: peakY(p.height) }))

  // Extend edges for a natural lead-in/out
  const startX = 20
  const endX = 600
  const startY = BASE_Y - 0.3 * RANGE
  const endY = BASE_Y - 0.4 * RANGE

  const allPoints = [
    { x: startX, y: startY },
    ...points,
    { x: endX, y: endY },
  ]

  // Build smooth cubic bezier through points using Catmull-Rom → Bezier conversion
  let d = `M ${allPoints[0]!.x} ${allPoints[0]!.y}`
  for (let i = 0; i < allPoints.length - 1; i++) {
    const p0 = allPoints[Math.max(0, i - 1)]!
    const p1 = allPoints[i]!
    const p2 = allPoints[i + 1]!
    const p3 = allPoints[Math.min(allPoints.length - 1, i + 2)]!

    const tension = 0.35
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function buildTerrainFill(): string {
  return buildTerrainPath() + ` L 600 280 L 20 280 Z`
}

function contourPath(offset: number, scale: number): string {
  const points = peaks.map((p) => ({
    x: p.x,
    y: peakY(p.height * scale) + offset,
  }))
  const startX = 20
  const endX = 600
  const startY = BASE_Y - 0.3 * RANGE * scale + offset
  const endY = BASE_Y - 0.4 * RANGE * scale + offset

  const allPoints = [{ x: startX, y: startY }, ...points, { x: endX, y: endY }]

  let d = `M ${allPoints[0]!.x} ${allPoints[0]!.y}`
  for (let i = 0; i < allPoints.length - 1; i++) {
    const p0 = allPoints[Math.max(0, i - 1)]!
    const p1 = allPoints[i]!
    const p2 = allPoints[i + 1]!
    const p3 = allPoints[Math.min(allPoints.length - 1, i + 2)]!

    const tension = 0.35
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

interface TerrainMapProps {
  activeIndex: number
  drawProgress?: number
  className?: string
}

export function TerrainMap({ activeIndex, drawProgress = 1, className = "" }: TerrainMapProps) {
  return (
    <svg viewBox="0 0 620 300" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="terrain-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0.02" />
        </linearGradient>
        <filter id="terrain-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background contour lines */}
      {[
        { offset: 20, scale: 0.85, opacity: 0.2 },
        { offset: 40, scale: 0.65, opacity: 0.15 },
        { offset: 55, scale: 0.45, opacity: 0.1 },
      ].map((c, i) => (
        <motion.path
          key={i}
          d={contourPath(c.offset, c.scale)}
          stroke="var(--landing-line)"
          strokeWidth="0.75"
          fill="none"
          opacity={c.opacity}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: drawProgress }}
          transition={{ duration: 1.8, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}

      {/* Main terrain fill */}
      <motion.path
        d={buildTerrainFill()}
        fill="url(#terrain-fill)"
        stroke="var(--landing-accent)"
        strokeWidth="1"
        strokeOpacity="0.25"
        initial={{ opacity: 0 }}
        animate={{ opacity: drawProgress }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Peak dots + labels — all sitting directly on the terrain line */}
      {peaks.map((peak, i) => {
        const isActive = i === activeIndex
        const dotY = peakY(peak.height)
        return (
          <g key={peak.label}>
            {/* Vertical dashed line from base to peak */}
            <motion.line
              x1={peak.x}
              y1={BASE_Y}
              x2={peak.x}
              y2={dotY - 8}
              stroke="var(--landing-accent)"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity={isActive ? 0.5 : 0.15}
              animate={{ opacity: isActive ? 0.5 : 0.15 }}
              transition={{ duration: 0.4 }}
            />
            {/* Peak dot */}
            <motion.circle
              cx={peak.x}
              cy={dotY}
              r={isActive ? 7 : 4}
              fill="var(--landing-accent)"
              fillOpacity={isActive ? 0.7 : 0.25}
              filter={isActive ? "url(#terrain-glow)" : undefined}
              animate={{ r: isActive ? 7 : 4, fillOpacity: isActive ? 0.7 : 0.25 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
            {/* Label above peak */}
            <motion.text
              x={peak.x}
              y={dotY - 16}
              textAnchor="middle"
              fill="var(--landing-fg)"
              fontSize="9"
              letterSpacing="0.06em"
              opacity={isActive ? 0.9 : 0.25}
              animate={{ opacity: isActive ? 0.9 : 0.25 }}
            >
              {peak.label.split(" ")[0]}
            </motion.text>
          </g>
        )
      })}

      {/* Active highlight ring */}
      <motion.circle
        cx={peaks[activeIndex]?.x ?? 280}
        cy={peakY(peaks[activeIndex]?.height ?? 0.85)}
        r="20"
        fill="var(--landing-accent)"
        fillOpacity="0.06"
        animate={{
          cx: peaks[activeIndex]?.x ?? 280,
          cy: peakY(peaks[activeIndex]?.height ?? 0.85),
        }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </svg>
  )
}
