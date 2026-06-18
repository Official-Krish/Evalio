import { motion } from "motion/react";
import { ConfidenceOrb } from "../landing/svg/ConfidenceOrb";
import type { getVerdict } from "./helpers";

interface Props {
  showScore: boolean;
  overall: number;
  comm: number;
  tech: number;
  prob: number;
  verdict: ReturnType<typeof getVerdict>;
  retryingEval: boolean;
  evalStuck: boolean;
  onRetry: () => Promise<void>;
}

export function ScoreBlock({
  showScore,
  overall,
  comm,
  tech,
  prob,
  verdict,
  retryingEval,
  evalStuck,
  onRetry,
}: Props) {
  if (showScore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="res-score-canvas"
      >
        <div className="res-score-inner">
          <div className="shrink-0 flex flex-col items-center justify-center relative min-w-37.5">
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span
                className="text-[48px] font-normal leading-none"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "Instrument Serif, Georgia, serif",
                }}
              >
                {overall}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] tracking-wider mt-1 uppercase font-semibold">
                SCORE
              </span>
            </div>
          </div>
          <div className="res-score-metrics">
            <div className="mb-4">
              <h3 className="text-[16px] font-[500] m-0 mb-1">
                {verdict.label}
              </h3>
              <p
                className="text-[12.5px] leading-[1.5] m-0"
                style={{ color: "var(--color-text-muted)" }}
              >
                {verdict.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--db-metric-line)]">
              <div className="res-metric-row">
                <span className="res-metric-label">Communication</span>
                <div className="res-metric-bar-wrapper">
                  <div
                    className="res-metric-bar-fill"
                    style={{ width: `${comm * 10}%`, background: "#5DCAA5" }}
                  />
                </div>
                <span className="res-metric-value">{comm}</span>
              </div>
              <div className="res-metric-row">
                <span className="res-metric-label">Technical</span>
                <div className="res-metric-bar-wrapper">
                  <div
                    className="res-metric-bar-fill"
                    style={{ width: `${tech * 10}%`, background: "#7F77DD" }}
                  />
                </div>
                <span className="res-metric-value">{tech}</span>
              </div>
              <div className="res-metric-row">
                <span className="res-metric-label">Problem Solving</span>
                <div className="res-metric-bar-wrapper">
                  <div
                    className="res-metric-bar-fill"
                    style={{ width: `${prob * 10}%`, background: "#EF9F27" }}
                  />
                </div>
                <span className="res-metric-value">{prob}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-[14px] pt-12 pb-12"
    >
      <div
        className="animate-spin size-5 rounded-full border-2"
        style={{
          borderColor: "var(--app-accent, #b8a88a)",
          borderTopColor: "transparent",
        }}
      />
      <div>
        <p
          className="text-[14px] font-[500] m-0"
          style={{ color: "var(--color-text)" }}
        >
          {retryingEval
            ? "Re-evaluating your session…"
            : "Evaluating your session…"}
        </p>
        <p
          className="text-[12px] m-0 mt-[2px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          This usually takes 30–60 seconds
        </p>
        {evalStuck && !retryingEval && (
          <button
            onClick={onRetry}
            className="mt-4 text-[12px] px-4 py-[6px] rounded-full border cursor-pointer transition-all duration-200"
            style={{
              borderColor: "var(--app-accent, #b8a88a)",
              background: "transparent",
              color: "var(--app-accent, #b8a88a)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "var(--app-accent-bg, rgba(184,168,138,0.1))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Stuck? Retry evaluation
          </button>
        )}
      </div>
    </motion.div>
  );
}
