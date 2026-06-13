import { useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import type { InterviewSession } from "@ai-interview/shared"
import { IconTrendingUp, IconAlertTriangle, IconChartBar } from "@tabler/icons-react"

interface AiCoachCardProps {
  completed: InterviewSession[]
  totalSessions: number
}

export function AiCoachCard({ completed, totalSessions }: AiCoachCardProps) {
  const insights = useMemo(() => {
    if (completed.length === 0) return null
    const items: { text: string; color: string; icon: React.ReactNode }[] = []
    const commScores = completed.map((i) => i.communicationScore).filter((s): s is number => s != null)
    const techScores = completed.map((i) => i.technicalScore).filter((s): s is number => s != null)
    const probScores = completed.map((i) => i.problemSolvingScore).filter((s): s is number => s != null)

    if (commScores.length > 0) {
      const recent = commScores.slice(0, Math.min(3, commScores.length))
      const earlier = commScores.slice(Math.min(3, commScores.length))
      const avgR = recent.reduce((a, b) => a + b, 0) / recent.length
      const avgE = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : avgR
      if (avgR >= avgE) {
        items.push({ text: "Communication is improving", color: "#10B981", icon: <IconTrendingUp size={14} /> })
      } else {
        items.push({ text: "Communication needs attention", color: "#F59E0B", icon: <IconAlertTriangle size={14} /> })
      }
    }
    if (probScores.length > 0) {
      const avgProb = probScores.reduce((a, b) => a + b, 0) / probScores.length
      items.push({
        text: avgProb < 60 ? "You avoid discussing tradeoffs" : "Tradeoff discussions are solid",
        color: avgProb < 60 ? "#F59E0B" : "#10B981",
        icon: avgProb < 60 ? <IconAlertTriangle size={14} /> : <IconTrendingUp size={14} />,
      })
    }
    if (techScores.length > 0) {
      const avgTech = techScores.reduce((a, b) => a + b, 0) / techScores.length
      items.push({
        text: avgTech < 65 ? "Backend answers lack metrics" : "Technical answers are well-structured",
        color: avgTech < 65 ? "#EF4444" : "#10B981",
        icon: avgTech < 65 ? <IconChartBar size={14} /> : <IconTrendingUp size={14} />,
      })
    }
    return items
  }, [completed])

  if (!insights || completed.length === 0) return null

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--app-accent-bg, rgba(184,168,138,0.06)) 0%, transparent 60%)",
        border: "1px solid var(--app-accent-border, rgba(184,168,138,0.18))",
        borderRadius: "12px",
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <span
          style={{
            background: "var(--app-accent-bg, rgba(184,168,138,0.08))",
            border: "1px solid var(--app-accent-border, rgba(184,168,138,0.2))",
            color: "var(--app-accent, #b8a88a)",
            fontSize: "11px",
            fontWeight: 500,
            borderRadius: "999px",
            padding: "3px 10px",
          }}
        >
          AI COACH
        </span>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--app-accent, #b8a88a)",
          }}
        />
      </div>

      <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
        Based on your last {Math.min(totalSessions, 12)} sessions:
      </p>

      {/* Insight chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {insights.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "6px",
              background: "var(--color-bg-hover)",
              borderLeft: `3px solid ${item.color}`,
            }}
          >
            <span style={{ color: item.color, display: "flex", flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: "13px", color: "var(--color-text)" }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/interview"
        style={{
          display: "block",
          width: "100%",
          padding: "12px 20px",
          borderRadius: "8px",
          background: "var(--landing-fg, #eceae6)",
          color: "var(--landing-bg, #080808)",
          fontSize: "14px",
          fontWeight: 500,
          textDecoration: "none",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88" }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
      >
        {completed[0]?.position
          ? `${completed[0].position} \u00B7 12 min \u2192`
          : "Start Interview \u00B7 12 min \u2192"}
      </Link>
    </div>
  )
}
