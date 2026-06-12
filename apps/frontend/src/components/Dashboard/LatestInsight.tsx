interface LatestInsightProps {
  insight: string | null
  hasData: boolean
}

export function LatestInsight({ insight, hasData }: LatestInsightProps) {
  if (!insight || !hasData) return null

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "24px 20px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-8px",
          left: "8px",
          fontSize: "64px",
          fontWeight: 400,
          color: "rgba(124,58,237,0.12)",
          lineHeight: 1,
          pointerEvents: "none",
          fontFamily: "Georgia, serif",
        }}
      >
        &ldquo;
      </span>

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 400,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          {insight}
        </p>
        <p style={{ fontSize: "10px", color: "var(--color-text-muted)", margin: "10px 0 0" }}>
          From your last session
        </p>
      </div>
    </div>
  )
}
