import { motion } from "motion/react";
import {
  TRAIT_LABELS,
  TRAIT_ORDER,
  type IdentityTraits,
} from "../../constants/signals";

interface IdentityProfileCardProps {
  traits: IdentityTraits | null;
  completedCount: number;
}

const LEVEL_CONFIG = {
  high: { color: "#10B981", label: "High" },
  medium: { color: "#F59E0B", label: "Medium" },
  developing: { color: "#6B7280", label: "Developing" },
} as const;

const TREND_ICONS = {
  improving: "↑",
  worsening: "↓",
  stable: "→",
} as const;

export function IdentityProfileCard({
  traits,
  completedCount,
}: IdentityProfileCardProps) {
  if (completedCount < 4 || !traits || Object.keys(traits).length === 0) {
    return (
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "12px",
          }}
        >
          YOUR INTERVIEW IDENTITY
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {completedCount === 0
            ? "Complete your first interview to start building your identity profile."
            : `Complete ${4 - completedCount} more interview${4 - completedCount === 1 ? "" : "s"} to discover your interview identity.`}
        </p>
        {completedCount > 0 && (
          <div style={{ marginTop: "12px" }}>
            <div
              style={{
                height: "6px",
                borderRadius: "3px",
                background: "var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (completedCount / 4) * 100)}%`,
                  borderRadius: "3px",
                  background: "var(--app-accent, #b8a88a)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                marginTop: "6px",
                margin: "6px 0 0",
              }}
            >
              {completedCount} / 4 interviews completed
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "4px",
        }}
      >
        YOUR INTERVIEW IDENTITY
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "var(--color-text-muted)",
          marginBottom: "20px",
        }}
      >
        Your interview identity currently shows:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
        }}
        className="max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        {TRAIT_ORDER.map((key, i) => {
          const trait = traits[key];
          if (!trait) return null;
          const cfg = LEVEL_CONFIG[trait.level];
          const info = TRAIT_LABELS[key];
          const trendIcon = TREND_ICONS[trait.trend];

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: "16px",
                background: "var(--color-bg-hover)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {info?.label ?? key}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: cfg.color,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {cfg.label}
                </span>
              </div>

              <div
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  background: "var(--color-border)",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.score}%` }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                    delay: i * 0.06 + 0.2,
                  }}
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    background: cfg.color,
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {trait.description}
              </p>

              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{ fontSize: "11px", color: "var(--color-text-muted)" }}
                >
                  {trendIcon}{" "}
                  {trait.trend === "improving"
                    ? "Improving"
                    : trait.trend === "worsening"
                      ? "Declining"
                      : "Stable"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
