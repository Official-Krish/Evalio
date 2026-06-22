import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { extractValues } from "./utils";
import type { Session, SkillProfile } from "./types";

export function useAnalysisData() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["overall-analysis"],
    queryFn: () => api.getOverallAnalysis(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 30_000,
  });

  const sessions = useMemo(() => (data?.sessions ?? []) as Session[], [data]);
  const skillProfile = useMemo(
    () => data?.skillProfile as SkillProfile,
    [data],
  );

  const completedCount = sessions.length;

  const identityTraits = useMemo(() => {
    if (!skillProfile) return null;
    return (
      (skillProfile.identityTraits as Record<
        string,
        { score: number; level: string; trend: string; description: string }
      >) ?? null
    );
  }, [skillProfile]);

  const failurePatterns = useMemo(() => {
    if (!skillProfile) return [];
    return (
      (skillProfile.failurePatterns as Array<{
        code: string;
        label: string | null;
        frequency: number;
        totalSessions: number;
        severity: string;
        trend: string;
      }>) ?? []
    );
  }, [skillProfile]);

  const mostImproved = skillProfile?.mostImprovedSkill as string | null;

  const commVals = useMemo(
    () => extractValues(sessions, "communicationScore"),
    [sessions],
  );
  const techVals = useMemo(
    () => extractValues(sessions, "technicalScore"),
    [sessions],
  );
  const probVals = useMemo(
    () => extractValues(sessions, "problemSolvingScore"),
    [sessions],
  );
  const overallVals = useMemo(
    () => extractValues(sessions, "overallScore"),
    [sessions],
  );

  const avgScore = useMemo(() => {
    if (overallVals.length === 0) return 0;
    return Math.round(
      overallVals.reduce((a, b) => a + b, 0) / overallVals.length,
    );
  }, [overallVals]);

  const latestSummary = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions[sessions.length - 1]?.summary ?? null;
  }, [sessions]);

  return {
    sessions,
    skillProfile,
    completedCount,
    identityTraits,
    failurePatterns,
    mostImproved,
    commVals,
    techVals,
    probVals,
    overallVals,
    avgScore,
    latestSummary,
    isLoading,
    isError,
  };
}
