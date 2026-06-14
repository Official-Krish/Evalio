import { useMemo } from "react"
import type { InterviewSession } from "@evalio/shared"

interface WeeklySidebarProps {
  sessions: number
  goal: number
  progress: number
  avgClarity: number | null
  best: (InterviewSession & { position: string | null }) | null
  sparklineScores: number[]
}

function Sparkline({ scores }: { scores: number[] }) {
  const path = useMemo(() => {
    if (scores.length < 2) return ""
    const w = 80
    const h = 24
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const range = max - min || 1
    const points = scores.map((s, i) => {
      const x = (i / (scores.length - 1)) * w
      const y = h - ((s - min) / range) * (h - 4) - 2
      return `${x},${y}`
    })
    return `M${points.join(" L")}`
  }, [scores])

  if (scores.length < 2) return null

  return (
    <svg width="80" height="24" viewBox="0 0 80 24" fill="none" style={{ display: "block" }}>
      <path d={path} stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WeeklySidebar({ sessions, goal, progress, avgClarity, best, sparklineScores }: WeeklySidebarProps) {
  return (
    <div className="hidden lg:block pt-10">
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "16px",
        }}
      >
        THIS WEEK
      </p>

      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            height: "3px",
            borderRadius: "2px",
            background: "var(--color-bg-hover)",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "2px",
              background: "var(--color-accent)",
              width: `${progress * 100}%`,
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          {sessions} of {goal} sessions
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "1px" }}>Sessions</p>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>{sessions}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "1px" }}>Avg clarity</p>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>
            {avgClarity != null ? `${Math.round(avgClarity)}%` : "\u2014"}
          </p>
        </div>
      </div>

      {sparklineScores.length >= 2 && (
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "8px",
            }}
          >
            TREND
          </p>
          <Sparkline scores={sparklineScores} />
        </div>
      )}

      {best && (
        <div>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "6px",
            }}
          >
            BEST SESSION
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
            {best.position || "Interview"}
          </p>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {best.overallScore != null ? `${Math.round(best.overallScore)}% clarity` : ""}
            &nbsp;&middot;&nbsp;
            {new Date(best.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      )}
    </div>
  )
}
