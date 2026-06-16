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
    <div className="pb-16 flex flex-col gap-12">
      {/* ── What happened ── */}
      <div ref={summaryRef}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={summaryVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-[11px] tracking-[0.1em] uppercase mb-5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          WHAT HAPPENED
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={summaryVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(15px,2vw,18px)] leading-[1.8] font-[400] tracking-[-0.01em] pl-5"
          style={{
            color: "var(--color-text-secondary)",
            borderLeft:
              "2px solid var(--app-accent-border, rgba(184,168,138,0.3))",
          }}
        >
          {summary.summary}
        </motion.p>
      </div>

      {/* ── Performance strengths & weaknesses ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {(summary.strengths as string[]).length > 0 && (
          <div ref={strengthRef}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={strengthVisible ? { opacity: 1 } : {}}
              className="text-[11px] tracking-[0.1em] uppercase mb-4"
              style={{ color: "#3B6D11" }}
            >
              What Worked
            </motion.p>
            <div className="flex flex-col gap-2">
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
                  className="flex items-start gap-2.5"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="flex-shrink-0 mt-[3px]"
                  >
                    <path
                      d="M2.5 7l3 3 6-6"
                      stroke="#639922"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="text-[13px] leading-[1.6]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {s}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {(summary.weaknesses as string[]).length > 0 && (
          <div ref={weakRef}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={weakVisible ? { opacity: 1 } : {}}
              className="text-[11px] tracking-[0.1em] uppercase mb-4"
              style={{ color: "#854F0B" }}
            >
              What to Fix
            </motion.p>
            <div className="flex flex-col gap-2">
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
                  className="flex items-start gap-2.5"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="flex-shrink-0 mt-[3px]"
                  >
                    <path
                      d="M7 4v4M7 10h.01"
                      stroke="#BA7517"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="text-[13px] leading-[1.6]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {w}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Recommended topics ── */}
      {(summary.recommendedTopics as string[]).length > 0 && (
        <div ref={topicsRef}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={topicsVisible ? { opacity: 1 } : {}}
            className="text-[11px] tracking-[0.1em] uppercase mb-4"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            STUDY THESE NEXT
          </motion.p>
          <div className="flex flex-wrap gap-2">
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
                className="text-[12px] font-[500] px-[14px] py-[6px] rounded-full border cursor-default tracking-[0.02em]"
                style={{
                  borderColor:
                    "var(--app-accent-border, rgba(184,168,138,0.25))",
                  background: "var(--app-accent-bg, rgba(184,168,138,0.06))",
                  color: "var(--app-accent, #b8a88a)",
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
