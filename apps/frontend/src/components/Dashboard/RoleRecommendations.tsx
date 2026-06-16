import { Link } from "react-router-dom";
import { motion } from "motion/react";
import type { InterviewSummary } from "@evalio/shared";

interface RoleRecommendationsProps {
  summary: InterviewSummary | null;
}

export function RoleRecommendations({ summary }: RoleRecommendationsProps) {
  const topics = (summary?.recommendedTopics as string[]) ?? [];

  if (topics.length === 0) return null;

  return (
    <section>
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "10px",
        }}
      >
        RECOMMENDED NEXT
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {topics.map((topic, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              to={`/interview/new?position=${encodeURIComponent(topic)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--app-accent-border, rgba(184,168,138,0.3))";
                e.currentTarget.style.background =
                  "var(--app-accent-bg, rgba(184,168,138,0.04))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.background = "var(--color-bg-card)";
              }}
            >
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    lineHeight: 1.4,
                  }}
                >
                  {topic}
                </span>
              </div>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--app-accent-bg, rgba(184,168,138,0.1))",
                  color: "var(--app-accent, #b8a88a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "var(--app-accent, #b8a88a)";
                  e.currentTarget.style.color = "#080808";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "var(--app-accent-bg, rgba(184,168,138,0.1))";
                  e.currentTarget.style.color = "var(--app-accent, #b8a88a)";
                }}
              >
                &rarr;
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
