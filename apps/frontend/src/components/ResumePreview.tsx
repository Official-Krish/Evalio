import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { api } from "../lib/api"
import type { Resume } from "@ai-interview/shared"

interface ResumePreviewProps {
  resumeId: string | null | undefined
  open: boolean
  onClose: () => void
}

export function ResumePreview({ resumeId, open, onClose }: ResumePreviewProps) {
  const { data: resume } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(),
    select: (d) => (d.resumes as Resume[]).find((r) => r.id === resumeId),
    enabled: open && !!resumeId,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--landing-bg)] border border-[var(--landing-line)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--landing-line)]">
          <h3 className="text-sm font-medium text-[var(--landing-fg)]">Resume Preview</h3>
          <button onClick={onClose} className="text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0">
          {resume?.originalUrl ? (
            <iframe
              src={resume.originalUrl}
              className="w-full h-full"
              style={{ minHeight: "70vh" }}
              title="Resume PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                No PDF available for this resume.
              </p>
            </div>
          )}
        </div>

        {resume?.originalUrl && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--landing-line)]">
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              v{resume.version} &middot; {new Date(resume.uploadedAt).toLocaleDateString()}
            </span>
            <a
              href={resume.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "13px",
                color: "#6C63FF",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              Open in new tab &rarr;
            </a>
          </div>
        )}
      </motion.div>
    </div>
  )
}
