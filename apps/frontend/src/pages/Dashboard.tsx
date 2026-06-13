import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { useSession } from "../lib/auth"
import { ResumePreview } from "../components/ResumePreview"
import { UploadResumeModal } from "../components/Dashboard/UploadResumeModal"
import { SessionStrip } from "../components/Dashboard/SessionStrip"
import { PastSessionsTable } from "../components/Dashboard/PastSessionsTable"
import { QuickStartStrip } from "../components/Dashboard/QuickStartStrip"
import { EmptyState } from "../components/Dashboard/EmptyState"
import { ReadinessHero } from "../components/Dashboard/ReadinessHero"
import { AiCoachCard } from "../components/Dashboard/AiCoachCard"
import { TrendsSection } from "../components/Dashboard/TrendsSection"
import { WeaknessDetection } from "../components/Dashboard/WeaknessDetection"
import { LatestInsight } from "../components/Dashboard/LatestInsight"
import { InterviewerRemembers } from "../components/Dashboard/InterviewerRemembers"
import { RoleRecommendations } from "../components/Dashboard/RoleRecommendations"
import { SidebarRight } from "../components/Dashboard/SidebarRight"
import {
  computeReadiness,
  detectWeaknesses,
  getLatestInsight,
  analyzeAcrossSessions,
  computeComparison30Days,
  computeMilestones,
  computeRoleRecommendations,
} from "../components/Dashboard/helpers"
import type { InterviewSession } from "@ai-interview/shared"

export function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [showUpload, setShowUpload] = useState(false)
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) => d.interviews,
  })

  const interviews = (data as (InterviewSession & { _count?: { turns: number }; resume?: { id: string; version: number } | null })[]) ?? []
  const active = interviews.filter((i) => i.status === "ACTIVE")
  const continueInterview = active[0] ?? null
  const completed = interviews.filter((i) => i.status === "COMPLETED")
  const latestCompleted = completed[0] ?? null
  const mostRecent = continueInterview ?? latestCompleted
  const totalSessions = interviews.length

  const readinessScore = useMemo(() => computeReadiness(completed), [completed])
  const weaknesses = useMemo(() => detectWeaknesses(completed), [completed])
  const insight = useMemo(() => getLatestInsight(completed), [completed])
  const remembers = useMemo(() => analyzeAcrossSessions(completed), [completed])
  const comparison = useMemo(() => computeComparison30Days(completed), [completed])
  const milestones = useMemo(() => computeMilestones(completed), [completed])
  const roleRecs = useMemo(() => computeRoleRecommendations(completed), [completed])

  return (
    <div className="py-6" style={{ position: "relative" }}>
      {/* Page background wash */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at 30% 0%, rgba(124,58,237,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <UploadResumeModal open={showUpload} onClose={() => setShowUpload(false)} />
        <ResumePreview
          resumeId={previewResumeId}
          open={!!previewResumeId}
          onClose={() => setPreviewResumeId(null)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10" style={{ maxWidth: "960px", margin: "0 auto" }}>
          {/* Main column */}
          <div className="space-y-6 min-w-0">
            <ReadinessHero
              user={user}
              totalSessions={totalSessions}
              readinessScore={readinessScore}
              interviews={interviews}
            />

            <AiCoachCard completed={completed} totalSessions={totalSessions} />

            {mostRecent && (
              <SessionStrip mostRecent={mostRecent} onViewResume={setPreviewResumeId} />
            )}

            {completed.length > 1 && <TrendsSection completed={completed} />}

            {/* Misses + Insight side by side */}
            {completed.length > 0 && (weaknesses.length > 0 || insight) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="max-md:grid-cols-1">
                <WeaknessDetection weaknesses={weaknesses} />
                <LatestInsight insight={insight} hasData={completed.length > 0} />
              </div>
            )}

            <InterviewerRemembers data={remembers} totalSessions={totalSessions} />

            {roleRecs.length > 0 && <RoleRecommendations recommendations={roleRecs} />}

            {completed.length > 0 && <QuickStartStrip />}

            {completed.length > 0 && <PastSessionsTable completed={completed} />}

            {!isLoading && interviews.length === 0 && (
              <EmptyState onUpload={() => setShowUpload(true)} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 self-start">
            <SidebarRight
              interviews={interviews}
              completed={completed}
              comparison={comparison}
              milestones={milestones}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
