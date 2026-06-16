import { SIGNAL_LABELS, type FailurePattern } from "../../constants/signals";

interface FailurePatternDetailCardProps {
  patterns: FailurePattern[];
  completedCount: number;
}

const SEVERITY_COLORS = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#6B7280",
} as const;
const TREND_LABELS = {
  improving: "↑ Improving",
  worsening: "↓ Worsening",
  stable: "→ Stable",
} as const;

function getPatternName(code: string, label: string | null): string {
  if (label) return label;
  return SIGNAL_LABELS[code]?.label ?? code;
}

function getPatternDescription(code: string): string {
  return SIGNAL_LABELS[code]?.description ?? "";
}

export function FailurePatternDetailCard({
  patterns,
  completedCount,
}: FailurePatternDetailCardProps) {
  if (completedCount < 4 || patterns.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "20px",
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
        FAILURE PATTERNS
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {patterns.map((pattern) => {
          const ratio = pattern.frequency / pattern.totalSessions;
          const name = getPatternName(pattern.code, pattern.label);
          const description = getPatternDescription(pattern.code);
          const sevColor = SEVERITY_COLORS[pattern.severity];
          const trendLabel = TREND_LABELS[pattern.trend];

          return (
            <div
              key={pattern.code + (pattern.label ?? "")}
              style={{
                borderBottom: "1px solid var(--color-border-light)",
                paddingBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "var(--color-text)",
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: sevColor,
                    marginLeft: "auto",
                  }}
                >
                  {pattern.severity.toUpperCase()}
                </span>
              </div>

              {description && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    margin: "4px 0",
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "6px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "4px",
                      borderRadius: "2px",
                      background: "var(--color-border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${ratio * 100}%`,
                        borderRadius: "2px",
                        background: sevColor,
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pattern.frequency}/{pattern.totalSessions}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {trendLabel}
                </span>
              </div>

              {pattern.evidence.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.04em",
                      marginBottom: "4px",
                    }}
                  >
                    EVIDENCE
                  </p>
                  {pattern.evidence.slice(0, 3).map((ev) => (
                    <p
                      key={ev.interviewId}
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        fontStyle: "italic",
                        margin: "2px 0",
                        lineHeight: 1.5,
                      }}
                    >
                      —{" "}
                      {new Date(ev.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      : {ev.reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
