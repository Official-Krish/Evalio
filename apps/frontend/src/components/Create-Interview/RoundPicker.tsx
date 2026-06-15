import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { COMPANIES } from "@evalio/shared";

interface RoundPickerProps {
  companyId: string | null;
  selectedRound: string | null;
  customRound: string;
  onSelectRound: (round: string | null) => void;
  onCustomRoundChange: (val: string) => void;
  onSkip: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: "15px",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg-hover)",
  color: "var(--color-text)",
  outline: "none",
};

const descriptions: Record<string, string> = {
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

export function RoundPicker({
  companyId,
  selectedRound,
  customRound,
  onSelectRound,
  onCustomRoundChange,
  onSkip,
}: RoundPickerProps) {
  const [showingOther, setShowingOther] = useState(false);
  const company = useMemo(() => {
    if (!companyId || companyId === "__custom__") return null;
    return COMPANIES.find((c) => c.id === companyId) ?? null;
  }, [companyId]);

  const rounds = company?.interviewRounds ?? [];
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
                  onSelectRound(active ? null : round);
                  if (active) onCustomRoundChange("");
                  setShowingOther(false);
                }}
                whileTap={{ scale: 0.98 }}
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
                    }}
                  >
                    {round}
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
              onClick={() => setShowingOther(true)}
              whileTap={{ scale: 0.98 }}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "12px",
                border: showingOther
                  ? "1.5px solid var(--app-accent, #b8a88a)"
                  : "1px dashed var(--color-border)",
                background: showingOther
                  ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
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
          <input
            value={customRound}
            onChange={(e) => onCustomRoundChange(e.target.value)}
            placeholder="Describe the interview round..."
            style={inputStyle}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-accent)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            autoFocus
          />
        )}

        <motion.button
          onClick={onSkip}
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
              color: "var(--color-text-muted)",
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
