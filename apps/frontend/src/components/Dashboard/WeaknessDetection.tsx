import { IconChartBar, IconMessageOff, IconLetterCase } from "@tabler/icons-react"

interface Weakness {
  label: string
  count: number
  type: "metric" | "conclusion" | "filler"
}

interface WeaknessDetectionProps {
  weaknesses: Weakness[]
}

const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  "Missing Metrics": { icon: <IconChartBar size={15} />, color: "#EF4444" },
  "Weak Conclusions": { icon: <IconMessageOff size={15} />, color: "#F59E0B" },
  "Filler Words": { icon: <IconLetterCase size={15} />, color: "#F59E0B" },
}

export function WeaknessDetection({ weaknesses }: WeaknessDetectionProps) {
  if (weaknesses.length === 0) return null

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "20px 20px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "14px",
        }}
      >
        MOST COMMON MISSES
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {weaknesses.map((w, i) => {
          const meta = iconMap[w.label] ?? { icon: <IconChartBar size={15} />, color: "#EF4444" }
          return (
            <div
              key={w.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 0",
                borderBottom: i < weaknesses.length - 1 ? "0.5px solid var(--color-border-light)" : "none",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", width: "16px", textAlign: "right" }}>
                {i + 1}.
              </span>
              <span style={{ color: meta.color, display: "flex", flexShrink: 0 }}>{meta.icon}</span>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: "var(--color-text)" }}>
                {w.label}
              </span>
              <span
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#FCA5A5",
                  borderRadius: "999px",
                  fontSize: "10px",
                  padding: "2px 8px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Detected {w.count}&times;
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
