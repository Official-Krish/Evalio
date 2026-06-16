import { useMemo } from "react";
import { motion } from "motion/react";
import type { InterviewSession } from "@evalio/shared";
import {
  IconTrendingUp,
  IconAlertTriangle,
  IconChartBar,
} from "@tabler/icons-react";

interface AiCoachCardProps {
  completed: InterviewSession[];
  totalSessions: number;
}

export function AiCoachCard({ completed, totalSessions }: AiCoachCardProps) {
  const insights = useMemo(() => {
    if (completed.length === 0) return null;
    const items: {
      text: string;
      color: string;
      icon: React.ReactNode;
      positive: boolean;
    }[] = [];
    const commScores = completed
      .map((i) => i.communicationScore)
      .filter((s): s is number => s != null);
    const techScores = completed
      .map((i) => i.technicalScore)
      .filter((s): s is number => s != null);
    const probScores = completed
      .map((i) => i.problemSolvingScore)
      .filter((s): s is number => s != null);

    if (commScores.length > 0) {
      const recent = commScores.slice(0, Math.min(3, commScores.length));
      const earlier = commScores.slice(Math.min(3, commScores.length));
      const avgR = recent.reduce((a, b) => a + b, 0) / recent.length;
      const avgE =
        earlier.length > 0
          ? earlier.reduce((a, b) => a + b, 0) / earlier.length
          : avgR;
      const positive = avgR >= avgE;
      items.push({
        text: positive
          ? "Communication is improving"
          : "Communication needs attention",
        color: positive ? "#4ade80" : "#facc15",
        icon: positive ? (
          <IconTrendingUp size={14} />
        ) : (
          <IconAlertTriangle size={14} />
        ),
        positive,
      });
    }
    if (probScores.length > 0) {
      const avgProb = probScores.reduce((a, b) => a + b, 0) / probScores.length;
      const positive = avgProb >= 60;
      items.push({
        text: positive
          ? "Tradeoff discussions are solid"
          : "You avoid discussing tradeoffs",
        color: positive ? "#4ade80" : "#facc15",
        icon: positive ? (
          <IconTrendingUp size={14} />
        ) : (
          <IconAlertTriangle size={14} />
        ),
        positive,
      });
    }
    if (techScores.length > 0) {
      const avgTech = techScores.reduce((a, b) => a + b, 0) / techScores.length;
      const positive = avgTech >= 65;
      items.push({
        text: positive
          ? "Technical answers are well-structured"
          : "Backend answers lack metrics",
        color: positive ? "#4ade80" : "#f87171",
        icon: positive ? (
          <IconTrendingUp size={14} />
        ) : (
          <IconChartBar size={14} />
        ),
        positive,
      });
    }
    return items;
  }, [completed]);

  if (!insights || completed.length === 0) return null;

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
      {/* Ambient glow */}
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

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Pulsing dot */}
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

      {/* Insight rows */}
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
