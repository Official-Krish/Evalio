import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { ResumePreview } from "../components/ResumePreview";
import { UploadResumeModal } from "../components/Dashboard/UploadResumeModal";
import { SessionStrip } from "../components/Dashboard/SessionStrip";
import { PastSessionsTable } from "../components/Dashboard/PastSessionsTable";
import { EmptyState } from "../components/Dashboard/EmptyState";
import { ReadinessHero } from "../components/Dashboard/ReadinessHero";
import { AiCoachCard } from "../components/Dashboard/AiCoachCard";
import { TrendsSection } from "../components/Dashboard/TrendsSection";
import { WeaknessDetection } from "../components/Dashboard/WeaknessDetection";
import { LatestInsight } from "../components/Dashboard/LatestInsight";
import { InterviewerRemembers } from "../components/Dashboard/InterviewerRemembers";
import { RoleRecommendations } from "../components/Dashboard/RoleRecommendations";
import { SidebarRight } from "../components/Dashboard/SidebarRight";
import {
  computeReadiness,
  detectWeaknesses,
  getLatestInsight,
  analyzeAcrossSessions,
  computeComparison30Days,
  computeMilestones,
  computeRoleRecommendations,
} from "../components/Dashboard/helpers";
import { usePageTitle } from "@/lib/usePageTitle";
import type { InterviewSession } from "@evalio/shared";

export function DashboardPage() {
  usePageTitle("Dashboard");
  const { data: session } = useSession();
  const user = session?.user;
  const [showUpload, setShowUpload] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) => d.interviews,
  });

  const interviews =
    (data as (InterviewSession & {
      _count?: { turns: number };
      resume?: { id: string; version: number } | null;
    })[]) ?? [];
  const active = interviews.filter((i) => i.status === "ACTIVE");
  const continueInterview = active[0] ?? null;
  const completed = interviews.filter((i) => i.status === "COMPLETED");
  const latestCompleted = completed[0] ?? null;
  const mostRecent = continueInterview ?? latestCompleted;
  const totalSessions = interviews.length;

  const readinessScore = useMemo(
    () => computeReadiness(completed),
    [completed],
  );
  const weaknesses = useMemo(() => detectWeaknesses(completed), [completed]);
  const insight = useMemo(() => getLatestInsight(completed), [completed]);
  const remembers = useMemo(
    () => analyzeAcrossSessions(completed),
    [completed],
  );
  const comparison = useMemo(
    () => computeComparison30Days(completed),
    [completed],
  );
  const milestones = useMemo(() => computeMilestones(completed), [completed]);
  const roleRecs = useMemo(
    () => computeRoleRecommendations(completed),
    [completed],
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Global ambient background wash */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, var(--app-accent-glow, rgba(184,168,138,0.05)) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <UploadResumeModal
          open={showUpload}
          onClose={() => setShowUpload(false)}
        />
        <ResumePreview
          resumeId={previewResumeId}
          open={!!previewResumeId}
          onClose={() => setPreviewResumeId(null)}
        />

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10"
          style={{ maxWidth: "960px", margin: "0 auto" }}
        >
          {/* ── Main column ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              minWidth: 0,
            }}
          >
            {/* Hero */}
            <ReadinessHero
              user={user}
              totalSessions={totalSessions}
              readinessScore={readinessScore}
              interviews={interviews}
            />

            {/* Horizontal rule separator */}
            {totalSessions > 0 && (
              <div
                style={{ height: "1px", background: "var(--color-border)" }}
              />
            )}

            {/* AI Coach */}
            <AiCoachCard completed={completed} totalSessions={totalSessions} />

            {/* Most recent session */}
            {mostRecent && (
              <SessionStrip
                mostRecent={mostRecent}
                onViewResume={setPreviewResumeId}
              />
            )}

            {/* Trends */}
            {completed.length > 1 && <TrendsSection completed={completed} />}

            {/* Weaknesses + Latest Insight */}
            {completed.length > 0 && (weaknesses.length > 0 || insight) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
                className="max-md:grid-cols-1"
              >
                <WeaknessDetection weaknesses={weaknesses} />
                <LatestInsight
                  insight={insight}
                  hasData={completed.length > 0}
                />
              </div>
            )}

            {/* Interviewer Remembers */}
            <InterviewerRemembers
              data={remembers}
              totalSessions={totalSessions}
            />

            {/* Role Recommendations */}
            {roleRecs.length > 0 && (
              <RoleRecommendations recommendations={roleRecs} />
            )}

            {/* Past sessions */}
            {completed.length > 0 && (
              <PastSessionsTable completed={completed} />
            )}

            {/* Empty state */}
            {!isLoading && interviews.length === 0 && (
              <EmptyState onUpload={() => setShowUpload(true)} />
            )}

            {/* Feedback CTA */}
            {completed.length > 0 && (
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                <Link
                  to="/feedback"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-card)",
                    textDecoration: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--app-accent-border, rgba(184,168,138,0.3))";
                    e.currentTarget.style.background = "var(--color-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.background = "var(--color-bg-card)";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--color-text)",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Share your thoughts
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        margin: "2px 0 0",
                      }}
                    >
                      Help us improve Evalio with your feedback
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="var(--color-text-muted)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 3l4 4-4 4" />
                  </svg>
                </Link>
              </motion.div>
            )}
          </div>

          {/* ── Sidebar ── */}
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
  );
}
