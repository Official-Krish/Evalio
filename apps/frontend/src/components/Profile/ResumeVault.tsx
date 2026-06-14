import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { fileNameFromUrl } from "../Create-Interview/helpers"
import type { Resume } from "@evalio/shared"
import { IconFileTypePdf, IconPlus, IconChevronRight } from "@tabler/icons-react"

interface ResumeVaultProps {
  resumes: Resume[]
  onUpload?: () => void
}

const MAX_VISIBLE = 3

export function ResumeVault({ resumes, onUpload }: ResumeVaultProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? resumes : resumes.slice(0, MAX_VISIBLE)

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid var(--color-border-light)",
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          Resume vault
        </span>
        {onUpload && (
          <button
            onClick={onUpload}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--app-accent, #b8a88a)",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--app-accent-bg, rgba(184,168,138,0.1))" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
          >
            <IconPlus size={18} />
          </button>
        )}
      </div>

      {resumes.length === 0 ? (
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", padding: "20px", margin: 0, textAlign: "center" }}>
          No resumes uploaded yet.
        </p>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {visible.map((r, i) => (
              <ResumeRow
                key={r.id}
                resume={r}
                isLast={i === visible.length - 1 || (!showAll && i === MAX_VISIBLE - 1 && resumes.length <= MAX_VISIBLE)}
              />
            ))}
          </AnimatePresence>

          {resumes.length > MAX_VISIBLE && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                width: "100%",
                padding: "10px",
                background: "none",
                border: "none",
                borderTop: "0.5px solid var(--color-border-light)",
                color: "var(--color-text-muted)",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--app-accent, #b8a88a)" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)" }}
            >
              {showAll ? "Show less" : `View all (${resumes.length})`}
              <IconChevronRight size={12} style={{ transform: showAll ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Row ─── */

function ResumeRow({ resume, isLast }: { resume: Resume; isLast: boolean }) {
  const label = fileNameFromUrl(resume.originalUrl) ?? `Resume v${resume.version}`
  const uploaded = new Date(resume.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 20px",
        borderBottom: isLast ? "none" : "0.5px solid var(--color-border-light)",
      }}
    >
      <IconFileTypePdf size={18} color="var(--app-accent, #b8a88a)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text)", margin: 0, lineHeight: 1.3 }}>
          {label}
        </p>
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "1px 0 0", lineHeight: 1.3 }}>
          Uploaded {uploaded}
        </p>
      </div>
    </motion.div>
  )
}
