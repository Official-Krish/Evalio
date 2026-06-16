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
      className={`${cls} text-[13px] font-[700] rounded-lg px-3 py-1 flex-shrink-0`}
      style={{ fontVariantNumeric: "tabular-nums" }}
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
        className="w-full text-left bg-none border-none p-0 cursor-pointer"
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
          <div className="flex items-start justify-between gap-4 p-[18px_20px]">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span
                className="text-[10px] font-[600] tracking-[0.12em] uppercase flex-shrink-0 pt-[3px] min-w-[24px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Q{index + 1}
              </span>
              <p
                className="text-[14px] font-[500] leading-[1.5] m-0"
                style={{ color: "var(--color-text)" }}
              >
                {turn.questionText}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {score != null && <ScoreBadge score={score} />}
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
                className="flex-shrink-0"
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
                className="overflow-hidden"
              >
                <div
                  className="p-[18px_20px_18px_52px]"
                  style={{ borderTop: "1px solid var(--color-border)" }}
                >
                  <p
                    className="text-[13px] leading-[1.7] m-0"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {turn.answerText || "(no answer recorded)"}
                  </p>

                  {turn.feedback && (
                    <div
                      className="mt-3 px-[14px] py-[10px] rounded-lg"
                      style={{
                        background: "var(--color-bg-hover)",
                        borderLeft:
                          "2px solid var(--app-accent-border, rgba(184,168,138,0.35))",
                      }}
                    >
                      <p
                        className="text-[12px] leading-[1.6] m-0 italic"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {turn.feedback}
                      </p>
                    </div>
                  )}

                  {isLow && (
                    <div className="mt-[14px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowModel((p) => !p);
                        }}
                        className="text-[11px] tracking-[0.06em] uppercase bg-none border-none cursor-pointer inline-flex items-center gap-1.5 p-0 font-[500]"
                        style={{ color: "var(--app-accent, #b8a88a)" }}
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
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-[10px] px-4 py-3 rounded-lg"
                              style={{
                                background:
                                  "var(--app-accent-bg, rgba(184,168,138,0.05))",
                                border:
                                  "1px solid var(--app-accent-border, rgba(184,168,138,0.2))",
                              }}
                            >
                              <p
                                className="text-[13px] leading-[1.65] m-0"
                                style={{ color: "var(--color-text-secondary)" }}
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
    <div className="pb-16">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-5"
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            QUESTIONS & ANSWERS
          </p>
          <span
            className="text-[11px] px-[10px] py-[2px] rounded-full border"
            style={{
              color: "var(--color-text-muted)",
              background: "var(--color-bg-hover)",
              borderColor: "var(--color-border)",
            }}
          >
            {turns.length} exchange{turns.length !== 1 ? "s" : ""}
          </span>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2">
        {turns.map((turn, i) => (
          <QACard key={turn.id} turn={turn} index={i} />
        ))}
      </div>
    </div>
  );
}
