import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { api } from "../lib/api"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { ResultsSkeleton } from "../components/skeletons/ResultsSkeleton"
import type { InterviewTurn, TranscriptEvent, EvaluationStatus } from "@ai-interview/shared"

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-20">
        <svg className="size-20 -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="4"
          />
          <motion.circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: circumference * (1 - score / 100),
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
          {Math.round(score)}
        </span>
      </div>
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </div>
  )
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()

  const { data: interview, isLoading } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => api.getInterview(id!),
    enabled: !!id,
    select: (d) => d.interview,
  })

  const { data: evalStatus } = useQuery({
    queryKey: ["eval-status", id],
    queryFn: () => api.evaluationStatus(id!),
    enabled: !!id,
    refetchInterval: (query) =>
      (query.state.data as EvaluationStatus | undefined)?.status === "pending"
        ? 2000
        : false,
  })

  if (isLoading) {
    return <ResultsSkeleton />
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
    )
  }

  const isScored = evalStatus?.status === "completed" || interview.overallScore != null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {interview.position || "Interview"} Results
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {new Date(interview.createdAt).toLocaleDateString()} &middot;{" "}
            {interview.turns?.length || 0} turns
            {interview.durationSeconds
              ? ` \u00b7 ${Math.round(interview.durationSeconds / 60)} min`
              : ""}
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="secondary" size="sm">
            Dashboard
          </Button>
        </Link>
      </div>

      {isScored && interview.overallScore != null ? (
        <Card>
          <h2 className="font-semibold mb-6">Scores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ScoreCircle score={interview.overallScore} label="Overall" />
            <ScoreCircle
              score={interview.communicationScore ?? 0}
              label="Communication"
            />
            <ScoreCircle
              score={interview.technicalScore ?? 0}
              label="Technical"
            />
            <ScoreCircle
              score={interview.problemSolvingScore ?? 0}
              label="Problem Solving"
            />
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <svg className="animate-spin size-6" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="var(--color-accent)"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="var(--color-accent)"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p className="font-medium">Evaluating your interview...</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            This may take a moment
          </p>
        </Card>
      )}

      {interview.summary && (
        <Card>
          <h2 className="font-semibold mb-3">Summary</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {interview.summary.summary}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-success mb-2">
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {(interview.summary.strengths as string[]).map(
                  (s: string, i: number) => (
                    <li
                      key={i}
                      className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                    >
                      <span className="text-success mt-0.5">&bull;</span>
                      {s}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-warning mb-2">
                Areas for Improvement
              </h3>
              <ul className="space-y-1.5">
                {(interview.summary.weaknesses as string[]).map(
                  (w: string, i: number) => (
                    <li
                      key={i}
                      className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                    >
                      <span className="text-warning mt-0.5">&bull;</span>
                      {w}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {(interview.summary.recommendedTopics as string[]).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Recommended Topics</h3>
              <div className="flex flex-wrap gap-2">
                {(interview.summary.recommendedTopics as string[]).map(
                  (t: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {interview.turns && interview.turns.length > 0 && (
        <Card>
          <h2 className="font-semibold mb-4">Questions & Answers</h2>
          <div className="space-y-4">
            {interview.turns.map((turn: InterviewTurn, i: number) => (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-medium">{turn.questionText}</p>
                  {turn.score != null && (
                    <span className="shrink-0 text-sm font-semibold text-accent">
                      {Math.round(turn.score)}/100
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-2">
                  {turn.answerText || "(no answer)"}
                </p>
                {turn.feedback && (
                  <p className="text-xs text-[var(--color-text-muted)] italic border-t border-[var(--color-border)] pt-2 mt-2">
                    {turn.feedback}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {interview.transcriptEvents &&
        interview.transcriptEvents.length > 0 && (
          <Card>
            <h2 className="font-semibold mb-4">Full Transcript</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {interview.transcriptEvents.map(
                (event: TranscriptEvent, i: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="flex gap-2 text-sm py-1"
                  >
                    <span
                      className={`shrink-0 text-xs font-medium w-20 ${
                        event.role === "USER" ? "text-accent" : "text-success"
                      }`}
                    >
                      {event.role === "USER" ? "You" : "AI"}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">
                      {event.text}
                    </span>
                  </motion.div>
                )
              )}
            </div>
          </Card>
        )}
    </div>
  )
}
