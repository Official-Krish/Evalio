import { IconArrowUp, IconArrowDown, IconMinus } from "@tabler/icons-react"

interface Trend {
  direction: "up" | "down" | "same"
  change: number
}

interface ConfidenceTrendsProps {
  communication: Trend | null
  confidence: Trend | null
  ownership: Trend | null
  structure: Trend | null
}

function TrendCard({ label, trend }: { label: string; trend: Trend | null }) {
  const color =
    trend?.direction === "up"
      ? "var(--color-success)"
      : trend?.direction === "down"
        ? "var(--color-danger)"
        : "var(--color-text-muted)"

  const icon =
    trend?.direction === "up" ? (
      <IconArrowUp size={14} />
    ) : trend?.direction === "down" ? (
      <IconArrowDown size={14} />
    ) : (
      <IconMinus size={14} />
    )

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 500 }}>{label}</span>
        <span style={{ color, display: "flex" }}>{icon}</span>
      </div>
      <span
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--color-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {trend ? `${trend.change > 0 ? "+" : ""}${trend.change}` : "\u2014"}
      </span>
    </div>
  )
}

export function ConfidenceTrends({ communication, confidence, ownership, structure }: ConfidenceTrendsProps) {
  return (
    <section>
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "10px",
        }}
      >
        TRENDS
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        <TrendCard label="Communication" trend={communication} />
        <TrendCard label="Confidence" trend={confidence} />
        <TrendCard label="Ownership" trend={ownership} />
        <TrendCard label="Structure" trend={structure} />
      </div>
    </section>
  )
}
