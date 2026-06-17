import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SIGNAL_LABELS } from "../../constants/signals";
import type { FailurePattern } from "../../constants/signals";
import { api } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

interface FailurePatternCardProps {
  patterns: FailurePattern[];
  completedCount: number;
}

const SEVERITY_CONFIG = {
  high: { color: "#EF4444", label: "HIGH" },
  medium: { color: "#F59E0B", label: "MEDIUM" },
  low: { color: "#6B7280", label: "LOW" },
} as const;

const TREND_CONFIG = {
  improving: { icon: "↑", color: "#10B981", label: "Improving" },
  worsening: { icon: "↓", color: "#EF4444", label: "Worsening" },
  stable: { icon: "→", color: "#6B7280", label: "Stable" },
} as const;

function getPatternName(code: string, label: string | null): string {
  if (label) return label;
  return SIGNAL_LABELS[code]?.label ?? code;
}

function getPatternDescription(code: string): string {
  return SIGNAL_LABELS[code]?.description ?? "";
}

function PatternEvidence({
  evidence,
}: {
  evidence: FailurePattern["evidence"];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const resolvedTurnIds = new Set(evidence.flatMap((e) => e.turnIds));

  const { data: transcripts } = useQuery({
    queryKey: [
      "pattern-transcripts",
      evidence.length > 0 ? evidence[0]!.interviewId : null,
    ],
    queryFn: async () => {
      const res = await api.getInterview(evidence[0]!.interviewId);
      const interview = (
        res as { interview?: { turns?: { id: string; answerText: string }[] } }
      ).interview;
      if (!interview?.turns) return null;
      const turnMap = new Map(interview.turns.map((t) => [t.id, t.answerText]));
      return turnMap;
    },
    enabled: resolvedTurnIds.size > 0 && expandedId !== null,
    staleTime: 1000 * 60 * 5,
  });

  if (evidence.length === 0) return null;

  return (
    <div style={{ marginTop: "12px" }}>
      <p
        style={{
          fontSize: "11px",
          color: "var(--color-text-muted)",
          marginBottom: "8px",
          letterSpacing: "0.04em",
        }}
      >
        EVIDENCE
      </p>
      {evidence.map((ev) => {
        const date = new Date(ev.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const isExpanded = expandedId === ev.interviewId;
        const snippet = transcripts?.get(ev.turnIds[0] ?? "");
        return (
          <div key={ev.interviewId} style={{ marginBottom: "8px" }}>
            <button
              onClick={() => {
                if (resolvedTurnIds.size > 0) {
                  setExpandedId(isExpanded ? null : ev.interviewId);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                padding: "6px 0",
                cursor: resolvedTurnIds.size > 0 ? "pointer" : "default",
                width: "100%",
                textAlign: "left",
                color: "var(--color-text-muted)",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
                —
              </span>
              <span>{date}</span>
              {resolvedTurnIds.size > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "10px",
                    color: "var(--color-text-muted)",
                    opacity: 0.6,
                  }}
                >
                  {isExpanded ? "▲" : "▾"}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isExpanded && snippet && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text)",
                    lineHeight: 1.6,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "var(--color-bg-hover)",
                    border: "1px solid var(--color-border)",
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                  }}
                >
                  {snippet}
                  {ev.reason && (
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        fontStyle: "italic",
                        marginTop: "8px",
                        marginBottom: 0,
                      }}
                    >
                      {ev.reason}
                    </p>
                  )}
                </motion.div>
              )}
              {isExpanded && !snippet && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    fontStyle: "italic",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "var(--color-bg-hover)",
                    border: "1px solid var(--color-border)",
                    overflow: "hidden",
                  }}
                >
                  {ev.reason}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function FailurePatternCard({
  patterns,
  completedCount,
}: FailurePatternCardProps) {
  if (completedCount < 4 || patterns.length === 0) {
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
          FAILURE PATTERNS
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
            ? "Complete your first interview to start tracking patterns."
            : `Complete ${4 - completedCount} more interview${4 - completedCount === 1 ? "" : "s"} to unlock your failure pattern analysis.`}
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
        FAILURE PATTERNS
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "var(--color-text-muted)",
          marginBottom: "20px",
        }}
      >
        Recurring patterns across your interviews — what's holding you back.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {patterns.map((pattern, i) => {
          const sev = SEVERITY_CONFIG[pattern.severity];
          const trend = TREND_CONFIG[pattern.trend];
          const ratio = pattern.frequency / pattern.totalSessions;
          const name = getPatternName(pattern.code, pattern.label);
          const description =
            pattern.code !== "OTHER"
              ? getPatternDescription(pattern.code)
              : null;

          return (
            <motion.div
              key={pattern.code + (pattern.label ?? "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ flex: 1 }}>
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
                        fontSize: "10px",
                        fontWeight: 600,
                        color: sev.color,
                        letterSpacing: "0.06em",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: `${sev.color}14`,
                      }}
                    >
                      {sev.label}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {name}
                    </span>
                  </div>
                  {description && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        margin: "4px 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "3px",
                      background: "var(--color-border)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        borderRadius: "3px",
                        background: sev.color,
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pattern.frequency}/{pattern.totalSessions} sessions
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: trend.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {trend.icon} {trend.label}
                </span>
              </div>

              <PatternEvidence evidence={pattern.evidence} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
