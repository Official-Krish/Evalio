import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import type { InterviewSummary } from "@evalio/shared";

function useInView(threshold = 0.2) {
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

export function SummarySection({ summary }: { summary: InterviewSummary }) {
  const { ref: summaryRef, visible: summaryVisible } = useInView();
  const { ref: strengthRef, visible: strengthVisible } = useInView();
  const { ref: weakRef, visible: weakVisible } = useInView();
  const { ref: topicsRef, visible: topicsVisible } = useInView();

  return (
    <div
      style={{
        paddingBottom: "64px",
        display: "flex",
        flexDirection: "column",
        gap: "48px",
      }}
    >
      {/* ── What happened — editorial pull quote ── */}
      <div ref={summaryRef}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={summaryVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="evalio-section-label"
          style={{ marginBottom: "20px" }}
        >
          What Happened
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={summaryVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            lineHeight: 1.8,
            color: "var(--color-text-secondary)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            borderLeft:
              "2px solid var(--app-accent-border, rgba(184,168,138,0.3))",
            paddingLeft: "20px",
          }}
        >
          {summary.summary}
        </motion.p>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
        className="max-md:grid-cols-1"
      >
        {/* Strengths */}
        {(summary.strengths as string[]).length > 0 && (
          <div ref={strengthRef}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={strengthVisible ? { opacity: 1 } : {}}
              className="evalio-section-label"
              style={{ marginBottom: "16px", color: "rgba(74,222,128,0.8)" }}
            >
              What Worked
            </motion.p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {(summary.strengths as string[]).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={strengthVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="evalio-strength-bar positive"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  >
                    <path
                      d="M2.5 7l3 3 6-6"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {s}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {(summary.weaknesses as string[]).length > 0 && (
          <div ref={weakRef}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={weakVisible ? { opacity: 1 } : {}}
              className="evalio-section-label-accent"
              style={{ marginBottom: "16px" }}
            >
              What to Fix
            </motion.p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {(summary.weaknesses as string[]).map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={weakVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="evalio-strength-bar negative"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  >
                    <path
                      d="M7 4v4M7 10h.01"
                      stroke="var(--app-accent, #b8a88a)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {w}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Recommended Topics ── */}
      {(summary.recommendedTopics as string[]).length > 0 && (
        <div ref={topicsRef}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={topicsVisible ? { opacity: 1 } : {}}
            className="evalio-section-label"
            style={{ marginBottom: "16px" }}
          >
            Study These Next
          </motion.p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {(summary.recommendedTopics as string[]).map((t, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={topicsVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border:
                    "1px solid var(--app-accent-border, rgba(184,168,138,0.25))",
                  background: "var(--app-accent-bg, rgba(184,168,138,0.06))",
                  color: "var(--app-accent, #b8a88a)",
                  letterSpacing: "0.02em",
                  cursor: "default",
                }}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
