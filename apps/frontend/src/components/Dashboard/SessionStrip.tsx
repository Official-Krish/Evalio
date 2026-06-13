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
        borderBottom: "1px solid var(--color-border-light)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--color-text)", marginBottom: "6px" }}>
            {mostRecent.position || "General"}
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 400 }}>
              {" "}&middot; {formatDuration(mostRecent.durationSeconds)}
            </span>
          </p>
          {mostRecent.companyName && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(99,102,241,0.1)",
                color: "#818CF8",
                fontFamily: "monospace",
              }}>
                {mostRecent.companyName}
              </span>
              {mostRecent.interviewStyle && (
                <span style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "rgba(251,191,36,0.1)",
                  color: "#FCD34D",
                }}>
                  {mostRecent.interviewStyle === "SUPPORTIVE" ? "Supportive" : mostRecent.interviewStyle === "PROFESSIONAL" ? "Professional" : mostRecent.interviewStyle === "CHALLENGING" ? "Challenging" : "Bar Raiser"}
                </span>
              )}
              {mostRecent.interviewDepth && (
                <span style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "rgba(52,211,153,0.1)",
                  color: "#6EE7B7",
                }}>
                  {mostRecent.interviewDepth === "STANDARD" ? "Standard" : mostRecent.interviewDepth === "PROBING" ? "Probing" : mostRecent.interviewDepth === "CHALLENGE" ? "Challenge" : "Bar Raiser"}
                </span>
              )}
            </div>
          )}
          <div
            style={{
              width: "160px",
              height: "5px",
              borderRadius: "3px",
              background: "var(--color-bg-hover)",
              overflow: "hidden",
              marginBottom: score != null ? "6px" : 0,
            }}
          >
            {score != null && (
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: "3px",
                  background: "var(--color-accent)",
                  opacity: 0.85,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(score)}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </div>
          {score != null && (
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
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
                background: "var(--color-accent)",
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
