import { motion } from "motion/react"
import { interviewers } from "./interviewers"

interface InterviewerCardsProps {
  position: string
  customPosition: string
  onPositionChange: (pos: string) => void
  onCustomPositionChange: (pos: string) => void
}

export function InterviewerCards({ position, customPosition, onPositionChange, onCustomPositionChange }: InterviewerCardsProps) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {interviewers.map((role) => {
          const active = position === role.title
          return (
            <motion.button
              key={role.title}
              onClick={() => onPositionChange(role.title)}
              whileTap={{ scale: 0.98 }}
              style={{
                position: "relative",
                textAlign: "left",
                padding: "20px",
                borderRadius: "12px",
                border: active
                  ? "1.5px solid #6366f1"
                  : "1px solid var(--color-border-light)",
                background: active
                  ? "rgba(99,102,241,0.06)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                overflow: "hidden",
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.06)"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--color-border-light)"
                  e.currentTarget.style.boxShadow = "none"
                }
              }}
            >
              {active && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "-40px",
                      right: "-40px",
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "var(--color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: "22px",
                      lineHeight: 1,
                      color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                      transition: "color 0.2s",
                    }}
                  >
                    {role.icon}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: active ? "var(--color-text)" : "var(--color-text)",
                    lineHeight: 1.2,
                    margin: 0,
                    transition: "color 0.2s",
                  }}
                >
                  {role.title}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: active ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {role.tagline}
                </p>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                  {role.focus.map((f) => (
                    <span
                      key={f}
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: active
                          ? "1px solid rgba(99,102,241,0.3)"
                          : "1px solid var(--color-border-light)",
                        background: active
                          ? "rgba(99,102,241,0.1)"
                          : "var(--color-bg-hover)",
                        color: active ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {position === "custom" && (
        <div style={{ marginTop: "12px" }}>
          <input
            value={customPosition}
            onChange={(e) => onCustomPositionChange(e.target.value)}
            placeholder="Enter a custom role..."
            style={{
              width: "100%",
              fontSize: "14px",
              padding: "12px 16px",
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
      )}

      <button
        onClick={() => onPositionChange(position === "custom" ? "" : "custom")}
        style={{
          marginTop: "14px",
          fontSize: "13px",
          color: "var(--color-text-muted)",
          background: "none",
          border: "none",
          padding: "4px 0",
          cursor: "pointer",
          textAlign: "left",
          transition: "color 0.15s",
        }}

      >
        {position === "custom" ? "Choose a preset instead" : "+ Custom role"}
      </button>
    </div>
  )
}
