import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
  IconAward,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface SkillEntry {
  score: number;
  note: string;
  interviewId: string;
  date: string;
}

interface SkillProfile {
  communication?: string | SkillEntry[];
  technicalDepth?: string | SkillEntry[];
  problemSolving?: string | SkillEntry[];
  leadership?: string | SkillEntry[];
  commonPatterns?: string | string[];
  mostImprovedSkill?: string | null;
  weakestSkill?: string | null;
}

interface SkillProfileCardProps {
  profile: SkillProfile | null | undefined;
  loading?: boolean;
}

export function SkillProfileCard({ profile, loading }: SkillProfileCardProps) {
  const [activeTab, setActiveTab] = useState<"skills" | "patterns">("skills");

  const parseJsonArray = <T,>(val: string | T[] | null | undefined): T[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  };

  const skillsData = useMemo(() => {
    if (!profile) return null;

    const comm = parseJsonArray<SkillEntry>(profile.communication);
    const tech = parseJsonArray<SkillEntry>(profile.technicalDepth);
    const prob = parseJsonArray<SkillEntry>(profile.problemSolving);
    const lead = parseJsonArray<SkillEntry>(profile.leadership);
    const patterns = parseJsonArray<string>(profile.commonPatterns);

    const getLatest = (history: SkillEntry[]) => {
      if (history.length === 0)
        return {
          score: 0,
          note: "No data available yet.",
          history: [],
          trend: "stable" as const,
        };
      const latest = history[history.length - 1]!;
      let trend: "up" | "down" | "stable" = "stable";
      if (history.length >= 2) {
        const prev = history[history.length - 2]!.score;
        if (latest.score > prev) trend = "up";
        else if (latest.score < prev) trend = "down";
      }
      return { score: latest.score, note: latest.note, trend, history };
    };

    return {
      communication: getLatest(comm),
      technicalDepth: getLatest(tech),
      problemSolving: getLatest(prob),
      leadership: getLatest(lead),
      patterns,
      mostImproved: profile.mostImprovedSkill,
      weakest: profile.weakestSkill,
    };
  }, [profile]);

  if (loading) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          height: "300px",
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-6 border-2 border-t-transparent border-[var(--app-accent)] rounded-full animate-spin" />
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Analyzing skills...
          </p>
        </div>
      </div>
    );
  }

  if (
    !skillsData ||
    (!skillsData.communication.score && !skillsData.technicalDepth.score)
  ) {
    // Beautiful Apple-style empty state
    return (
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
          padding: "48px 24px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            height: "200px",
            background:
              "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.08)) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{ position: "relative", maxWidth: "420px", margin: "0 auto" }}
        >
          <h3
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-text)",
              margin: "0 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            AI Skill Assessment
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
              margin: "0 0 20px",
            }}
          >
            Complete your first mock interview to unlock detailed feedback on
            your communication, technical depth, problem solving, and
            leadership.
          </p>
          <motion.a
            href="/interview/new"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "inline-flex",
              padding: "8px 20px",
              borderRadius: "999px",
              background: "var(--app-accent, #b8a88a)",
              color: "var(--color-bg)",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow:
                "0 4px 12px var(--app-accent-glow, rgba(184,168,138,0.25))",
            }}
          >
            Start Practice Session
          </motion.a>
        </div>
      </div>
    );
  }

  const skillCards = [
    { label: "Communication", key: "communication", color: "#3b82f6" },
    { label: "Technical Depth", key: "technicalDepth", color: "#b8a88a" },
    { label: "Problem Solving", key: "problemSolving", color: "#10b981" },
    { label: "Leadership", key: "leadership", color: "#8b5cf6" },
  ] as const;

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            fontWeight: 600,
          }}
        >
          AI Skill Analytics
        </span>
        <div
          style={{
            display: "flex",
            background: "var(--color-bg)",
            borderRadius: "8px",
            padding: "3px",
            gap: "2px",
          }}
        >
          <button
            onClick={() => setActiveTab("skills")}
            style={{
              padding: "4px 12px",
              borderRadius: "6px",
              border: "none",
              background:
                activeTab === "skills" ? "var(--color-bg-card)" : "transparent",
              color:
                activeTab === "skills"
                  ? "var(--color-text)"
                  : "var(--color-text-secondary)",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("patterns")}
            style={{
              padding: "4px 12px",
              borderRadius: "6px",
              border: "none",
              background:
                activeTab === "patterns"
                  ? "var(--color-bg-card)"
                  : "transparent",
              color:
                activeTab === "patterns"
                  ? "var(--color-text)"
                  : "var(--color-text-secondary)",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Common Patterns ({skillsData.patterns.length})
          </button>
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        {activeTab === "skills" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Bento metric grid */}
            <div
              className="grid-cols-1 md:grid-cols-2"
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {skillCards.map(({ label, key }) => {
                const metric = skillsData[key];
                return (
                  <div
                    key={key}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid var(--color-border-light)",
                      background: "rgba(255, 255, 255, 0.01)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--color-text)",
                        }}
                      >
                        {label}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "var(--app-accent, #b8a88a)",
                          }}
                        >
                          {metric.score}%
                        </span>
                        <TrendIndicator trend={metric.trend} />
                      </div>
                    </div>

                    {/* Progress track */}
                    <div
                      style={{
                        height: "4px",
                        background: "var(--color-border)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${metric.score}%`,
                          background: "var(--app-accent, #b8a88a)",
                          borderRadius: "2px",
                        }}
                      />
                    </div>

                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                        margin: 0,
                        lineHeight: 1.4,
                        opacity: 0.9,
                      }}
                    >
                      {metric.note}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Highlights row */}
            {(skillsData.mostImproved || skillsData.weakest) && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--color-border-light)",
                }}
              >
                {skillsData.mostImproved && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      background: "rgba(34, 197, 94, 0.03)",
                      border: "1px solid rgba(34, 197, 94, 0.12)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <IconAward
                      size={18}
                      color="#22c55e"
                      style={{ flexShrink: 0 }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "#22c55e",
                          margin: 0,
                          fontWeight: 600,
                        }}
                      >
                        Most Improved
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--color-text)",
                          margin: "2px 0 0",
                        }}
                      >
                        {skillsData.mostImproved}
                      </p>
                    </div>
                  </div>
                )}
                {skillsData.weakest && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      background: "rgba(239, 68, 68, 0.03)",
                      border: "1px solid rgba(239, 68, 68, 0.12)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <IconAlertTriangle
                      size={18}
                      color="#ef4444"
                      style={{ flexShrink: 0 }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "#ef4444",
                          margin: 0,
                          fontWeight: 600,
                        }}
                      >
                        Key Focus Area
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--color-text)",
                          margin: "2px 0 0",
                        }}
                      >
                        {skillsData.weakest}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {skillsData.patterns.length === 0 ? (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                  margin: "20px 0",
                }}
              >
                No behavior patterns observed yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {skillsData.patterns.map((pat, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border:
                        "1px solid var(--app-accent-border, rgba(184,168,138,0.18))",
                      background:
                        "var(--app-accent-bg, rgba(184,168,138,0.04))",
                      color: "var(--app-accent, #b8a88a)",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {pat}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TrendIndicator({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return <IconArrowUpRight size={14} color="#22c55e" title="Improving" />;
  }
  if (trend === "down") {
    return <IconArrowDownRight size={14} color="#ef4444" title="Needs Focus" />;
  }
  return <IconMinus size={14} color="var(--color-text-muted)" title="Stable" />;
}
