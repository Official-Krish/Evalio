import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ResumePreview } from "../components/ResumePreview";
import { UploadResumeModal } from "../components/Dashboard/UploadResumeModal";
import { Sidebar } from "../components/Dashboard/Sidebar";
import { Hero } from "../components/Dashboard/Hero";
import { Signals } from "../components/Dashboard/Signals";
import { Coach } from "../components/Dashboard/Coach";
import { History } from "../components/Dashboard/History";
import { computeReadiness } from "../components/Dashboard/helpers";
import { usePageTitle } from "@/lib/usePageTitle";
import type { InterviewSession } from "@evalio/shared";

export function DashboardPage() {
  usePageTitle("Dashboard");
  const [showUpload, setShowUpload] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) => d.interviews,
  });

  const interviews = useMemo(() => {
    return (
      (data as (InterviewSession & {
        _count?: { turns: number };
        resume?: { id: string; version: number } | null;
      })[]) ?? []
    );
  }, [data]);

  const completed = interviews.filter((i) => i.status === "COMPLETED");
  const totalSessions = interviews.length;
  const hasResume = interviews.some((i) => i.resume != null);
  const readinessScore = useMemo(
    () => computeReadiness(completed),
    [completed],
  );

  const { data: skillProfile } = useQuery({
    queryKey: ["skills"],
    queryFn: api.getSkillProfile,
    enabled: completed.length >= 4,
  });

  const safeArr = (v: unknown): unknown[] => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      try {
        const p = JSON.parse(v);
        if (Array.isArray(p)) return p;
      } catch {
        /* not JSON */
      }
    }
    return [];
  };
  const safeObj = (v: unknown): Record<string, unknown> => {
    if (v && typeof v === "object" && !Array.isArray(v))
      return v as Record<string, unknown>;
    if (typeof v === "string") {
      try {
        const p = JSON.parse(v);
        if (p && typeof p === "object") return p;
      } catch {
        /* not JSON */
      }
    }
    return {};
  };

  const profile = skillProfile?.profile as Record<string, unknown> | null;

  const identityTraitsRaw = safeObj(profile?.identityTraits) as Record<
    string,
    { score: number; description: string; level: string; trend: string }
  >;
  const failurePatternsRaw = safeArr(profile?.failurePatterns) as {
    label: string | null;
    code: string;
    frequency: number;
    totalSessions: number;
    severity: string;
    trend: string;
    evidence: { interviewId: string; date: string; reason: string }[];
  }[];
  const patternsRaw = safeArr(profile?.commonPatterns) as string[];

  const traits = useMemo(
    () =>
      Object.keys(identityTraitsRaw).length > 0 ? identityTraitsRaw : null,
    [identityTraitsRaw],
  );
  const failurePatterns = useMemo(
    () => failurePatternsRaw,
    [failurePatternsRaw],
  );
  const mostImproved = (profile?.mostImprovedSkill as string | null) ?? null;
  const weakest = (profile?.weakestSkill as string | null) ?? null;
  const commonPatterns = useMemo(() => patternsRaw, [patternsRaw]);

  const latestSummary = useMemo(() => {
    return completed.find((i) => i.summary)?.summary ?? null;
  }, [completed]);

  type StepStatus = "done" | "active" | "pending";
  const funnelSteps = useMemo(() => {
    const isResumeUploaded = hasResume;
    const isTechDone = completed.length >= 1;
    const isBehavioralDone = completed.length >= 3;
    const isReady = readinessScore >= 75;

    const s = (v: boolean, t: boolean, _a: boolean, _p: boolean): StepStatus =>
      v ? "done" : t ? "active" : "pending";

    return [
      {
        label: "Resume Analysis",
        status: s(isResumeUploaded, true, false, false),
        meta: "Complete",
      },
      {
        label: "Technical Proficiency",
        status: s(isTechDone, isResumeUploaded, false, false),
        meta: isTechDone ? "Verified" : "Current focus",
      },
      {
        label: "Behavioral Alignment",
        status: s(isBehavioralDone, isTechDone, false, false),
        meta: isBehavioralDone ? "Refined" : "Next up",
      },
      {
        label: "Role Readiness Decision",
        status: s(isReady, isBehavioralDone, false, false),
        meta: isReady ? "Certified" : "Goal",
      },
    ] as { label: string; status: StepStatus; meta: string }[];
  }, [hasResume, completed, readinessScore]);

  return (
    <div className="db-container">
      <UploadResumeModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
      />
      <ResumePreview
        resumeId={previewResumeId}
        open={!!previewResumeId}
        onClose={() => setPreviewResumeId(null)}
      />

      <div className="db-layout">
        <Sidebar completedCount={completed.length} />

        <main className="db-main">
          <div className="db-title-row">
            <div className="db-title-text">
              <h1>Evaluation board</h1>
              <p>Your performance indicators and signal tracks.</p>
            </div>

            <div className="db-quick-stats">
              <div className="db-quick-stat">
                <div className="db-quick-stat-content">
                  <span className="db-quick-stat-label">Readiness</span>
                  <span className="db-quick-stat-value">
                    {readinessScore > 0 ? `${readinessScore}%` : "\u2014"}
                  </span>
                  {readinessScore > 0 && (
                    <span className="db-quick-stat-badge green">Positive</span>
                  )}
                </div>
              </div>

              <div className="db-quick-stat-divider" />

              <div className="db-quick-stat">
                <div className="db-quick-stat-content">
                  <span className="db-quick-stat-label">Sessions</span>
                  <span className="db-quick-stat-value">
                    {String(totalSessions).padStart(2, "0")}
                  </span>
                  <span className="db-quick-stat-badge purple">
                    {totalSessions > 0 ? "Active" : "New"}
                  </span>
                </div>
              </div>

              <div className="db-quick-stat-divider" />

              <div className="db-quick-stat">
                <div className="db-quick-stat-content">
                  <span className="db-quick-stat-label">Focus Areas</span>
                  <span className="db-quick-stat-value">
                    {failurePatterns.length > 0
                      ? String(failurePatterns.length).padStart(2, "0")
                      : "00"}
                  </span>
                  <span className="db-quick-stat-badge orange">
                    {failurePatterns.length > 0 ? "Attention" : "Stable"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Hero completed={completed} interviews={interviews} />

          <div className="db-columns">
            <Signals
              completedCount={completed.length}
              traits={traits}
              failurePatterns={failurePatterns}
              mostImproved={mostImproved}
              weakest={weakest}
            />
            <Coach
              latestSummary={latestSummary}
              funnelSteps={funnelSteps}
              commonPatterns={commonPatterns}
            />
          </div>

          <History completed={completed} />
        </main>
      </div>
    </div>
  );
}
