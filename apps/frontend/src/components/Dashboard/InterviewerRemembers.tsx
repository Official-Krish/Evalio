import { IconBuilding, IconAward, IconAlertCircle } from "@tabler/icons-react"

interface RemembersData {
  strongest: string | null
  weakest: string | null
  mostImproved: string | null
  impactNote: string
}

interface InterviewerRemembersProps {
  data: RemembersData
  totalSessions: number
}

export function InterviewerRemembers({ data, totalSessions }: InterviewerRemembersProps) {
  if (totalSessions === 0) return null

  const chips = [
    {
      icon: <IconBuilding size={14} />,
      text: data.impactNote,
      color: "#10B981",
      borderColor: "rgba(16,185,129,0.3)",
    },
    ...(data.strongest
      ? [
          {
            icon: <IconAward size={14} />,
            text: `Strongest topic: ${data.strongest}`,
            color: "#7C3AED",
            borderColor: "rgba(124,58,237,0.3)",
          },
        ]
      : []),
    ...(data.weakest
      ? [
          {
            icon: <IconAlertCircle size={14} />,
            text: `Weakest topic: ${data.weakest}`,
            color: "#F59E0B",
            borderColor: "rgba(245,158,11,0.3)",
          },
        ]
      : []),
    ...(data.mostImproved
      ? [
          {
            icon: <IconAward size={14} />,
            text: `Most improved: ${data.mostImproved}`,
            color: "#10B981",
            borderColor: "rgba(16,185,129,0.3)",
          },
        ]
      : []),
  ]

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderLeft: "2px solid rgba(124,58,237,0.3)",
        borderRadius: "12px",
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "16px",
        }}
      >
        YOUR INTERVIEWER REMEMBERS
      </p>

      <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
        Across {totalSessions} session{totalSessions !== 1 ? "s" : ""}:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {chips.map((chip, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "6px",
              background: "var(--color-bg-hover)",
              borderLeft: `3px solid ${chip.color}`,
            }}
          >
            <span style={{ color: chip.color, display: "flex", flexShrink: 0 }}>{chip.icon}</span>
            <span style={{ fontSize: "13px", color: "var(--color-text)" }}>{chip.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
