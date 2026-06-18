import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import type { InterviewSession } from "@evalio/shared";
import { STYLE_LABELS, DEPTH_LABELS } from "./constants";

interface Props {
  interview: InterviewSession;
  turnsCount: number;
}

export function SessionMeta({ interview, turnsCount }: Props) {
  const navigate = useNavigate();
  const [showJd, setShowJd] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <motion.div whileHover="hover" initial="rest" animate="rest">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.04em] no-underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{ rest: { x: 0 }, hover: { x: -3 } }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <path d="M11 7H3M6 4L3 7l3 3" />
            </motion.svg>
            <motion.span
              variants={{
                rest: { color: "var(--color-text-muted)" },
                hover: { color: "var(--color-text)" },
              }}
              transition={{ duration: 0.2 }}
            >
              Dashboard
            </motion.span>
          </Link>
        </motion.div>
        <button
          onClick={() => navigate(`/interview/new?retry=${interview.id}`)}
          className="text-[12px] px-4 py-[6px] rounded-full border cursor-pointer transition-all duration-200 tracking-[0.02em] res-glow-btn"
          style={{
            borderColor: "var(--color-border)",
            background: "transparent",
            color: "var(--color-text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor =
              "var(--app-accent-border, rgba(184,168,138,0.4))";
            e.currentTarget.style.color = "var(--app-accent, #b8a88a)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          Practice again →
        </button>
      </div>

      <p
        className="text-[11px] tracking-[0.1em] uppercase mb-2 font-semibold"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        SESSION REPORT
      </p>

      <h1
        className="text-[clamp(24px,5vw,36px)] font-[400] tracking-[-0.03em] leading-[1.1] m-0 mb-[12px]"
        style={{
          color: "var(--color-text)",
          fontFamily: "Instrument Serif, Georgia, serif",
          fontStyle: "italic",
        }}
      >
        {interview.position || "Interview Session"}
      </h1>

      <div
        className="flex items-center gap-2 flex-wrap text-[12px] mb-8"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>
          {new Date(interview.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {turnsCount > 0 && (
          <span>
            · {turnsCount} turn{turnsCount !== 1 ? "s" : ""}
          </span>
        )}
        {interview.durationSeconds != null && (
          <span>· {Math.round(interview.durationSeconds / 60)} min</span>
        )}
        {interview.companyName && (
          <span
            className="text-[10px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
            style={{
              borderColor: "var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            {interview.companyName}
          </span>
        )}
        {interview.interviewRound && (
          <span
            className="text-[10px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
            style={{
              borderColor: "var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            Round: {interview.interviewRound}
          </span>
        )}
        {interview.interviewStyle && (
          <span
            className="text-[10px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
            style={{
              borderColor: "var(--color-border-secondary)",
              color: "#5DCAA5",
            }}
          >
            {STYLE_LABELS[interview.interviewStyle] ?? interview.interviewStyle}
          </span>
        )}
        {interview.interviewDepth && (
          <span
            className="text-[10px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
            style={{
              borderColor: "var(--color-border-secondary)",
              color: "#7F77DD",
            }}
          >
            {DEPTH_LABELS[interview.interviewDepth] ?? interview.interviewDepth}
          </span>
        )}
      </div>

      {interview.jobDescription && (
        <div className="mb-8 p-4 rounded-xl border border-[var(--color-border-light)] bg-transparent">
          <button
            onClick={() => setShowJd(!showJd)}
            style={{
              color: "var(--color-text)",
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
            }}
            className="p-0 cursor-pointer flex items-center justify-between"
          >
            <span className="text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-text-secondary)]">
              Target Job Description
            </span>
            <span className="text-[12px] text-[var(--app-accent)] hover:underline">
              {showJd ? "Hide Details" : "Show Details"}
            </span>
          </button>
          <AnimatePresence>
            {showJd && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="text-[12.5px] leading-[1.6] text-[var(--color-text-secondary)] mt-3 mb-0 whitespace-pre-wrap">
                  {interview.jobDescription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
