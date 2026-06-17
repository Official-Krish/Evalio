import { prisma } from "../lib/prisma";

const TRAIT_KEYS = [
  "analytical",
  "communication",
  "ownership",
  "adaptability",
  "decisionMaking",
  "influence",
] as const;
type TraitKey = (typeof TRAIT_KEYS)[number];

interface TraitScore {
  score: number;
  description: string;
}

interface TraitHistoryEntry {
  interviewId: string;
  date: string;
  traits: Record<string, TraitScore>;
}

interface IdentityTrait {
  level: "high" | "medium" | "developing";
  score: number;
  trend: "improving" | "worsening" | "stable";
  description: string;
}

type IdentityTraits = Record<string, IdentityTrait>;

const MIN_SESSIONS = 4;
const HIGH_THRESHOLD = 70;
const MEDIUM_THRESHOLD = 40;
const TREND_DELTA = 10;

function getLevel(avgScore: number): "high" | "medium" | "developing" {
  if (avgScore >= HIGH_THRESHOLD) return "high";
  if (avgScore >= MEDIUM_THRESHOLD) return "medium";
  return "developing";
}

function computeTrend(
  recentAvg: number,
  olderAvg: number,
): "improving" | "worsening" | "stable" {
  const delta = recentAvg - olderAvg;
  if (delta > TREND_DELTA) return "improving";
  if (delta < -TREND_DELTA) return "worsening";
  return "stable";
}

function weightedAverage(scores: number[], weights: number[]): number {
  let sum = 0;
  let weightSum = 0;
  for (let i = 0; i < scores.length; i++) {
    const w = weights[i] ?? 1;
    sum += scores[i]! * w;
    weightSum += w;
  }
  return weightSum > 0 ? sum / weightSum : 0;
}

export async function aggregateIdentityTraits(userId: string): Promise<void> {
  const [profile, completedCount] = await Promise.all([
    prisma.candidateSkillProfile.findUnique({
      where: { userId },
      select: { traitHistory: true },
    }),
    prisma.interviewSession.count({
      where: { userId, status: "COMPLETED" },
    }),
  ]);

  if (!profile || completedCount < MIN_SESSIONS) {
    await prisma.candidateSkillProfile
      .update({
        where: { userId },
        data: { identityTraits: JSON.stringify({}) },
      })
      .catch(() => {});
    return;
  }

  const entries: TraitHistoryEntry[] = (() => {
    const raw = profile.traitHistory;
    if (Array.isArray(raw)) return raw as unknown as TraitHistoryEntry[];
    try {
      if (typeof raw === "string")
        return JSON.parse(raw) as TraitHistoryEntry[];
    } catch {
      /* ignore */
    }
    return [];
  })();

  if (entries.length === 0) {
    await prisma.candidateSkillProfile.update({
      where: { userId },
      data: { identityTraits: JSON.stringify({}) },
    });
    return;
  }

  entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const weights = [1, 1, 1, 2, 2, 3];

  const result: IdentityTraits = {};

  for (const key of TRAIT_KEYS) {
    const validEntries = entries.filter((e) => e.traits[key]?.score != null);
    if (validEntries.length === 0) continue;

    const scores = validEntries.map((e) => e.traits[key]!.score);
    const recentScores = scores.slice(-Math.min(scores.length, weights.length));
    const recentWeights = weights.slice(-recentScores.length);
    const avgScore = weightedAverage(recentScores, recentWeights);

    const mid = Math.floor(validEntries.length / 2);
    const older = validEntries.slice(0, mid);
    const newer = validEntries.slice(mid);

    const olderScores = older.map((e) => e.traits[key]!.score);
    const newerScores = newer.map((e) => e.traits[key]!.score);

    const olderW = weights.slice(-olderScores.length);
    const newerW = weights.slice(-newerScores.length);

    const olderAvg =
      olderScores.length > 0 ? weightedAverage(olderScores, olderW) : avgScore;
    const newerAvg =
      newerScores.length > 0 ? weightedAverage(newerScores, newerW) : avgScore;

    result[key] = {
      level: getLevel(avgScore),
      score: Math.round(avgScore),
      trend: computeTrend(newerAvg, olderAvg),
      description:
        validEntries[validEntries.length - 1]!.traits[key]!.description,
    };
  }

  await prisma.candidateSkillProfile.update({
    where: { userId },
    data: { identityTraits: JSON.stringify(result) },
  });
}
