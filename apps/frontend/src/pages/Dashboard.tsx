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
import { InterviewerRemembers } from "../components/Dashboard/InterviewerRemembers";
import { RoleRecommendations } from "../components/Dashboard/RoleRecommendations";
import { SidebarRight } from "../components/Dashboard/SidebarRight";
import {
  computeReadiness,
  computeComparison30Days,
  computeMilestones,
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
  const comparison = useMemo(
    () => computeComparison30Days(completed),
    [completed],
  );
  const milestones = useMemo(() => computeMilestones(completed), [completed]);

  // Derive dashboard insights from the latest evaluated interview
  const latestSummary = useMemo(() => {
    return completed.find((i) => i.summary)?.summary ?? null;
  }, [completed]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              minWidth: 0,
            }}
          >
            <ReadinessHero
              user={user}
              totalSessions={totalSessions}
              readinessScore={readinessScore}
              interviews={interviews}
            />

            {totalSessions > 0 && (
              <div
                style={{ height: "1px", background: "var(--color-border)" }}
              />
            )}

            <AiCoachCard
              summary={latestSummary}
              totalSessions={totalSessions}
            />

            {mostRecent && (
              <SessionStrip
                mostRecent={mostRecent}
                onViewResume={setPreviewResumeId}
              />
            )}

            {completed.length > 1 && <TrendsSection completed={completed} />}

            {completed.length > 0 && latestSummary && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
                className="max-md:grid-cols-1"
              >
                <WeaknessDetection summary={latestSummary} />
                <InterviewerRemembers
                  summary={latestSummary}
                  totalSessions={totalSessions}
                />
              </div>
            )}

            {latestSummary && <RoleRecommendations summary={latestSummary} />}

            {completed.length > 0 && (
              <PastSessionsTable completed={completed} />
            )}

            {!isLoading && interviews.length === 0 && (
              <EmptyState onUpload={() => setShowUpload(true)} />
            )}

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
