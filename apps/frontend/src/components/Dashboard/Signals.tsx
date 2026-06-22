import { Link } from "react-router-dom";
import {
  IconChevronRight,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";
import {
  TRAIT_LABELS,
  TRAIT_ORDER,
  SIGNAL_LABELS,
} from "../../constants/signals";

interface TraitData {
  score: number;
  description: string;
  level: string;
  trend: string;
}

interface FailurePatternData {
  label: string | null;
  code: string;
  frequency: number;
  totalSessions: number;
  severity: string;
  trend: string;
}

interface SignalsProps {
  completedCount: number;
  traits: Record<string, TraitData> | null;
  failurePatterns: FailurePatternData[];
  mostImproved: string | null;
  weakest: string | null;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving")
    return <IconTrendingUp size={12} className="text-emerald-500" />;
  if (trend === "worsening")
    return <IconTrendingDown size={12} className="text-red-500" />;
  return <IconMinus size={12} className="text-[var(--color-text-muted)]" />;
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    high: { bg: "rgba(16,185,129,0.1)", fg: "#10b981" },
    medium: { bg: "rgba(245,158,11,0.1)", fg: "#f59e0b" },
    developing: { bg: "rgba(239,68,68,0.1)", fg: "#ef4444" },
  };
  const c = (colors[level] ?? colors.developing)!;
  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "2px 6px",
        borderRadius: "4px",
        background: c.bg,
        color: c.fg,
      }}
    >
      {level}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#6b7280",
  };
  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: colors[severity] ?? colors.low,
      }}
    >
      {severity}
    </span>
  );
}

export function Signals({
  completedCount,
  traits,
  failurePatterns,
  mostImproved,
  weakest,
}: SignalsProps) {
  return (
    <div className="db-col-block">
      <div className="db-signals-card">
        <div className="db-section-header">
          <h3 className="db-section-label">Interview Identity Profile</h3>
          {completedCount >= 4 && (
            <Link to="/analysis" className="db-section-link">
              <span>Full analysis</span>
              <IconChevronRight size={12} />
            </Link>
          )}
        </div>

        {completedCount >= 4 && traits ? (
          <div className="db-signals-list">
            {TRAIT_ORDER.map((key) => {
              const trait = traits[key];
              if (!trait) return null;
              const info = TRAIT_LABELS[key];
              return (
                <div key={key} className="db-signal-item">
                  <div className="db-signal-header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span className="db-signal-name">
                        {info?.label || key}
                      </span>
                      <LevelBadge level={trait.level} />
                      <TrendIcon trend={trait.trend} />
                    </div>
                    <span className="db-signal-score">{trait.score}%</span>
                  </div>
                  <div className="db-signal-bar">
                    <div
                      className="db-signal-fill"
                      style={{ transform: `scaleX(${trait.score / 100})` }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-muted)",
                      margin: "4px 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {trait.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 px-4 bg-gradient-to-r from-[var(--db-highlight-bg)] to-transparent rounded-xl border border-[var(--db-card-border)]">
            <p className="text-[13px] font-medium text-[var(--color-text)] mb-2">
              Discover your interview identity
            </p>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
              Complete {4 - Math.min(3, completedCount)} more sessions to
              generate your core signal profiles.
            </p>
          </div>
        )}
      </div>

      {/* Growth highlights */}
      {(mostImproved || weakest) && (
        <div
          className="db-signals-card"
          style={{ display: "flex", gap: "12px" }}
        >
          {mostImproved && (
            <div
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(16,185,129,0.04)",
                border: "1px solid rgba(16,185,129,0.12)",
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#10b981",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                Most Improved
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {mostImproved}
              </p>
            </div>
          )}
          {weakest && (
            <div
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.12)",
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#ef4444",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                Key Focus Area
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {weakest}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="db-signals-card">
        <h3 className="db-section-label" style={{ marginBottom: "20px" }}>
          Focus indicators
        </h3>

        {failurePatterns.length > 0 ? (
          <div className="db-weakness-list">
            {failurePatterns.slice(0, 4).map((pattern, idx) => {
              const pct =
                pattern.totalSessions > 0
                  ? Math.round(
                      (pattern.frequency / pattern.totalSessions) * 100,
                    )
                  : 0;
              return (
                <div
                  key={idx}
                  className="db-weakness-item"
                  style={{
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div className="db-weakness-dot" />
                      <span className="db-weakness-title">
                        {pattern.label ||
                          SIGNAL_LABELS[pattern.code]?.label ||
                          pattern.code}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <SeverityBadge severity={pattern.severity} />
                      <TrendIcon trend={pattern.trend} />
                    </div>
                  </div>
                  <div className="h-1 bg-[var(--db-metric-line)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background:
                          pattern.severity === "high"
                            ? "#ef4444"
                            : pattern.severity === "medium"
                              ? "#f59e0b"
                              : "#6b7280",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    {pattern.frequency}/{pattern.totalSessions} sessions
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed m-0">
            No severe behavioral weaknesses or failure loops detected. Keep
            practicing to check alignment.
          </p>
        )}
      </div>
    </div>
  );
}
