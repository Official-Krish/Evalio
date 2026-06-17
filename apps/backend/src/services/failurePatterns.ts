import { prisma } from "../lib/prisma";

interface SignalEntry {
  interviewId: string;
  date: string;
  signals: {
    code: string;
    label?: string;
    turnIds: string[];
    reason: string;
  }[];
}

interface AggregatedPattern {
  code: string;
  label: string | null;
  frequency: number;
  totalSessions: number;
  severity: "high" | "medium" | "low";
  trend: "improving" | "worsening" | "stable";
  evidence: {
    interviewId: string;
    date: string;
    turnIds: string[];
    reason: string;
  }[];
}

const SEVERITY_HIGH_THRESHOLD = 0.7;
const SEVERITY_MEDIUM_THRESHOLD = 0.4;
const TREND_DELTA_THRESHOLD = 0.2;
const MIN_SESSIONS = 4;
const WINDOW_SIZE = 5;

function computeSeverity(ratio: number): "high" | "medium" | "low" {
  if (ratio >= SEVERITY_HIGH_THRESHOLD) return "high";
  if (ratio >= SEVERITY_MEDIUM_THRESHOLD) return "medium";
  return "low";
}

function computeTrend(
  recentCount: number,
  recentTotal: number,
  previousCount: number,
  previousTotal: number,
): "improving" | "worsening" | "stable" {
  if (recentTotal === 0 || previousTotal === 0) return "stable";
  const recentRate = recentCount / recentTotal;
  const previousRate = previousCount / previousTotal;
  const delta = recentRate - previousRate;
  if (delta > TREND_DELTA_THRESHOLD) return "worsening";
  if (delta < -TREND_DELTA_THRESHOLD) return "improving";
  return "stable";
}

export async function aggregateFailurePatterns(userId: string): Promise<void> {
  const [profile, completedCount] = await Promise.all([
    prisma.candidateSkillProfile.findUnique({
      where: { userId },
      select: { patternSignals: true },
    }),
    prisma.interviewSession.count({
      where: { userId, status: "COMPLETED" },
    }),
  ]);

  if (!profile || completedCount < MIN_SESSIONS) {
    await prisma.candidateSkillProfile
      .update({
        where: { userId },
        data: { failurePatterns: JSON.stringify([]) },
      })
      .catch(() => {});
    return;
  }

  const entries: SignalEntry[] = (() => {
    const raw = profile.patternSignals;
    if (Array.isArray(raw)) return raw as unknown as SignalEntry[];
    try {
      if (typeof raw === "string") return JSON.parse(raw) as SignalEntry[];
    } catch {
      /* ignore */
    }
    return [];
  })();

  if (entries.length === 0) {
    await prisma.candidateSkillProfile.update({
      where: { userId },
      data: { failurePatterns: JSON.stringify([]) },
    });
    return;
  }

  entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const signalMap = new Map<
    string,
    {
      interviewIds: Set<string>;
      evidence: AggregatedPattern["evidence"];
      label: string | null;
    }
  >();

  for (const entry of entries) {
    for (const sig of entry.signals) {
      const key =
        sig.code === "OTHER" && sig.label ? `OTHER::${sig.label}` : sig.code;
      if (!signalMap.has(key)) {
        signalMap.set(key, {
          interviewIds: new Set(),
          evidence: [],
          label: sig.code === "OTHER" ? (sig.label ?? null) : null,
        });
      }
      const bucket = signalMap.get(key)!;
      bucket.interviewIds.add(entry.interviewId);
      bucket.evidence.push({
        interviewId: entry.interviewId,
        date: entry.date,
        turnIds: sig.turnIds,
        reason: sig.reason,
      });
    }
  }

  const patterns: AggregatedPattern[] = [];

  for (const [key, bucket] of signalMap) {
    const frequency = bucket.interviewIds.size;
    const ratio = frequency / completedCount;

    const sortedEvidence = bucket.evidence.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const totalEntries = entries.length;
    const recentWindow = entries.slice(Math.max(0, totalEntries - WINDOW_SIZE));
    const previousWindow = entries.slice(
      Math.max(0, totalEntries - WINDOW_SIZE * 2),
      Math.max(0, totalEntries - WINDOW_SIZE),
    );

    const countInWindow = (window: SignalEntry[], codeKey: string) =>
      window.filter((e) =>
        e.signals.some((s) => {
          const sk =
            s.code === "OTHER" && s.label ? `OTHER::${s.label}` : s.code;
          return sk === codeKey;
        }),
      ).length;

    const recentCount = countInWindow(recentWindow, key);
    const previousCount = countInWindow(previousWindow, key);

    const code = key.startsWith("OTHER::") ? "OTHER" : key;
    const label = bucket.label ?? null;

    patterns.push({
      code,
      label,
      frequency,
      totalSessions: completedCount,
      severity: computeSeverity(ratio),
      trend: computeTrend(
        recentCount,
        recentWindow.length,
        previousCount,
        previousWindow.length,
      ),
      evidence: sortedEvidence.slice(0, 5),
    });
  }

  patterns.sort((a, b) => {
    const sevOrder = { high: 0, medium: 1, low: 2 };
    const d = sevOrder[a.severity] - sevOrder[b.severity];
    if (d !== 0) return d;
    return b.frequency - a.frequency;
  });

  await prisma.candidateSkillProfile.update({
    where: { userId },
    data: { failurePatterns: JSON.stringify(patterns) },
  });
}
