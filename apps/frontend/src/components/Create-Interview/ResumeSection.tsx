import { motion } from "motion/react"
import { api } from "../../lib/api"
import { fileNameFromUrl, detectSections } from "./helpers"
import { FileUpload } from "../ui/file-upload"
import type { Resume } from "@ai-interview/shared"
import toast from "react-hot-toast"

interface ResumeSectionProps {
  resumes: Resume[]
  selectedResumeId: string | undefined
  githubUrl: string
  githubOpen: boolean
  onResumeSelect: (id: string) => void
  onPreviewResume: (id: string) => void
  onResumesRefetch: () => void
  onGithubUrlChange: (url: string) => void
  onGithubToggle: () => void
}

export function ResumeSection({
  resumes,
  selectedResumeId,
  githubUrl,
  githubOpen,
  onResumeSelect,
  onPreviewResume,
  onResumesRefetch,
  onGithubUrlChange,
  onGithubToggle,
}: ResumeSectionProps) {
  const selectedResume = selectedResumeId
    ? resumes.find((r) => r.id === selectedResumeId) ?? null
    : null

  const detected = selectedResume ? detectSections(selectedResume.extractedText) : null

  const handleUploadResume = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    try {
      await api.uploadResume(file)
      toast.success("Resume uploaded!")
      onResumesRefetch()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div style={{ marginBottom: "48px" }}>
      {/* Animated drag zone via FileUpload */}
      <FileUpload onChange={handleUploadResume} />

      {resumes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "20px" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "8px",
            }}
          >
            Previously uploaded
          </p>
          {resumes.map((r) => {
            const active = selectedResumeId === r.id
            const label = fileNameFromUrl(r.originalUrl) ?? `Resume v${r.version}`
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: active ? "1.5px solid #6366f1" : "1px solid var(--color-border-light)",
                  background: active ? "rgba(99,102,241,0.06)" : "transparent",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onResumeSelect(r.id)}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: active ? "rgba(99,102,241,0.12)" : "var(--color-bg-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "14px",
                    color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                  }}
                >
                  {active ? (
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    "\u{1F4C4}"
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: active ? "var(--color-text)" : "var(--color-text-secondary)", margin: 0, lineHeight: 1.3 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.3, marginTop: "1px" }}>
                    {new Date(r.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPreviewResume(r.id)
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--color-border-light)",
                    background: active ? "rgba(99,102,241,0.1)" : "transparent",
                    color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  View
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {selectedResume && detected && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Resume loaded &middot;{" "}
          {detected.projects > 0 && `${detected.projects} projects`}
          {detected.projects > 0 && detected.skills > 0 && " \u00B7 "}
          {detected.skills > 0 && `${detected.skills} key skills`}
          {" "}detected.
        </motion.div>
      )}

      {selectedResume && (
        <div style={{ marginTop: "16px" }}>
          {githubOpen ? (
            <div>
              <input
                value={githubUrl}
                onChange={(e) => onGithubUrlChange(e.target.value)}
                placeholder="https://github.com/username"
                style={{
                  width: "100%",
                  fontSize: "14px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-hover)",
                  color: "var(--color-text)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          ) : (
            <button
              onClick={onGithubToggle}
              style={{
                fontSize: "13px",
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              + Add GitHub for code-specific questions &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
