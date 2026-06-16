import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { InterviewTurn } from "@evalio/shared";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 7
      ? "evalio-score-badge-great"
      : score >= 5
        ? "evalio-score-badge-ok"
        : "evalio-score-badge-poor";
  return (
    <span
      className={cls}
      style={{
        fontSize: "13px",
        fontWeight: 700,
        borderRadius: "8px",
        padding: "4px 12px",
        flexShrink: 0,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {score}/10
    </span>
  );
}

function QACard({ turn, index }: { turn: InterviewTurn; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const { ref, visible } = useInView();
  const score = turn.score != null ? Math.round(turn.score / 10) : null;
  const isLow = score != null && score < 6;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <div
          className="evalio-qa-card"
          style={{
            borderColor: expanded
              ? "var(--app-accent-border, rgba(184,168,138,0.3))"
              : undefined,
          }}
        >
          {/* Question header */}
          <div
            style={{
              padding: "18px 20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Q number */}
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  flexShrink: 0,
                  paddingTop: "3px",
                  minWidth: "24px",
                }}
              >
                Q{index + 1}
              </span>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {turn.questionText}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              {score != null && <ScoreBadge score={score} />}
              {/* Chevron */}
              <motion.svg
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M3 5l4 4 4-4" />
              </motion.svg>
            </div>
          </div>

          {/* Expanded answer */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    padding: "18px 20px 18px 52px",
                  }}
                >
                  {/* Answer */}
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    {turn.answerText || "(no answer recorded)"}
                  </p>

                  {/* Feedback */}
                  {turn.feedback && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "var(--color-bg-hover)",
                        borderLeft:
                          "2px solid var(--app-accent-border, rgba(184,168,138,0.35))",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          lineHeight: 1.6,
                          color: "var(--color-text-muted)",
                          margin: 0,
                          fontStyle: "italic",
                        }}
                      >
                        {turn.feedback}
                      </p>
                    </div>
                  )}

                  {/* Model answer — only for low scores */}
                  {isLow && (
                    <div style={{ marginTop: "14px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowModel((p) => !p);
                        }}
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--app-accent, #b8a88a)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: 0,
                          fontWeight: 500,
                        }}
                      >
                        <motion.span
                          animate={{ rotate: showModel ? 90 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          ▶
                        </motion.span>
                        {showModel ? "Hide" : "Show"} model answer
                      </button>
                      <AnimatePresence>
                        {showModel && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              style={{
                                marginTop: "10px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                background:
                                  "var(--app-accent-bg, rgba(184,168,138,0.05))",
                                border:
                                  "1px solid var(--app-accent-border, rgba(184,168,138,0.2))",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "13px",
                                  lineHeight: 1.65,
                                  color: "var(--color-text-secondary)",
                                  margin: 0,
                                }}
                              >
                                A strong response would directly address the
                                question with a specific example from your
                                experience, using the STAR method (Situation,
                                Task, Action, Result) to structure your answer
                                clearly and concisely — quantifying impact
                                wherever possible.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

export function QASection({ turns }: { turns: InterviewTurn[] }) {
  const { ref, visible } = useInView();

  return (
    <div style={{ paddingBottom: "64px" }}>
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <p className="evalio-section-label">Questions &amp; Answers</p>
          <span
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              background: "var(--color-bg-hover)",
              border: "1px solid var(--color-border)",
              borderRadius: "999px",
              padding: "2px 10px",
            }}
          >
            {turns.length} exchange{turns.length !== 1 ? "s" : ""}
          </span>
        </motion.div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {turns.map((turn, i) => (
          <QACard key={turn.id} turn={turn} index={i} />
        ))}
      </div>
    </div>
  );
}
