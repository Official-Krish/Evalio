import type { InterviewStyle, InterviewDepth } from "@evalio/shared"

const styleOptions: { value: InterviewStyle; label: string; description: string }[] = [
  { value: "SUPPORTIVE", label: "Supportive", description: "Friendly coach — patient, encouraging, offers hints" },
  { value: "PROFESSIONAL", label: "Professional", description: "Corporate — structured, neutral, steady pace" },
  { value: "CHALLENGING", label: "Challenging", description: "Tough — interrupts rambling, demands specifics" },
  { value: "BAR_RAISER", label: "Bar Raiser", description: "Elite — deliberate silence, disagrees, demands proof" },
]

const depthOptions: { value: InterviewDepth; label: string; description: string }[] = [
  { value: "STANDARD", label: "Standard", description: "One question at a time, smooth flow" },
  { value: "PROBING", label: "Probing", description: "Occasional follow-ups for detail" },
  { value: "CHALLENGE", label: "Challenge", description: "Challenge every answer before moving on" },
  { value: "BAR_RAISER", label: "Bar Raiser", description: "Relentless depth — disagree until proven" },
]

interface StyleDepthPickerProps {
  style: InterviewStyle
  depth: InterviewDepth
  onStyleChange: (s: InterviewStyle) => void
  onDepthChange: (d: InterviewDepth) => void
}

export function StyleDepthPicker({ style, depth, onStyleChange, onDepthChange }: StyleDepthPickerProps) {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 10px" }}>
          Interview Style
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {styleOptions.map((opt) => {
            const active = style === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onStyleChange(opt.value)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: active
                    ? "1.5px solid var(--color-accent, #6366f1)"
                    : "1px solid var(--color-border-light)",
                  background: active ? "rgba(99,102,241,0.06)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: active ? "5px solid var(--color-accent, #6366f1)" : "2px solid var(--color-border)",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }} />
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", display: "block" }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {opt.description}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 10px" }}>
          Interview Depth
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {depthOptions.map((opt) => {
            const active = depth === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onDepthChange(opt.value)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: active
                    ? "1.5px solid var(--color-accent, #6366f1)"
                    : "1px solid var(--color-border-light)",
                  background: active ? "rgba(99,102,241,0.06)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: active ? "5px solid var(--color-accent, #6366f1)" : "2px solid var(--color-border)",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }} />
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", display: "block" }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {opt.description}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
