import { COMPANIES } from "@evalio/shared";
import type {
  InterviewStyle,
  InterviewDepth,
  InterviewMode,
} from "@evalio/shared";

interface SessionSummaryProps {
  companyId: string | null;
  companyName: string | null;
  roleTitle: string | null;
  customRole: string;
  interviewRound: string | null;
  interviewStyle: InterviewStyle;
  interviewDepth: InterviewDepth;
  interviewMode: InterviewMode;
}

const styleLabel: Record<InterviewStyle, string> = {
  SUPPORTIVE: "Supportive",
  PROFESSIONAL: "Professional",
  CHALLENGING: "Challenging",
  BAR_RAISER: "Bar Raiser",
};

const depthLabel: Record<InterviewDepth, string> = {
  STANDARD: "Standard",
  PROBING: "Probing",
  CHALLENGE: "Challenge",
  BAR_RAISER: "Bar Raiser",
};

export function SessionSummary({
  companyId,
  companyName,
  roleTitle,
  customRole,
  interviewRound,
  interviewStyle,
  interviewDepth,
  interviewMode,
}: SessionSummaryProps) {
  const company =
    companyId && companyId !== "__custom__"
      ? (COMPANIES.find((c) => c.id === companyId) ?? null)
      : null;

  const selections = [
    { label: "Company", value: company?.name ?? companyName ?? "—" },
    { label: "Role", value: (roleTitle ?? customRole) || "—" },
    { label: "Round", value: interviewRound || "—" },
    { label: "Style", value: styleLabel[interviewStyle] },
    { label: "Depth", value: depthLabel[interviewDepth] },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: "50%",
        transform: "translateY(-50%)",
        borderRadius: "14px",
        border: "1px solid var(--color-border-light)",
        background: "var(--color-bg-elevated)",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          margin: "0 0 16px",
        }}
      >
        Session Summary
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {selections.map((s) => (
          <div key={s.label}>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                margin: "0 0 2px",
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color:
                  s.value === "—"
                    ? "var(--color-text-tertiary)"
                    : "var(--color-text)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {s.value}
              {s.label === "Round" && interviewMode === "DSA" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    marginLeft: "6px",
                    fontSize: "8px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    border: "1px solid var(--color-accent-border)",
                    borderRadius: 2,
                    padding: "0 4px",
                    lineHeight: "13px",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{
                      background: "var(--color-accent)",
                      display: "inline-block",
                    }}
                  />
                  Live
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
