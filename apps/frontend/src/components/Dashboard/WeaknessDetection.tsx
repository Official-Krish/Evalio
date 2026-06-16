import { IconAlertTriangle } from "@tabler/icons-react";
import type { InterviewSummary } from "@evalio/shared";

interface WeaknessDetectionProps {
  summary: InterviewSummary | null;
}

export function WeaknessDetection({ summary }: WeaknessDetectionProps) {
  const weaknesses = (summary?.weaknesses as string[]) ?? [];
  const improvements = (summary?.improvementAreas as string[]) ?? [];

  const items = [
    ...weaknesses.map((w) => ({ label: w, type: "weakness" as const })),
    ...improvements.map((i) => ({ label: i, type: "improvement" as const })),
  ];

  if (items.length === 0) return null;

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
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 0",
              borderBottom:
                i < items.length - 1
                  ? "0.5px solid var(--color-border-light)"
                  : "none",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                width: "16px",
                textAlign: "right",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              {i + 1}.
            </span>
            <span
              style={{
                color: item.type === "weakness" ? "#EF4444" : "#F59E0B",
                display: "flex",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              <IconAlertTriangle size={15} />
            </span>
            <span
              style={{
                flex: 1,
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text)",
                lineHeight: 1.5,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
