import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { isToday, formatDuration } from "./helpers";
import type { InterviewSession } from "@evalio/shared";

interface SessionStripProps {
  mostRecent: InterviewSession & {
    resume?: { id: string; version: number } | null;
  };
  onViewResume: (resumeId: string) => void;
}

const STYLE_LABELS: Record<string, string> = {
  SUPPORTIVE: "Supportive",
  PROFESSIONAL: "Professional",
  CHALLENGING: "Challenging",
  BAR_RAISER: "Bar Raiser",
};
const DEPTH_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  PROBING: "Probing",
  CHALLENGE: "Challenge",
  BAR_RAISER: "Bar Raiser",
};

export function SessionStrip({ mostRecent, onViewResume }: SessionStripProps) {
  const score = mostRecent.overallScore;
  const isActive = mostRecent.status === "ACTIVE";
  const scorePct = score != null ? Math.round(score) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={
          isActive ? `/interview/${mostRecent.id}` : `/results/${mostRecent.id}`
        }
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            padding: "24px 28px",
            position: "relative",
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor =
              "var(--app-accent-border, rgba(184,168,138,0.3))")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--color-border)")
          }
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              right: "-30px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.06)) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Status label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isActive ? (
                <>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#22c55e",
                    }}
                  />
                  <span
                    className="evalio-section-label"
                    style={{ color: "#22c55e" }}
                  >
                    Active session
                  </span>
                </>
              ) : (
                <span className="evalio-section-label">Most recent</span>
              )}
            </div>
            {mostRecent.startedAt &&
              isToday(new Date(mostRecent.startedAt)) && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-muted)",
                    background: "var(--color-bg-hover)",
                    borderRadius: "999px",
                    padding: "2px 10px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  Today
                </span>
              )}
          </div>

          {/* Session title */}
          <h2
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--color-text)",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            {mostRecent.position || "General Interview"}
          </h2>

          {/* Meta tags */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {formatDuration(mostRecent.durationSeconds) && (
              <span
                style={{ fontSize: "11px", color: "var(--color-text-muted)" }}
              >
                {formatDuration(mostRecent.durationSeconds)}
              </span>
            )}
            {mostRecent.companyName && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  background: "var(--app-accent-bg, rgba(184,168,138,0.08))",
                  border:
                    "1px solid var(--app-accent-border, rgba(184,168,138,0.2))",
                  color: "var(--app-accent, #b8a88a)",
                  fontWeight: 500,
                }}
              >
                {mostRecent.companyName}
              </span>
            )}
            {mostRecent.interviewStyle && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  color: "#a5b4fc",
                }}
              >
                {STYLE_LABELS[mostRecent.interviewStyle] ??
                  mostRecent.interviewStyle}
              </span>
            )}
            {mostRecent.interviewDepth && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  color: "#6ee7b7",
                }}
              >
                {DEPTH_LABELS[mostRecent.interviewDepth] ??
                  mostRecent.interviewDepth}
              </span>
            )}
          </div>

          {/* Score bar */}
          {score != null && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Score
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {scorePct}%
                </span>
              </div>
              <div
                style={{
                  height: "3px",
                  background: "var(--color-border)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${scorePct}%` }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.3,
                  }}
                  style={{
                    height: "100%",
                    background:
                      scorePct >= 70
                        ? "#4ade80"
                        : scorePct >= 50
                          ? "var(--app-accent, #b8a88a)"
                          : "#f87171",
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              to={
                isActive
                  ? `/interview/${mostRecent.id}`
                  : `/results/${mostRecent.id}`
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 20px",
                borderRadius: "999px",
                background: isActive ? "#22c55e" : "var(--color-text)",
                color: "var(--color-bg)",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "opacity 0.2s",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isActive ? "Continue session" : "View report"}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2l4 4-4 4" />
              </svg>
            </Link>
            {mostRecent.resume?.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onViewResume(mostRecent.resume!.id);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "999px",
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--app-accent-border, rgba(184,168,138,0.35))";
                  e.currentTarget.style.color = "var(--app-accent, #b8a88a)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                View resume
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.section>
  );
}
