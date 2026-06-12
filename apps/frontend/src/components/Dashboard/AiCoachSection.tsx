import { useMemo } from "react"
import { Link } from "react-router-dom"
import type { InterviewSession } from "@ai-interview/shared"

interface AiCoachSectionProps {
  completed: InterviewSession[]
  totalSessions: number
}

export function AiCoachSection({ completed, totalSessions }: AiCoachSectionProps) {
  const insights = useMemo(() => {
    if (completed.length === 0) return null
    const items: string[] = []
    const commScores = completed.map((i) => i.communicationScore).filter((s): s is number => s != null)
    const techScores = completed.map((i) => i.technicalScore).filter((s): s is number => s != null)
    const probScores = completed.map((i) => i.problemSolvingScore).filter((s): s is number => s != null)

    if (commScores.length > 0) {
      const recent = commScores.slice(0, Math.min(3, commScores.length))
      const earlier = commScores.slice(Math.min(3, commScores.length))
      const avgR = recent.reduce((a, b) => a + b, 0) / recent.length
      const avgE = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : avgR
      items.push(avgR >= avgE ? "Communication is improving" : "Communication needs attention")
    }
    if (probScores.length > 0) {
      const avgProb = probScores.reduce((a, b) => a + b, 0) / probScores.length
      items.push(avgProb < 60 ? "You avoid discussing tradeoffs" : "Tradeoff discussions are solid")
    }
    if (techScores.length > 0) {
      const avgTech = techScores.reduce((a, b) => a + b, 0) / techScores.length
      items.push(avgTech < 65 ? "Backend answers lack metrics" : "Technical answers are well-structured")
    }

    return items
  }, [completed])

  if (!insights || completed.length === 0) return null

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginBottom: "12px",
          fontWeight: 600,
        }}
      >
        AI Coach
      </p>

      <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
        Based on your last {Math.min(totalSessions, 12)} sessions:
      </p>

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {insights.map((item, i) => (
          <li key={i} style={{ fontSize: "13px", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--color-accent)" }}>&bull;</span>
            {item}
          </li>
        ))}
      </ul>

      <Link
        to="/interview"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "8px",
          background: "var(--color-accent)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 500,
          textDecoration: "none",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85" }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
      >
        <span>&rarr;</span>
        {completed[0]?.position
          ? `${completed[0].position} (12 min)`
          : "Start Interview (12 min)"}
      </Link>
    </div>
  )
}
