import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { IconChartBar, IconClock, IconTrophy } from "@tabler/icons-react"

/* ─── Count-up hook ─── */

function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target <= 0) return
    const t0 = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - (1 - p) * (1 - p)
      setCount(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return count
}

/* ─── Score donut ring ─── */

function ScoreDonut({ value }: { value: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="5" />
      <motion.circle
        cx="30" cy="30" r={r}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        transform="rotate(-90 30 30)"
      />
      <text x="30" y="30" textAnchor="middle" dominantBaseline="central" fill="#A78BFA" fontSize="14" fontWeight={500}>
        {value}%
      </text>
    </svg>
  )
}

/* ─── Props ─── */

interface StatsSectionProps {
  totalSessions: number
  totalMinutes: number
  avgScore: number | null
}

/* ─── Component ─── */

export function StatsSection({ totalSessions, totalMinutes, avgScore }: StatsSectionProps) {
  const anSessions = useCountUp(totalSessions)
  const anMinutes = useCountUp(totalMinutes)

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {/* Sessions */}
        <div
          style={{
            padding: "20px",
            background: "rgba(124,58,237,0.06)",
            borderRight: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IconChartBar size={20} color="#7C3AED" />
          <span
            style={{
              fontSize: "40px",
              fontWeight: 600,
              color: "var(--color-text)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {anSessions}
          </span>
          <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Sessions
          </span>
        </div>

        {/* Total time */}
        <div
          style={{
            padding: "20px",
            background: "rgba(124,58,237,0.06)",
            borderRight: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IconClock size={20} color="#7C3AED" />
          <div style={{ lineHeight: 1 }}>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 600,
                color: "var(--color-text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {anMinutes}
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 400,
                color: "var(--color-text-muted)",
                verticalAlign: "super",
                lineHeight: 1,
              }}
            >
              m
            </span>
          </div>
          <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Total time
          </span>
        </div>

        {/* Avg score */}
        <div
          style={{
            padding: "20px",
            background: "rgba(124,58,237,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IconTrophy size={20} color="#7C3AED" />
          {avgScore != null ? (
            <ScoreDonut value={avgScore} />
          ) : (
            <span
              style={{
                fontSize: "40px",
                fontWeight: 600,
                color: "var(--color-text)",
                lineHeight: 1,
              }}
            >
              &mdash;
            </span>
          )}
          <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Avg score
          </span>
        </div>
      </div>
    </div>
  )
}
