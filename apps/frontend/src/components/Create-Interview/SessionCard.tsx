import { interviewers } from "./interviewers"
import { fileNameFromUrl } from "./helpers"
import type { Resume } from "@ai-interview/shared"

interface SessionCardProps {
  position: string
  customPosition: string
  selectedResumeId: string | undefined
  resumes: Resume[]
  isPending: boolean
  onCreate: () => void
}

export function SessionCard({ position, customPosition, selectedResumeId, resumes, isPending, onCreate }: SessionCardProps) {
  const selectedRole = interviewers.find((r) => r.title === position) ?? null
  const roleTitle = position === "custom" ? customPosition || "Custom role" : selectedRole?.title ?? "Custom role"
  const duration = selectedRole?.duration ?? "45 min"
  const icon = selectedRole?.icon ?? "</>"
  const selectedResume = selectedResumeId ? resumes.find((r) => r.id === selectedResumeId) ?? null : null
  const resumeLabel = selectedResume ? (fileNameFromUrl(selectedResume.originalUrl) ?? "Resume") : null
  const ready = !!position && !!selectedResumeId

  if (!ready) return null

  return (
    <div
      style={{
        position: "sticky",
        bottom: "24px",
        zIndex: 20,
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(20,20,30,0.92)",
        backdropFilter: "blur(16px)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(99,102,241,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#818cf8",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#E2E8F0", lineHeight: 1.2 }}>
            {roleTitle}
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.2 }}>
            {resumeLabel} &middot; ~{duration}
          </span>
        </div>
      </div>

      <button
        onClick={onCreate}
        disabled={isPending}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "none",
          background: "#6366f1",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.5 : 1,
          position: "relative",
          overflow: "hidden",
        }}
        className="hover:brightness-110 transition-all"
      >
        {isPending ? "Starting..." : `Start Interview \u2192`}
      </button>
    </div>
  )
}
