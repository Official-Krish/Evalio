import { prisma } from "../../lib/prisma";
import { COMPANIES } from "@evalio/shared";
import { buildInterviewPrompt, type PromptInput } from "../../prompt";
import { buildDsaSystemPrompt } from "../../services/dsaPrompt";
import { buildSystemDesignPrompt } from "../../prompt";
import { getSdQuestion } from "../../routes/sd";
import { verifyWsToken, startInterview } from "../orchestrator";
import { tryActivate, enqueue as queueEnqueue } from "../../lib/queue";
import type { InterviewConnection } from "../session";
import { startHeartbeat } from "../helpers/heartbeat";

export async function handleInit(
  conn: InterviewConnection,
  msg: Record<string, unknown>,
) {
  const token = msg.token as string | undefined;
  if (!token) {
    await conn.safeSend({ error: "Authentication required" });
    conn.client.close();
    return;
  }

  const payload = await verifyWsToken(token);
  if (!payload) {
    await conn.safeSend({ error: "Invalid or expired token" });
    conn.client.close();
    return;
  }

  const userId = payload.id;

  conn.interviewId = msg.interviewId as string;
  if (!conn.interviewId) {
    await conn.safeSend({ error: "interviewId is required" });
    return;
  }

  console.log(`[ws] init: user=${userId} interview=${conn.interviewId}`);

  const interview = await prisma.interviewSession.findUnique({
    where: { id: conn.interviewId },
    include: {
      resume: true,
      user: {
        include: {
          githubProfile: true,
        },
      },
    },
  });
  if (!interview) {
    await conn.safeSend({ error: "Interview not found" });
    return;
  }
  if (interview.userId !== userId) {
    await conn.safeSend({ error: "Unauthorized" });
    return;
  }

  if (interview.status === "COMPLETED") {
    await conn.safeSend({ error: "Interview already completed" });
    return;
  }

  const lastTurn = await prisma.interviewTurn.findFirst({
    where: { interviewId: conn.interviewId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  conn.nextOrderNumber = (lastTurn?.orderNumber ?? 0) + 1;

  const github = interview.user.githubProfile;
  const userRole = interview.user.role ?? "FREE";
  const timeLimitMs =
    userRole === "ADMIN" || userRole === "PRO" ? 1_800_000 : 900_000;
  const durationMinutes = timeLimitMs / 60_000;
  const companyConfig = interview.companyId
    ? COMPANIES.find((c) => c.id === interview.companyId)
    : null;

  conn.interviewDepth = interview.interviewDepth ?? "STANDARD";

  const selectedRole =
    companyConfig?.roles.find((r) => r.title === interview.roleTitle) ?? null;

  const pastInterviews = await prisma.interviewSession.findMany({
    where: {
      userId: interview.userId,
      status: "COMPLETED",
      id: { not: interview.id },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { summary: true },
  });

  const skillProfile = await prisma.candidateSkillProfile.findUnique({
    where: { userId: interview.userId },
  });

  const scoredInterviews = await prisma.interviewSession.findMany({
    where: {
      userId: interview.userId,
      status: "COMPLETED",
      overallScore: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { overallScore: true },
  });
  const scores = scoredInterviews.map((i) => i.overallScore!).reverse();
  const scoreTrendLast5: "improving" | "stable" | "declining" | null =
    scores.length < 2
      ? null
      : scores[scores.length - 1]! > scores[0]! + 5
        ? "improving"
        : scores[scores.length - 1]! < scores[0]! - 5
          ? "declining"
          : "stable";

  const mode = (interview as { mode?: string }).mode;
  const isDsa = mode === "DSA";
  const isSystemDesign = mode === "SYSTEM_DESIGN";
  conn.isDsaMode = isDsa;
  conn.isSystemDesign = isSystemDesign;
  console.log(
    "[init] mode:",
    mode,
    "isDsa:",
    isDsa,
    "isSystemDesign:",
    isSystemDesign,
  );

  let systemPrompt: string;

  if (isDsa) {
    const dsaSession = await prisma.dsaSession.findUnique({
      where: { interviewId: interview.id },
      include: { problems: { orderBy: { index: "asc" } } },
    });
    const problems =
      dsaSession?.problems.map((p) => ({
        index: p.index,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
      })) ?? [];

    // Fetch past DSA interview history
    const pastDsaInterviews = await prisma.interviewSession.findMany({
      where: {
        userId: interview.userId,
        mode: "DSA",
        status: "COMPLETED",
        id: { not: interview.id },
        dsaSession: { isNot: null },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        dsaSession: {
          include: { problems: { orderBy: { index: "asc" } } },
        },
      },
    });
    const dsaHistoryEntries = pastDsaInterviews.map((iv) => ({
      date: iv.createdAt.toISOString().slice(0, 10),
      overallScore: iv.overallScore,
      problemScores:
        iv.dsaSession?.problems.map((p) => ({
          title: p.title,
          score: p.score,
        })) ?? [],
    }));
    const dsaScored = await prisma.interviewSession.findMany({
      where: {
        userId: interview.userId,
        mode: "DSA",
        status: "COMPLETED",
        overallScore: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { overallScore: true },
    });
    const dsaScores = dsaScored.map((i) => i.overallScore!).reverse();
    const dsaScoreTrend: "improving" | "stable" | "declining" | null =
      dsaScores.length < 2
        ? null
        : dsaScores[dsaScores.length - 1]! > dsaScores[0]! + 5
          ? "improving"
          : dsaScores[dsaScores.length - 1]! < dsaScores[0]! - 5
            ? "declining"
            : "stable";

    systemPrompt = buildDsaSystemPrompt(
      problems,
      {
        companyName: interview.companyName,
        roleTitle: (interview as { roleTitle?: string | null }).roleTitle,
        interviewRound: (interview as { interviewRound?: string | null })
          .interviewRound,
        position: interview.position,
        interviewDepth: (interview as { interviewDepth?: string | null })
          .interviewDepth,
        interviewStyle: (interview as { interviewStyle?: string | null })
          .interviewStyle,
      },
      {
        pastSessions: dsaHistoryEntries,
        scoreTrendLast5: dsaScoreTrend,
        mostImproved: skillProfile?.mostImprovedSkill ?? null,
        weakest: skillProfile?.weakestSkill ?? null,
      },
    );
    console.log("[init] built DSA prompt:", systemPrompt.slice(0, 200));
  } else if (isSystemDesign) {
    console.log("[init] building System Design prompt");
    const sdQuestion = getSdQuestion(interview.id);
    console.log("[init] sdQuestion found:", !!sdQuestion);
    systemPrompt = buildSystemDesignPrompt({
      position: interview.position,
      sdQuestion: sdQuestion ?? undefined,
      candidateName: interview.user.name,
      companyName: interview.companyName ?? null,
      companyCulture: companyConfig?.culture ?? null,
      companyInterviewerBehavior: companyConfig?.interviewerBehavior ?? null,
      companyEvaluationBiases: companyConfig?.evaluationBiases ?? null,
      roleTopics: selectedRole?.topics ?? null,
      roleEvaluationCriteria: selectedRole?.evaluationCriteria ?? null,
      roleMustProbe: selectedRole?.mustProbe ?? null,
      interviewRound:
        (interview as { interviewRound?: string | null }).interviewRound ??
        null,
      resumeText: interview.resume?.extractedText ?? null,
      jobDescription:
        (interview as { jobDescription?: string | null }).jobDescription ??
        null,
      githubUsername: github?.username ?? null,
      githubSummary: github?.summary ?? null,
      githubLanguages: (github?.languages as string[]) ?? [],
      githubProjects:
        (github?.projects as {
          name: string;
          description: string | null;
          stars: number;
          language: string | null;
        }[]) ?? [],
      interviewStyle: (interview.interviewStyle ??
        "PROFESSIONAL") as PromptInput["interviewStyle"],
      interviewDepth: conn.interviewDepth as PromptInput["interviewDepth"],
      durationMinutes,
      candidateHistory: pastInterviews.map((iv) => ({
        date: iv.createdAt.toISOString(),
        role: iv.roleTitle ?? iv.position,
        overallScore: iv.overallScore,
        strengths: (iv.summary?.strengths as string[]) ?? [],
        weaknesses: (iv.summary?.weaknesses as string[]) ?? [],
        summary: iv.summary?.summary ?? null,
      })),
      overallMostImproved: skillProfile?.mostImprovedSkill ?? null,
      overallWeakest: skillProfile?.weakestSkill ?? null,
      overallPatterns: (skillProfile?.commonPatterns as string[]) ?? [],
      scoreTrendLast5,
    });
    console.log("[init] built SD prompt:", systemPrompt.slice(0, 200));
  } else {
    const promptInput = {
      position: interview.position,
      candidateName: interview.user.name,
      resumeText: interview.resume?.extractedText ?? null,
      jobDescription:
        (interview as { jobDescription?: string | null }).jobDescription ??
        null,
      githubUsername: github?.username ?? null,
      githubSummary: github?.summary ?? null,
      githubLanguages: (github?.languages as string[]) ?? [],
      githubProjects:
        (github?.projects as {
          name: string;
          description: string | null;
          stars: number;
          language: string | null;
        }[]) ?? [],
      durationMinutes,
      interviewStyle: (interview.interviewStyle ??
        "PROFESSIONAL") as PromptInput["interviewStyle"],
      interviewDepth: conn.interviewDepth as PromptInput["interviewDepth"],
      companyName: interview.companyName ?? null,
      companyCulture: companyConfig?.culture ?? null,
      companyInterviewerBehavior: companyConfig?.interviewerBehavior ?? null,
      companyEvaluationBiases: companyConfig?.evaluationBiases ?? null,
      roleTopics: selectedRole?.topics ?? null,
      roleEvaluationCriteria: selectedRole?.evaluationCriteria ?? null,
      roleMustProbe: selectedRole?.mustProbe ?? null,
      interviewRound:
        (interview as { interviewRound?: string | null }).interviewRound ??
        null,
      candidateHistory: pastInterviews.map((iv) => ({
        date: iv.createdAt.toISOString(),
        role: iv.roleTitle ?? iv.position,
        overallScore: iv.overallScore,
        strengths: (iv.summary?.strengths as string[]) ?? [],
        weaknesses: (iv.summary?.weaknesses as string[]) ?? [],
        summary: iv.summary?.summary ?? null,
      })),
      overallMostImproved: skillProfile?.mostImprovedSkill ?? null,
      overallWeakest: skillProfile?.weakestSkill ?? null,
      overallPatterns: (skillProfile?.commonPatterns as string[]) ?? [],
      scoreTrendLast5,
    };
    systemPrompt = buildInterviewPrompt(promptInput);
  }

  const startFn = async () => {
    await startInterview(conn, systemPrompt, timeLimitMs);
  };

  const slotOpen = await tryActivate(conn.interviewId);
  console.log(
    "[init] slotOpen:",
    slotOpen,
    "mode:",
    mode,
    "prompt length:",
    systemPrompt?.length,
  );
  if (slotOpen) {
    conn.wsMap.set(conn.interviewId, conn.client);
    conn.startCallbacks.set(conn.interviewId, startFn);
    await startInterview(conn, systemPrompt, timeLimitMs);
    startHeartbeat(conn);
  } else {
    conn.isQueued = true;
    conn.wsMap.set(conn.interviewId, conn.client);
    conn.startCallbacks.set(conn.interviewId, startFn);
    const position = await queueEnqueue(conn.interviewId, userId);
    await conn.safeSend({ type: "queued", position });
    startHeartbeat(conn);
  }
}
