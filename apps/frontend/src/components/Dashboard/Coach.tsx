import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { InterviewSession } from "@evalio/shared";
import { SpectrumWave } from "../landing/svg/SpectrumWave";

interface FunnelStep {
  label: string;
  status: "done" | "active" | "pending";
  meta: string;
}

interface CoachProps {
  latestSummary: InterviewSession["summary"] | null;
  funnelSteps: FunnelStep[];
  commonPatterns?: string[];
}

export function Coach({
  latestSummary,
  funnelSteps,
  commonPatterns,
}: CoachProps) {
  return (
    <div className="db-col-block">
      <div className="db-coach-quote" style={{ overflow: "hidden" }}>
        <div
          className="db-coach-text"
          style={{ position: "relative", zIndex: 2 }}
        >
          {latestSummary ? (
            <p>&ldquo;{latestSummary.summary}&rdquo;</p>
          ) : (
            <p>
              &ldquo;Welcome to your interview prep canvas. The AI Coach will
              analyze your communication structure, problem-solving reasoning,
              and tech mastery to chart custom sessions.&rdquo;
            </p>
          )}
        </div>
        <Link
          to="/interview/new"
          className="db-coach-cta"
          style={{ position: "relative", zIndex: 2 }}
        >
          <span>Start active practice</span>
          <IconArrowUpRight size={14} />
        </Link>
        <SpectrumWave className="absolute bottom-0 inset-x-0 w-full h-[60px] pointer-events-none opacity-[0.06] text-[var(--color-accent)]" />
      </div>

      <div id="journey" className="db-signals-card">
        <h3 className="db-section-label" style={{ marginBottom: "24px" }}>
          Preparation stage progress
        </h3>

        <div className="relative pl-6 flex flex-col gap-6">
          <div
            className="absolute top-2 bottom-2 w-px pointer-events-none"
            style={{ left: "4px", background: "var(--color-border-light)" }}
            aria-hidden
          />

          {funnelSteps.map((step, idx) => {
            const isActive = step.status === "active";
            const isDone = step.status === "done";

            return (
              <div key={idx} className="relative flex items-start gap-4">
                <div
                  className="absolute flex items-center justify-center pointer-events-none"
                  style={{
                    left: "-27px",
                    width: "9px",
                    height: "9px",
                    top: "6px",
                  }}
                >
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full z-10"
                    style={{
                      background:
                        isDone || isActive
                          ? "var(--color-accent)"
                          : "var(--color-border-light)",
                      boxShadow: isActive
                        ? "0 0 0 3px var(--color-accent-bg), 0 0 10px var(--color-accent)"
                        : "none",
                    }}
                    animate={{ scale: isActive ? 1.4 : 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] tracking-[0.18em] uppercase text-[var(--color-text-muted)] font-mono">
                      STAGE 0{idx + 1}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">
                      ·
                    </span>
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-[0.04em] ${isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
                    >
                      {step.meta}
                    </span>
                  </div>
                  <p
                    className="text-[13px] leading-[1.5] transition-colors duration-300"
                    style={{
                      color: isActive
                        ? "var(--color-text)"
                        : isDone
                          ? "var(--color-text-secondary)"
                          : "var(--color-text-muted)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {commonPatterns && commonPatterns.length > 0 && (
        <div className="db-signals-card">
          <h3 className="db-section-label" style={{ marginBottom: "12px" }}>
            Behavioral Patterns
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {commonPatterns.slice(0, 4).map((pattern, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "11.5px",
                  color: "var(--color-text)",
                  background: "rgba(184,168,138,0.06)",
                  border: "1px solid rgba(184,168,138,0.12)",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  lineHeight: 1.4,
                }}
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
