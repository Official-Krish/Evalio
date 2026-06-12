import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { useSession } from "../lib/auth"
import { ResumePreview } from "../components/ResumePreview"
import { UploadResumeModal } from "../components/Dashboard/UploadResumeModal"
import { SessionStrip } from "../components/Dashboard/SessionStrip"
import { PastSessionsTable } from "../components/Dashboard/PastSessionsTable"
import { QuickStartStrip } from "../components/Dashboard/QuickStartStrip"
import { WeeklySidebar } from "../components/Dashboard/WeeklySidebar"
import { EmptyState } from "../components/Dashboard/EmptyState"
import { greeting, computeTrend, computeStreak } from "../components/Dashboard/helpers"
import type { InterviewSession } from "@ai-interview/shared"

export function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [showUpload, setShowUpload] = useState(false)
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(),
    select: (d) => d.interviews,
  })

  const interviews = (data as (InterviewSession & { _count?: { turns: number }; resume?: { id: string; version: number } | null })[]) ?? []
  const active = interviews.filter((i) => i.status === "ACTIVE")
  const continueInterview = active[0] ?? null
  const completed = interviews.filter((i) => i.status === "COMPLETED")

  const latestCompleted = completed[0] ?? null
  const mostRecent = continueInterview ?? latestCompleted

  const totalSessions = interviews.length
  const clarityScores = completed.map((i) => i.overallScore).filter((s): s is number => s != null)
  const trendText = computeTrend(clarityScores)
  const streak = computeStreak(interviews)
  const weeklyGoal = 5

  const weeklyStats = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const cutoff = new Date(Date.now() - 7 * 86400000)
    const thisWeek = interviews.filter((i) => new Date(i.createdAt) >= cutoff)
    const thisWeekCompleted = thisWeek.filter((i) => i.status === "COMPLETED")
    const sessions = thisWeek.length
    const avgClarity = thisWeekCompleted.length > 0
      ? thisWeekCompleted.reduce((sum, i) => sum + (i.overallScore ?? 0), 0) / thisWeekCompleted.length
      : null
    const best = thisWeekCompleted.length > 0
      ? thisWeekCompleted.reduce((best, i) =>
          (i.overallScore ?? 0) > (best.overallScore ?? 0) ? i : best
        )
      : null
    return { sessions, avgClarity, best }
  }, [interviews])

  const weeklyProgress = Math.min(weeklyStats.sessions / weeklyGoal, 1)
  const sparklineScores = useMemo(() => clarityScores.slice(-8), [clarityScores])

  return (
    <div>
      <UploadResumeModal open={showUpload} onClose={() => setShowUpload(false)} />
      <ResumePreview
        resumeId={previewResumeId}
        open={!!previewResumeId}
        onClose={() => setPreviewResumeId(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10">
        <div className="space-y-10 min-w-0">
          {/* Greeting */}
          <section>
            {user && (
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>
                  {greeting()}, {user.name?.split(" ")[0]}
                </span>
                {streak >= 2 && (
                  <span style={{ fontSize: "12px", color: "rgba(255,180,0,0.7)" }}>
                    &#x1F525; {streak}-day streak
                  </span>
                )}
              </p>
            )}
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--landing-fg)",
                lineHeight: 1.2,
              }}
            >
              {totalSessions > 0
                ? `${totalSessions} session${totalSessions !== 1 ? "s" : ""} in. ${trendText}`
                : "Start your first practice session."}
            </h1>
          </section>

          {mostRecent && (
            <SessionStrip
              mostRecent={mostRecent}
              onViewResume={setPreviewResumeId}
            />
          )}

          {completed.length > 0 && <QuickStartStrip />}

          {completed.length > 0 && <PastSessionsTable completed={completed} />}

          {!isLoading && interviews.length === 0 && (
            <EmptyState onUpload={() => setShowUpload(true)} />
          )}
        </div>

        <WeeklySidebar
          sessions={weeklyStats.sessions}
          goal={weeklyGoal}
          progress={weeklyProgress}
          avgClarity={weeklyStats.avgClarity}
          best={weeklyStats.best}
          sparklineScores={sparklineScores}
        />
      </div>
    </div>
  )
}
