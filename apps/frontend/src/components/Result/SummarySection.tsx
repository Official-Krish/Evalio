import type { InterviewSummary } from "@ai-interview/shared"

export function SummarySection({ summary }: { summary: InterviewSummary }) {
  return (
    <div style={{ padding: "0 0 48px" }}>
      <p style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "14px" }}>
        What happened
      </p>
      <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "32px" }}>
        {summary.summary}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {(summary.strengths as string[]).length > 0 && (
          <div>
            <p style={{ fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>
              What worked
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(summary.strengths as string[]).map((s, i) => (
                <div
                  key={i}
                  style={{
                    paddingLeft: "12px",
                    borderLeft: "2px solid rgba(108,99,255,0.5)",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {(summary.weaknesses as string[]).length > 0 && (
          <div>
            <p style={{ fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>
              What to fix
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(summary.weaknesses as string[]).map((w, i) => (
                <div
                  key={i}
                  style={{
                    paddingLeft: "12px",
                    borderLeft: "2px solid rgba(108,99,255,0.5)",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5,
                  }}
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(summary.recommendedTopics as string[]).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
            Recommended Topics
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(summary.recommendedTopics as string[]).map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "1px solid rgba(108,99,255,0.3)",
                  background: "rgba(108,99,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
