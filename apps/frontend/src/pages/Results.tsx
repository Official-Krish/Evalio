import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ResultsSkeleton } from "../components/skeletons/ResultsSkeleton";
import { usePageTitle } from "@/lib/usePageTitle";
import toast from "react-hot-toast";
import type { EvaluationStatus } from "@evalio/shared";
import { getVerdict } from "../components/Result/helpers";
import { ScoreBlock } from "../components/Result/ScoreBlock";
import { SessionMeta } from "../components/Result/SessionMeta";
import { SignalSection } from "../components/Result/SignalSection";
import { ResumeAlignment } from "../components/Result/ResumeAlignment";
import { StudyRecommendations } from "../components/Result/StudyRecommendations";
import { FeedbackCTA } from "../components/Result/FeedbackCTA";
import { TurnRow } from "../components/Result/TurnRow";
import { DsaResultsSection } from "../components/Result/DsaResultsSection";
import type { DsaSessionData } from "../components/Result/types";

export function ResultsPage() {
  usePageTitle("Results");
  const { id } = useParams<{ id: string }>();

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
  const turns = interview.turns ?? [];
  const verdict = getVerdict(overall);

  const strengths: string[] =
    (interview.summary?.strengths as string[] | undefined) ?? [];
  const resumeStrengths: string[] =
    (interview.summary?.resumeStrengths as string[] | undefined) ?? [];
  const weaknesses: string[] =
    (interview.summary?.weaknesses as string[] | undefined) ?? [];
  const improvements: string[] =
    (interview.summary?.improvementAreas as string[] | undefined) ?? [];
  const resumeWeaknesses: string[] =
    (interview.summary?.resumeWeaknesses as string[] | undefined) ?? [];
  const recommendedTopics: string[] =
    (interview.summary?.recommendedTopics as string[] | undefined) ?? [];

  return (
    <div className="max-w-[840px] mx-auto pb-20 px-4">
      <SessionMeta interview={interview} turnsCount={turns.length} />

      <ScoreBlock
        showScore={interview.overallScore != null}
        overall={overall}
        comm={comm}
        tech={tech}
        prob={prob}
        verdict={verdict}
        retryingEval={retryingEval}
        evalStuck={evalStuck}
        onRetry={handleRetryEval}
      />

      {interview.summary && (
        <div className="mb-10">
          <p
            className="text-[11px] tracking-[0.1em] uppercase mb-4 font-semibold"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            AI EVALUATION SUMMARY
          </p>
          <blockquote className="res-narrative-quote">
            {interview.summary.summary}
          </blockquote>
        </div>
      )}

      {interview.summary && (
        <SignalSection
          strengths={strengths}
          weaknesses={weaknesses}
          improvements={improvements}
        />
      )}

      {interview.summary && (
        <ResumeAlignment
          strengths={resumeStrengths}
          weaknesses={resumeWeaknesses}
        />
      )}

      <StudyRecommendations topics={recommendedTopics} />

      {turns.length > 0 && (
        <div className="pb-12">
          <div className="flex items-center justify-between mb-5">
            <p
              className="text-[11px] tracking-[0.1em] uppercase m-0 font-semibold"
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
          </div>
          <div className="res-qa-timeline">
            {turns.map((turn, i) => (
              <TurnRow key={turn.id} turn={turn} index={i} />
            ))}
          </div>
        </div>
      )}

      {!!(
        (interview as unknown as Record<string, unknown>).mode === "DSA" &&
        (interview as unknown as Record<string, unknown>).dsaSession
      ) && (
        <DsaResultsSection
          session={
            (interview as unknown as Record<string, unknown>)
              .dsaSession as DsaSessionData
          }
        />
      )}

      <FeedbackCTA />
    </div>
  );
}
