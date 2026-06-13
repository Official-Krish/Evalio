import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { greeting, computeStreak } from "./helpers"
import type { InterviewSession } from "@ai-interview/shared"

interface ReadinessHeroProps {
  user: { name?: string | null } | null | undefined
  totalSessions: number
  readinessScore: number
  interviews: InterviewSession[]
}

function useCountUp(target: number, duration = 800) {
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

function ReadinessArc({ score }: { score: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const anScore = useCountUp(score)

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ position: "relative", width: "100px", height: "100px" }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--app-accent-bg, rgba(184,168,138,0.12))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="var(--app-accent, #b8a88a)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 600, color: "var(--app-accent, #b8a88a)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {anScore}<span style={{ fontSize: "14px", fontWeight: 400 }}>%</span>
          </span>
          </div>
        </div>
        <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
        READINESS
      </span>
    </div>
  )
}

export function ReadinessHero({ user, totalSessions, readinessScore, interviews }: ReadinessHeroProps) {
  const streak = computeStreak(interviews)

  return (
    <section>
      {user && (
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
          {greeting()}, {user.name?.split(" ")[0]}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 300,
            color: "var(--color-text)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {totalSessions > 0
            ? `${totalSessions} session${totalSessions !== 1 ? "s" : ""} in.`
            : "Start your first session."}
        </h1>

        {totalSessions > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <ReadinessArc score={readinessScore} />
            <div>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                Interview Preparedness
              </p>
              <div
                style={{
                  height: "2px",
                  borderRadius: "999px",
                  background: "var(--app-accent-bg, rgba(184,168,138,0.12))",
                  overflow: "hidden",
                  width: "100px",
                  marginTop: "6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "999px",
                    background: "var(--app-accent, #b8a88a)",
                    width: `${readinessScore}%`,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>
            {streak >= 2 && (
              <span style={{ fontSize: "12px", color: "var(--color-warning)", marginLeft: "4px" }}>
                &#x1F525; {streak}-day streak
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
