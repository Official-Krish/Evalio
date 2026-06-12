import { motion } from "motion/react"
import { isToday, formatDuration } from "./helpers"
import type { InterviewSession } from "@ai-interview/shared"

interface SessionStripProps {
  mostRecent: InterviewSession & { resume?: { id: string; version: number } | null }
  onViewResume: (resumeId: string) => void
}

export function SessionStrip({ mostRecent, onViewResume }: SessionStripProps) {
  const score = mostRecent.overallScore

  return (
    <section
      style={{
        paddingBottom: "24px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--landing-fg)", marginBottom: "10px" }}>
            {mostRecent.position || "General"}
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
              {" "}&middot; {formatDuration(mostRecent.durationSeconds)}
            </span>
          </p>
          <div
            style={{
              width: "160px",
              height: "5px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              marginBottom: score != null ? "6px" : 0,
            }}
          >
            {score != null && (
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: "3px",
                  background: "#6C63FF",
                  opacity: 0.85,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(score)}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </div>
          {score != null && (
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              Clarity &middot; {Math.round(score)}%
              {mostRecent.startedAt && isToday(new Date(mostRecent.startedAt)) ? " &middot; Last session today" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {mostRecent.resume?.id && (
            <button
              onClick={() => onViewResume(mostRecent.resume!.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 20px",
                borderRadius: "6px",
                background: "#6C63FF",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: 1,
                border: "none",
                cursor: "pointer",
              }}
            >
              Resume
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
