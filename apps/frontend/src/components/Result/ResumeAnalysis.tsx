import type { InterviewSummary } from "@evalio/shared"

export function ResumeAnalysis({ summary }: { summary: InterviewSummary }) {
  const strengths = summary.resumeStrengths as string[]
  const weaknesses = summary.resumeWeaknesses as string[]

  if (strengths.length === 0 && weaknesses.length === 0) return null

  return (
    <div style={{ padding: "0 0 48px" }}>
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "16px",
        }}
      >
        Resume analysis
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {strengths.length > 0 && (
          <div
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(16,185,129,0.15)",
              background: "rgba(16,185,129,0.04)",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(16,185,129,0.8)",
                margin: "0 0 10px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              What works
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {strengths.map((s, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5,
                    margin: 0,
                    paddingLeft: "10px",
                    borderLeft: "2px solid rgba(16,185,129,0.4)",
                  }}
                >
                  {s}
                </p>
              ))}
            </div>
          </div>
        )}

        {weaknesses.length > 0 && (
          <div
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(245,158,11,0.15)",
              background: "rgba(245,158,11,0.04)",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(245,158,11,0.8)",
                margin: "0 0 10px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              What to improve
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {weaknesses.map((w, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5,
                    margin: 0,
                    paddingLeft: "10px",
                    borderLeft: "2px solid rgba(245,158,11,0.4)",
                  }}
                >
                  {w}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
