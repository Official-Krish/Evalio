import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ResultsSkeleton } from "../components/skeletons/ResultsSkeleton";
import { ScoreSection } from "../components/Result/ScoreSection";
import { ResumeAnalysis } from "../components/Result/ResumeAnalysis";
import { SummarySection } from "../components/Result/SummarySection";
import { QASection } from "../components/Result/QASection";
import { usePageTitle } from "@/lib/usePageTitle";
import type { EvaluationStatus, InterviewSession } from "@evalio/shared";

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
    <div className="max-w-3xl mx-auto">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--landing-fg)",
              lineHeight: 1.2,
            }}
          >
            Session Report
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "4px",
            }}
          >
            {interview.position}{" "}
            {new Date(interview.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            {turns.length} turns
            {interview.durationSeconds
              ? ` \u00b7 ${Math.round(interview.durationSeconds / 60)} min`
              : ""}
          </p>
          {interview.companyName && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginTop: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  background: "rgba(99,102,241,0.1)",
                  color: "#818CF8",
                }}
              >
                {interview.companyName}
              </span>
              {interview.interviewStyle && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    background: "rgba(251,191,36,0.1)",
                    color: "#FCD34D",
                  }}
                >
                  {interview.interviewStyle === "SUPPORTIVE"
                    ? "Supportive"
                    : interview.interviewStyle === "PROFESSIONAL"
                      ? "Professional"
                      : interview.interviewStyle === "CHALLENGING"
                        ? "Challenging"
                        : "Bar Raiser"}
                </span>
              )}
              {interview.interviewDepth && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    background: "rgba(52,211,153,0.1)",
                    color: "#6EE7B7",
                  }}
                >
                  {interview.interviewDepth === "STANDARD"
                    ? "Standard"
                    : interview.interviewDepth === "PROBING"
                      ? "Probing"
                      : interview.interviewDepth === "CHALLENGE"
                        ? "Challenge"
                        : "Bar Raiser"}
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            to="/dashboard"
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
            }}
          >
            &larr; Back to dashboard
          </Link>
          <button
            onClick={() => navigate("/interview/new")}
            style={{
              fontSize: "13px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
            }}
          >
            Practice this role again
          </button>
        </div>
      </div>

      {isScored && interview.overallScore != null ? (
        <ScoreSection
          overall={overall}
          delta={delta}
          comm={comm}
          tech={tech}
          prob={prob}
        />
      ) : (
        <div
          style={{
            padding: "0 0 48px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <svg
            className="animate-spin"
            style={{ width: "20px", height: "20px" }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="var(--app-accent, #b8a88a)"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="var(--app-accent, #b8a88a)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Evaluating your interview...
          </span>
        </div>
      )}

      {interview.summary && <ResumeAnalysis summary={interview.summary} />}

      {interview.summary && <SummarySection summary={interview.summary} />}

      {turns.length > 0 && <QASection turns={turns} />}

      <div
        style={{
          marginTop: "48px",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-elevated)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "18px", margin: 0 }}>💬</p>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-text)",
            margin: "8px 0 4px",
          }}
        >
          How was your interview experience?
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            margin: "0 0 14px",
            lineHeight: 1.5,
          }}
        >
          Your feedback helps us make Evalio better for everyone.
        </p>
        <Link
          to="/feedback"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            borderRadius: "6px",
            border: "none",
            background: "var(--landing-accent, #b8a88a)",
            color: "#080808",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.15s",
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
      </div>
    </div>
  );
}
