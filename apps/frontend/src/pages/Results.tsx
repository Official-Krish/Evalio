import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { ResultsSkeleton } from "../components/skeletons/ResultsSkeleton";
import { ScoreSection } from "../components/Result/ScoreSection";
import { ResumeAnalysis } from "../components/Result/ResumeAnalysis";
import { SummarySection } from "../components/Result/SummarySection";
import { QASection } from "../components/Result/QASection";
import { usePageTitle } from "@/lib/usePageTitle";
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

  const { data: interview, isLoading } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => api.getInterview(id!),
    enabled: !!id,
    select: (d) => d.interview,
  });

  const { data: evalStatus } = useQuery({
    queryKey: ["eval-status", id],
    queryFn: () => api.evaluationStatus(id!),
    enabled: !!id,
    refetchInterval: (query) =>
      (query.state.data as EvaluationStatus | undefined)?.status === "pending"
        ? 2000
        : false,
  });

  const { data: allInterviews } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(),
    select: (d) =>
      d.interviews as (InterviewSession & { _count?: { turns: number } })[],
  });

  if (isLoading) return <ResultsSkeleton />;

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
    <div style={{ maxWidth: "720px", margin: "0 auto", paddingBottom: "80px" }}>
      {/* ─── Hero header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingBottom: "48px", paddingTop: "16px" }}
      >
        {/* Back link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              letterSpacing: "0.04em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-muted)")
            }
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
            onClick={() => navigate("/interview/new")}
            style={{
              fontSize: "12px",
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
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

        {/* Session meta */}
        <p className="evalio-section-label" style={{ marginBottom: "12px" }}>
          Session Report
        </p>
        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            lineHeight: 1.1,
            margin: "0 0 10px",
          }}
        >
          {interview.position || "Interview Session"}
        </h1>

        {/* Meta tags row */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {new Date(interview.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {turns.length > 0 && (
            <span
              style={{ fontSize: "12px", color: "var(--color-text-muted)" }}
            >
              · {turns.length} turns
            </span>
          )}
          {interview.durationSeconds && (
            <span
              style={{ fontSize: "12px", color: "var(--color-text-muted)" }}
            >
              · {Math.round(interview.durationSeconds / 60)} min
            </span>
          )}

          {interview.companyName && (
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "var(--app-accent-bg, rgba(184,168,138,0.08))",
                border:
                  "1px solid var(--app-accent-border, rgba(184,168,138,0.2))",
                color: "var(--app-accent, #b8a88a)",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              {interview.companyName}
            </span>
          )}
          {interview.interviewStyle && (
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#a5b4fc",
              }}
            >
              {STYLE_LABELS[interview.interviewStyle] ??
                interview.interviewStyle}
            </span>
          )}
          {interview.interviewDepth && (
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(52,211,153,0.06)",
                border: "1px solid rgba(52,211,153,0.2)",
                color: "#6ee7b7",
              }}
            >
              {DEPTH_LABELS[interview.interviewDepth] ??
                interview.interviewDepth}
            </span>
          )}
        </div>
      </motion.div>

      {/* ─── Divider line ─────────────────────────────────────── */}
      <div
        style={{
          height: "1px",
          background: "var(--color-border)",
          marginBottom: "0",
        }}
      />

      {/* ─── Score section (cinematic) ────────────────────────── */}
      {isScored && interview.overallScore != null ? (
        <div style={{ paddingTop: "64px" }}>
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
          style={{
            paddingTop: "64px",
            paddingBottom: "48px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            className="animate-spin"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "2px solid var(--app-accent, #b8a88a)",
              borderTopColor: "transparent",
            }}
          />
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Evaluating your session…
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                margin: "2px 0 0",
              }}
            >
              This usually takes 30–60 seconds
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── Resume analysis ──────────────────────────────────── */}
      {interview.summary && <ResumeAnalysis summary={interview.summary} />}

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
        style={{
          marginTop: "24px",
          padding: "40px 32px",
          borderRadius: "20px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            height: "200px",
            background:
              "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.08)) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p className="evalio-section-label" style={{ marginBottom: "12px" }}>
          Your Voice Matters
        </p>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            margin: "0 0 8px",
          }}
        >
          How was your experience?
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          Your feedback helps us make every interview session better.
        </p>
        <Link
          to="/feedback"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 24px",
            borderRadius: "999px",
            border: "none",
            background: "var(--color-text)",
            color: "var(--color-bg)",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.2s",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
