import { IconBulb } from "@tabler/icons-react";
import type { InterviewSummary } from "@evalio/shared";

interface InterviewerRemembersProps {
  summary: InterviewSummary | null;
  totalSessions: number;
}

export function InterviewerRemembers({
  summary,
  totalSessions,
}: InterviewerRemembersProps) {
  if (!summary || totalSessions === 0) return null;

  const points: { text: string }[] = [];

  if (summary.summary) {
    points.push({ text: summary.summary });
  }

  const strengths = (summary.strengths as string[]) ?? [];
  const weaknesses = (summary.weaknesses as string[]) ?? [];

  if (strengths.length > 0) {
    points.push({ text: `Strong area: ${strengths.slice(0, 2).join("; ")}` });
  }
  if (weaknesses.length > 0) {
    points.push({
      text: `Area to improve: ${weaknesses.slice(0, 2).join("; ")}`,
    });
  }

  if (points.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderLeft: "2px solid var(--app-accent-border, rgba(184,168,138,0.3))",
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

      <p
        style={{
          fontSize: "13px",
          color: "var(--color-text-muted)",
          marginBottom: "12px",
        }}
      >
        Across {totalSessions} session{totalSessions !== 1 ? "s" : ""}:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {points.map((point, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "6px",
              background: "var(--color-bg-hover)",
              borderLeft: `3px solid var(--app-accent, #b8a88a)`,
            }}
          >
            <span
              style={{
                color: "var(--app-accent, #b8a88a)",
                display: "flex",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              <IconBulb size={14} />
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "var(--color-text)",
                lineHeight: 1.5,
              }}
            >
              {point.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
