import { motion } from "motion/react";
import { IconTrendingUp, IconAlertTriangle } from "@tabler/icons-react";
import type { InterviewSummary } from "@evalio/shared";

interface AiCoachCardProps {
  summary: InterviewSummary | null;
  totalSessions: number;
}

export function AiCoachCard({ summary, totalSessions }: AiCoachCardProps) {
  if (!summary || totalSessions === 0) return null;

  const insights: {
    text: string;
    color: string;
    icon: React.ReactNode;
    positive: boolean;
  }[] = [];

  for (const s of (summary.strengths as string[]) ?? []) {
    insights.push({
      text: s,
      color: "#4ade80",
      icon: <IconTrendingUp size={14} />,
      positive: true,
    });
  }

  for (const w of (summary.improvementAreas as string[]) ?? []) {
    insights.push({
      text: w,
      color: "#facc15",
      icon: <IconAlertTriangle size={14} />,
      positive: false,
    });
  }

  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: "16px",
        border: "1px solid var(--app-accent-border, rgba(184,168,138,0.2))",
        background: "var(--color-bg-card)",
        padding: "24px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.07)) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--app-accent, #b8a88a)",
              boxShadow:
                "0 0 6px var(--app-accent-glow, rgba(184,168,138,0.4))",
            }}
          />
          <span className="evalio-section-label-accent">AI Coach</span>
        </div>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
          from {Math.min(totalSessions, 12)} sessions
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: item.positive
                ? "rgba(34,197,94,0.04)"
                : "rgba(184,168,138,0.04)",
              borderLeft: `2px solid ${item.color}`,
            }}
          >
            <span style={{ color: item.color, display: "flex", flexShrink: 0 }}>
              {item.icon}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "var(--color-text)",
                lineHeight: 1.4,
              }}
            >
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
