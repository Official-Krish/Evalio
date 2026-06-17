import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { ResultsSkeleton } from "../components/skeletons/ResultsSkeleton";
import { ScoreSection } from "../components/Result/ScoreSection";
import { ResumeAnalysis } from "../components/Result/ResumeAnalysis";
import { SummarySection } from "../components/Result/SummarySection";
import { QASection } from "../components/Result/QASection";
import { usePageTitle } from "@/lib/usePageTitle";
import toast from "react-hot-toast";
import type { EvaluationStatus, InterviewSession } from "@evalio/shared";

const STYLE_LABELS: Record<string, string> = {
  SUPPORTIVE: "Supportive",
  PROFESSIONAL: "Professional",
  CHALLENGING: "Challenging",
  BAR_RAISER: "Bar Raiser",
};
const DEPTH_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  PROBING: "Probing",
  CHALLENGE: "Challenge",
  BAR_RAISER: "Bar Raiser",
};

export function ResultsPage() {
  usePageTitle("Results");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: interview,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => api.getInterview(id!),
    enabled: !!id,
    select: (d) => d.interview,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: evalStatus } = useQuery({
    queryKey: ["eval-status", id],
    queryFn: () => api.evaluationStatus(id!),
    enabled: !!id,
    refetchInterval: (query) =>
      (query.state.data as EvaluationStatus | undefined)?.status === "pending"
        ? 10_000
        : false,
  });

  const queryClient = useQueryClient();
  const [evalStuck, setEvalStuck] = useState(false);
  const [retryingEval, setRetryingEval] = useState(false);

  useEffect(() => {
    if (evalStatus?.status !== "pending") return;
    const timer = setTimeout(() => setEvalStuck(true), 90_000);
    return () => clearTimeout(timer);
  }, [evalStatus?.status]);

  const handleRetryEval = async () => {
    if (!id || retryingEval) return;
    setRetryingEval(true);
    try {
      await api.evaluate(id);
      queryClient.invalidateQueries({ queryKey: ["eval-status", id] });
      queryClient.invalidateQueries({ queryKey: ["interview", id] });
      toast.success("Evaluation complete");
    } catch {
      toast.error("Evaluation failed. Try again.");
    } finally {
      setRetryingEval(false);
    }
  };

  const { data: allInterviews } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(),
    select: (d) =>
      d.interviews as (InterviewSession & { _count?: { turns: number } })[],
  });

  if (evalStatus?.status === "failed") {
    return (
      <div className="text-center py-20 px-6">
        <p className="text-[15px] font-[500] text-[var(--color-text)] mb-2">
          Evaluation failed
        </p>
        <p className="text-[13px] text-[var(--color-text-muted)] mb-6">
          Something went wrong while evaluating your session. You can retry or
          go back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetryEval}
            disabled={retryingEval}
            className="px-5 py-[8px] rounded-full text-[13px] font-[500] cursor-pointer transition-opacity disabled:opacity-50"
            style={{
              background: "var(--color-text)",
              color: "var(--color-bg)",
            }}
          >
            {retryingEval ? "Retrying…" : "Retry evaluation"}
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-[8px] rounded-full text-[13px] font-[500] no-underline border cursor-pointer"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <ResultsSkeleton />;

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">
          Failed to load interview
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => refetch()}
            className="text-accent text-sm hover:underline cursor-pointer"
          >
            Try again
          </button>
          <span className="text-[var(--color-text-muted)] text-xs">|</span>
          <Link to="/dashboard" className="text-accent text-sm hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">
          Interview not found
        </p>
        <Link
          to="/dashboard"
          className="text-accent text-sm hover:underline mt-2 inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isScored =
    evalStatus?.status === "completed" || interview.overallScore != null;
  const overall =
    interview.overallScore != null
      ? Math.round(interview.overallScore / 10)
      : 0;
  const comm =
    interview.communicationScore != null
      ? Math.round(interview.communicationScore / 10)
      : 0;
  const tech =
    interview.technicalScore != null
      ? Math.round(interview.technicalScore / 10)
      : 0;
  const prob =
    interview.problemSolvingScore != null
      ? Math.round(interview.problemSolvingScore / 10)
      : 0;

  const prevSession =
    (allInterviews ?? [])
      .filter(
        (i) =>
          i.id !== id &&
          i.position === interview.position &&
          i.status === "COMPLETED" &&
          i.overallScore != null,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] ?? null;

  const delta =
    prevSession &&
    interview.overallScore != null &&
    prevSession.overallScore != null
      ? Math.round(interview.overallScore / 10) -
        Math.round(prevSession.overallScore / 10)
      : null;

  const turns = interview.turns ?? [];

  return (
    <div className="max-w-[720px] mx-auto pb-20">
      {/* ─── Hero header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pb-12 pt-4"
      >
        {/* Back link + Practice again */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.04em] no-underline transition-colors duration-200 hover:text-[var(--color-text)]"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 7H3M6 4L3 7l3 3" />
            </svg>
            Dashboard
          </Link>
          <button
            onClick={() => navigate(`/interview/new?retry=${id}`)}
            className="text-[12px] px-4 py-[6px] rounded-full border cursor-pointer transition-all duration-200 tracking-[0.02em]"
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

        {/* Section label */}
        <p
          className="text-[11px] tracking-[0.1em] uppercase mb-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          SESSION REPORT
        </p>

        {/* Title */}
        <h1
          className="text-[clamp(22px,4vw,32px)] font-[500] tracking-[-0.03em] leading-[1.1] m-0 mb-[10px]"
          style={{ color: "var(--color-text)" }}
        >
          {interview.position || "Interview Session"}
        </h1>

        {/* Meta tags row */}
        <div
          className="flex items-center gap-2 flex-wrap text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>
            {new Date(interview.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {turns.length > 0 && (
            <span>
              · {turns.length} turn{turns.length !== 1 ? "s" : ""}
            </span>
          )}
          {interview.durationSeconds != null && (
            <span>· {Math.round(interview.durationSeconds / 60)} min</span>
          )}

          {interview.companyName && (
            <span
              className="text-[11px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
              style={{
                borderColor: "var(--color-border-secondary)",
                color: "var(--color-text-secondary)",
              }}
            >
              {interview.companyName}
            </span>
          )}
          {interview.interviewStyle && (
            <span
              className="text-[11px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
              style={{
                borderColor: "var(--color-border-secondary)",
                color: "#5DCAA5",
              }}
            >
              {STYLE_LABELS[interview.interviewStyle] ??
                interview.interviewStyle}
            </span>
          )}
          {interview.interviewDepth && (
            <span
              className="text-[11px] tracking-[0.06em] px-[10px] py-[3px] rounded-full border-[0.5px]"
              style={{
                borderColor: "var(--color-border-secondary)",
                color: "#7F77DD",
              }}
            >
              {DEPTH_LABELS[interview.interviewDepth] ??
                interview.interviewDepth}
            </span>
          )}
        </div>
      </motion.div>

      {/* ─── Divider ─────────────────────────────────────────── */}
      <hr
        className="border-t-[0.5px] my-6"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      />

      {/* ─── Score section ───────────────────────────────────── */}
      {isScored && interview.overallScore != null ? (
        <div>
          <p
            className="text-[11px] tracking-[0.1em] uppercase mb-4"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            OVERALL SCORE
          </p>
          <ScoreSection
            overall={overall}
            delta={delta}
            comm={comm}
            tech={tech}
            prob={prob}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-[14px] pt-16 pb-12"
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
                onClick={handleRetryEval}
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
      )}

      {/* ─── Divider ─────────────────────────────────────────── */}
      <hr
        className="border-t-[0.5px] my-6"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      />

      {/* ─── Resume analysis ──────────────────────────────────── */}
      {interview.summary && <ResumeAnalysis summary={interview.summary} />}

      {/* ─── Divider ─────────────────────────────────────────── */}
      <hr
        className="border-t-[0.5px] my-6"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      />

      {/* ─── Summary narrative ────────────────────────────────── */}
      {interview.summary && <SummarySection summary={interview.summary} />}

      {/* ─── Q&A section ─────────────────────────────────────── */}
      {turns.length > 0 && <QASection turns={turns} />}

      {/* ─── Feedback CTA ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 py-10 px-8 rounded-xl border text-center relative overflow-hidden"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-bg-card)",
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: "300px",
            height: "200px",
            background:
              "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.08)) 0%, transparent 70%)",
          }}
        />
        <p
          className="text-[11px] tracking-[0.1em] uppercase mb-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Your Voice Matters
        </p>
        <h2
          className="text-[22px] font-[500] tracking-[-0.02em] m-0 mb-2"
          style={{ color: "var(--color-text)" }}
        >
          How was your experience?
        </h2>
        <p
          className="text-[13px] m-0 mb-6 leading-[1.6]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Your feedback helps us make every interview session better.
        </p>
        <Link
          to="/feedback"
          className="inline-flex items-center gap-2 px-6 py-[10px] rounded-full text-[13px] font-[600] no-underline transition-opacity duration-200 hover:opacity-85"
          style={{
            background: "var(--color-text)",
            color: "var(--color-bg)",
            letterSpacing: "0.02em",
          }}
        >
          Share feedback
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 2l4 4-4 4" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}
