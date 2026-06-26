import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { COMPANIES } from "@evalio/shared";

const COMMON_ROUNDS = [
  "Coding Round (DSA)",
  "System Design",
  "Phone Screen",
  "Technical Coding",
  "Behavioral",
];

const TECHNICAL_KEYWORDS = [
  "engineer",
  "developer",
  "sde",
  "swe",
  "software",
  "frontend",
  "front-end",
  "backend",
  "back-end",
  "full stack",
  "fullstack",
  "data scientist",
  "data engineer",
  "ml engineer",
  "ai",
  "machine learning",
  "devops",
  "sre",
  "infrastructure",
  "cloud",
  "systems engineer",
  "network engineer",
  "security",
  "architect",
  "technical",
  "ios",
  "android",
  "mobile",
  "research scientist",
  "applied scientist",
  "qa engineer",
  "test engineer",
  "platform engineer",
  "site reliability",
];

function isTechnicalRole(roleTitle: string | null | undefined): boolean {
  if (!roleTitle) return true;
  const lower = roleTitle.toLowerCase();
  return TECHNICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

interface RoundPickerProps {
  companyId: string | null;
  roleTitle: string | null;
  selectedRound: string | null;
  customRound: string;
  onSelectRound: (round: string | null) => void;
  onCustomRoundChange: (val: string) => void;
  onSkip: () => void;
  onContinue?: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  fontSize: "13px",
  borderRadius: "2px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const descriptions: Record<string, string> = {
  "Coding Round (DSA)":
    "Algorithmic coding challenge — data structures, problem-solving, optimization",
  "Phone Screen": "Breadth check — past experience, motivation, fundamentals",
  "Technical & Coding":
    "Deep dive into coding, algorithms, and problem-solving",
  "Technical Coding": "Deep dive into coding, algorithms, and problem-solving",
  "Technical Deep Dive": "Deep domain expertise and technical rigor",
  "Coding & Algorithms": "Algorithmic thinking and clean code under pressure",
  "Coding & Problem Solving": "Problem-solving with code in real time",
  "System Design": "Architecture, tradeoffs, and high-level design thinking",
  "System Design & Architecture": "Scalable architecture and design tradeoffs",
  "System Design & Integration":
    "Cross-system architecture and integration patterns",
  "System Design & Risk": "Low-latency, high-reliability system design",
  "Real-time Systems Design": "Latency-critical, geo-distributed architecture",
  "Observability & System Design":
    "Monitoring-first architecture and reliability",
  "Product Design & Architecture":
    "Product-aware system design and user impact",
  "Architecture & Strategy": "Technical vision and architectural strategy",
  "Rendering & Collaboration":
    "Canvas performance, real-time sync, WebAssembly",
  "Blocks & Architecture": "Composable extensibility and data architecture",
  "Data Integration & Ontology": "Complex data pipelines and ontology design",
  "Behavioral & PMA":
    "Leadership, collaboration, and people management assessment",
  "Leadership Principles & Behavior":
    "STAR-based leadership and principle-driven behavior",
  "Leadership & Behavior":
    "Ownership, conflict resolution, and decision-making",
  "Leadership & Culture": "Freedom, responsibility, and cultural contribution",
  "Behavioral & Growth": "Growth mindset and cross-team collaboration",
  "Craftsmanship & Behavior": "Attention to detail and privacy-first mindset",
  "Operational & Behavior": "Incident response and operational excellence",
  "Host-centric & Behavior": "Community focus and full-stack ownership",
  "SRE & Reliability": "Observability, incident response, chaos engineering",
  "Client & Behavior": "Stakeholder management and client delivery focus",
  "Compliance & Behavior": "Regulatory thinking and precision under pressure",
  "Mission & Behavior":
    "Mission-driven problem-solving in complex environments",
  "Design & Culture": "Design-meets-engineering and creative collaboration",
  "Product & Behavior": "Product craftsmanship and tool-for-thought mindset",
  "Founder & Culture Fit":
    "Generalist mindset and high-velocity decision-making",
  "Case Study & Analysis":
    "Structured problem-solving and analytical frameworks",
};

const hoverProps = {
  whileHover: { scale: 1.02 },
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.dataset.active) {
      e.currentTarget.style.borderColor = "var(--app-accent, #b8a88a)";
      e.currentTarget.style.background =
        "var(--app-accent-bg, rgba(184,168,138,0.04))";
    }
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.dataset.active) {
      e.currentTarget.style.borderColor = "var(--color-border-light)";
      e.currentTarget.style.background = "transparent";
    }
  },
};

export function RoundPicker({
  companyId,
  roleTitle,
  selectedRound,
  customRound,
  onSelectRound,
  onCustomRoundChange,
  onSkip,
  onContinue,
}: RoundPickerProps) {
  const [showingOther, setShowingOther] = useState(false);
  const company = useMemo(() => {
    if (!companyId || companyId === "__custom__") return null;
    return COMPANIES.find((c) => c.id === companyId) ?? null;
  }, [companyId]);

  const technical = isTechnicalRole(roleTitle);
  const baseRounds = company?.interviewRounds ?? [];
  const isStartup = companyId === "startup";
  const dsaRound = technical && !isStartup ? ["Coding Round (DSA)"] : [];
  const sdRound = ["System Design"];
  const rounds = isStartup
    ? baseRounds
    : [...new Set([...dsaRound, ...sdRound, ...baseRounds])];
  const commonRounds = technical
    ? COMMON_ROUNDS
    : COMMON_ROUNDS.filter((r) => r !== "Coding Round (DSA)");
  const isCustom = companyId === "__custom__";
  const hasChosen = selectedRound !== null;

  if (!companyId) {
    return (
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-text-muted)",
          textAlign: "center",
          padding: "32px 0",
        }}
      >
        Select a company first
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {!isCustom &&
          rounds.map((round) => {
            const active = selectedRound === round;
            return (
              <motion.button
                key={round}
                onClick={() => {
                  if (!active) {
                    onSelectRound(round);
                    onCustomRoundChange("");
                    setShowingOther(false);
                    onContinue?.();
                  } else {
                    onSelectRound(null);
                  }
                }}
                whileTap={{ scale: 0.98 }}
                data-active={active || undefined}
                {...hoverProps}
                style={{
                  textAlign: "left",
                  padding: "18px 20px",
                  borderRadius: "12px",
                  border: active
                    ? "1.5px solid var(--app-accent, #b8a88a)"
                    : "1px solid var(--color-border-light)",
                  background: active
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {round}
                    {(round === "Coding Round (DSA)" ||
                      round === "System Design") && (
                      <span
                        className="inline-flex items-center gap-1 live-badge"
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--color-accent)",
                          border: "1px solid var(--color-accent-border)",
                          borderRadius: 3,
                          padding: "1px 5px",
                          lineHeight: "14px",
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{
                            background: "var(--color-accent)",
                            boxShadow: "0 0 4px var(--color-accent-border)",
                          }}
                        />
                        Live
                      </span>
                    )}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      margin: "4px 0 0",
                    }}
                  >
                    {descriptions[round] ?? ""}
                  </p>
                </div>
              </motion.button>
            );
          })}

        {!isCustom && (
          <>
            <motion.button
              onClick={() => {
                setShowingOther(true);
                if (selectedRound) {
                  onSelectRound(null);
                  onCustomRoundChange("");
                }
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "12px",
                border:
                  showingOther && !hasChosen
                    ? "1.5px solid var(--app-accent, #b8a88a)"
                    : "1px dashed var(--color-border)",
                background:
                  showingOther && !hasChosen
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--app-accent, #b8a88a)";
                e.currentTarget.style.background =
                  "var(--app-accent-bg, rgba(184,168,138,0.04))";
              }}
              onMouseLeave={(e) => {
                if (!(showingOther && !hasChosen)) {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    Other (not listed)
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    Describe the round type — AI will adapt
                  </p>
                </div>
              </div>
            </motion.button>

            {showingOther && !hasChosen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ paddingLeft: "4px" }}
              >
                <input
                  value={customRound}
                  onChange={(e) => {
                    onCustomRoundChange(e.target.value);
                    onSelectRound(null);
                  }}
                  placeholder="e.g. Take-home Assignment, Whiteboarding, Cross-functional..."
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-border)")
                  }
                  autoFocus
                />
              </motion.div>
            )}
          </>
        )}

        {isCustom && (
          <>
            {commonRounds.map((round) => {
              const active = selectedRound === round;
              return (
                <motion.button
                  key={round}
                  onClick={() => {
                    if (!active) {
                      onSelectRound(round);
                      onCustomRoundChange("");
                      setShowingOther(false);
                      onContinue?.();
                    } else {
                      onSelectRound(null);
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  data-active={active || undefined}
                  {...hoverProps}
                  style={{
                    textAlign: "left",
                    padding: "18px 20px",
                    borderRadius: "12px",
                    border: active
                      ? "1.5px solid var(--app-accent, #b8a88a)"
                      : "1px solid var(--color-border-light)",
                    background: active
                      ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--color-text)",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {round}
                      {(round === "Coding Round (DSA)" ||
                        round === "System Design") && (
                        <span
                          className="inline-flex items-center gap-1 live-badge"
                          style={{
                            fontSize: "9px",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--color-accent)",
                            border: "1px solid var(--color-accent-border)",
                            borderRadius: 3,
                            padding: "1px 5px",
                            lineHeight: "14px",
                          }}
                        >
                          <span
                            className="w-1 h-1 rounded-full"
                            style={{
                              background: "var(--color-accent)",
                              boxShadow: "0 0 4px var(--color-accent-border)",
                            }}
                          />
                          Live
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        margin: "4px 0 0",
                      }}
                    >
                      {descriptions[round] ?? ""}
                    </p>
                  </div>
                </motion.button>
              );
            })}

            {/* Custom round option */}
            <motion.button
              onClick={() => {
                setShowingOther(true);
                if (selectedRound) {
                  onSelectRound(null);
                  onCustomRoundChange("");
                }
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "12px",
                border:
                  showingOther && !hasChosen
                    ? "1.5px solid var(--app-accent, #b8a88a)"
                    : "1px dashed var(--color-border)",
                background:
                  showingOther && !hasChosen
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--app-accent, #b8a88a)";
                e.currentTarget.style.background =
                  "var(--app-accent-bg, rgba(184,168,138,0.04))";
              }}
              onMouseLeave={(e) => {
                if (!(showingOther && !hasChosen)) {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    Other (not listed)
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    Describe the round type — AI will adapt
                  </p>
                </div>
              </div>
            </motion.button>

            {showingOther && !hasChosen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ paddingLeft: "4px" }}
              >
                <input
                  value={customRound}
                  onChange={(e) => {
                    onCustomRoundChange(e.target.value);
                    onSelectRound(null);
                  }}
                  placeholder="e.g. Take-home Assignment, Whiteboarding, Cross-functional..."
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-border)")
                  }
                  autoFocus
                />
              </motion.div>
            )}
          </>
        )}

        <motion.button
          onClick={() => {
            onSkip();
            onContinue?.();
          }}
          whileHover={{
            borderColor: "var(--app-accent, #b8a88a)",
            color: "var(--app-accent, #b8a88a)",
          }}
          whileTap={{ scale: 0.98 }}
          style={{
            textAlign: "center",
            padding: "14px 20px",
            borderRadius: "12px",
            border: "1px dashed var(--color-border)",
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginTop: "4px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "inherit",
              margin: 0,
            }}
          >
            Skip — let AI decide
          </p>
        </motion.button>
      </div>
    </div>
  );
}
