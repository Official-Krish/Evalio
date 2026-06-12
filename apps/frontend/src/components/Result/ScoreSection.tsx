export function ScoreSection({
  overall,
  delta,
  comm,
  tech,
  prob,
}: {
  overall: number
  delta: number | null
  comm: number
  tech: number
  prob: number
}) {
  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", padding: "0 0 48px" }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
          <span style={{ fontSize: "64px", fontWeight: 700, color: "var(--landing-fg)" }}>{overall}</span>
          <span style={{ fontSize: "32px", color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>/10</span>
        </div>
        {delta != null && (
          <span
            style={{
              fontSize: "13px",
              color: delta >= 0 ? "rgba(80,200,120,0.7)" : "rgba(220,80,80,0.7)",
              display: "block",
              marginTop: "4px",
            }}
          >
            {delta >= 0 ? "\u25B2 +" : "\u25BC "}{delta} from last session
          </span>
        )}
        <div
          style={{
            width: "200px",
            height: "5px",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.08)",
            marginTop: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(overall / 10) * 100}%`,
              height: "100%",
              borderRadius: "4px",
              background: "#6C63FF",
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
        {[
          { label: "Communication", score: comm },
          { label: "Technical", score: tech },
          { label: "Problem Solving", score: prob },
        ].map((item) => {
          const pct = item.score / 10
          return (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                  {item.score}/10
                </span>
              </div>
              <div
                style={{
                  width: "120px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct * 100}%`,
                    height: "100%",
                    borderRadius: "2px",
                    background: "#6C63FF",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
