import { motion } from "motion/react"

interface CompanyOrbitProps {
  activeIndex: number | null
  companies: CompanyDef[]
  onHover: (index: number | null) => void
  className?: string
}

export interface CompanyDef {
  name: string
  listen: string
  angle: number
}

const CX = 300
const CY = 280
const ORBIT_RADIUS = 218

function polarPos(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY + Math.sin(rad) * radius,
  }
}

/** Returns text-anchor and label offset for a given angle so labels never overlap the orbit dot */
function labelAnchor(angleDeg: number): {
  textAnchor: "start" | "middle" | "end"
  dx: number
  dy: number
} {
  // normalise to 0–360
  const a = ((angleDeg % 360) + 360) % 360

  if (a >= 337.5 || a < 22.5) return { textAnchor: "middle", dx: 0, dy: -16 }  // top
  if (a >= 22.5  && a < 67.5) return { textAnchor: "start",  dx: 14, dy: -10 }  // top-right
  if (a >= 67.5  && a < 112.5) return { textAnchor: "start", dx: 16, dy: 4   }  // right
  if (a >= 112.5 && a < 157.5) return { textAnchor: "start", dx: 14, dy: 16  }  // bottom-right
  if (a >= 157.5 && a < 202.5) return { textAnchor: "middle", dx: 0, dy: 20  }  // bottom
  if (a >= 202.5 && a < 247.5) return { textAnchor: "end",   dx: -14, dy: 16 }  // bottom-left
  if (a >= 247.5 && a < 292.5) return { textAnchor: "end",   dx: -16, dy: 4  }  // left
  return { textAnchor: "end", dx: -14, dy: -10 }                                 // top-left
}

export function CompanyOrbit({
  activeIndex,
  companies,
  onHover,
  className = "",
}: CompanyOrbitProps) {
  const pulse = activeIndex !== null

  return (
    <svg
      viewBox="0 0 600 560"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.12" />
          <stop offset="70%" stopColor="var(--landing-accent)" stopOpacity="0.02" />
          <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0" />
        </radialGradient>
        <filter id="orbit-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="12"
            floodColor="var(--landing-accent)"
            floodOpacity="0.08"
          />
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="300" cy="280" r="200" fill="url(#orbit-glow)" />

      {/* Concentric ring guides */}
      {[200, 155, 105].map((r, i) => (
        <motion.circle
          key={r}
          cx="300"
          cy="280"
          r={r}
          stroke="var(--landing-line)"
          strokeWidth="0.75"
          fill="none"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 0.35 - i * 0.08, scale: 1 }}
          transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "300px 280px" }}
        />
      ))}

      {/* 
        Dashed orbit — TRUE circle at r=ORBIT_RADIUS.
        Previously this was a hand-drawn bezier path which produced a lopsided shape.
        A <circle> is always geometrically perfect.
      */}
      <motion.circle
        cx="300"
        cy="280"
        r={ORBIT_RADIUS}
        stroke="var(--landing-accent)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 8"
        opacity="0.18"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.18 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Spoke line to active company */}
      {activeIndex !== null && (() => {
        const pos = polarPos(companies[activeIndex]!.angle, ORBIT_RADIUS)
        return (
          <motion.line
            x1="300"
            y1="280"
            x2={pos.x}
            y2={pos.y}
            stroke="var(--landing-accent)"
            strokeWidth="1"
            opacity="0.35"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4 }}
          />
        )
      })()}

      {/* 
        Company labels as SVG <text> elements.
        Positioning is purely within SVG coordinate space — no DOM overlay math.
        Each label has a small dot at its orbit point for clarity.
      */}
      {companies.map((company, i) => {
        const pos = polarPos(company.angle, ORBIT_RADIUS)
        const anchor = labelAnchor(company.angle)
        const isActive = activeIndex === i

        return (
          <motion.g
            key={company.name}
            style={{ cursor: "default" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0.55 }}
            transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Orbit dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 3.5 : 2.5}
              fill="var(--landing-accent)"
              opacity={isActive ? 0.9 : 0.4}
            />
            {/* Label text */}
            <text
              x={pos.x + anchor.dx}
              y={pos.y + anchor.dy}
              textAnchor={anchor.textAnchor}
              dominantBaseline="central"
              fill={isActive ? "var(--landing-fg)" : "var(--landing-fg-muted)"}
              fontSize={isActive ? 14 : 12}
              fontWeight={isActive ? 500 : 400}
              style={{
                transition: "all 0.3s ease",
                filter: isActive
                  ? "drop-shadow(0 2px 8px rgba(184,168,138,0.35))"
                  : "none",
                userSelect: "none",
              }}
            >
              {company.name}
            </text>
          </motion.g>
        )
      })}

      {/* Center "You" node */}
      <motion.circle
        cx="300"
        cy="280"
        r={pulse ? 28 : 22}
        fill="var(--landing-accent)"
        fillOpacity={pulse ? 0.14 : 0.08}
        stroke="var(--landing-accent)"
        strokeWidth="1"
        strokeOpacity={0.35}
        filter="url(#orbit-shadow)"
        animate={{ r: pulse ? 28 : 22 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      />
      <text
        x="300"
        y="284"
        textAnchor="middle"
        fill="var(--landing-fg-muted)"
        fontSize="11"
        letterSpacing="0.14em"
        opacity="0.6"
      >
        You
      </text>
    </svg>
  )
}