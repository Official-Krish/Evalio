import type { InterviewSession } from "@evalio/shared";

export function isToday(date: Date): boolean {
  const d = new Date();
  return (
    date.getDate() === d.getDate() &&
    date.getMonth() === d.getMonth() &&
    date.getFullYear() === d.getFullYear()
  );
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "\u2014";
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

export function computeChange(
  current: number | null,
  previous: number | null,
): { text: string; type: "up" | "down" | "same" } | null {
  if (current == null) return null;
  if (previous == null) return { text: "\u2014", type: "same" };
  const diff = Math.round(current - previous);
  if (diff > 0) return { text: `\u2191 +${diff}`, type: "up" };
  if (diff < 0) return { text: `\u2193 ${diff}`, type: "down" };
  return { text: "\u2014", type: "same" };
}

export function computeStreak(interviews: { createdAt: Date }[]): number {
  const unique = [
    ...new Set(interviews.map((d) => new Date(d.createdAt).toDateString())),
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(today.getTime() - i * 86400000);
    if (unique.includes(expected.toDateString())) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function isIncomplete(interview: {
  durationSeconds: number | null;
  overallScore: number | null;
}): boolean {
  return (
    (interview.durationSeconds == null || interview.durationSeconds < 60) &&
    interview.overallScore == null
  );
}

/* ─── New analysis helpers ─── */

type ScoreField =
  | "overallScore"
  | "communicationScore"
  | "technicalScore"
  | "problemSolvingScore";

export function computeReadiness(completed: InterviewSession[]): number {
  if (completed.length === 0) return 0;
  const allScores = completed.flatMap((i) =>
    [
      i.overallScore,
      i.communicationScore,
      i.technicalScore,
      i.problemSolvingScore,
    ].filter((s): s is number => s != null),
  );
  if (allScores.length === 0) return 0;
  const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const sessionBonus = Math.min(completed.length * 2, 20);
  return Math.min(Math.round(avg + sessionBonus), 100);
}

export function computeDimensionTrend(
  completed: InterviewSession[],
  field: ScoreField,
): { direction: "up" | "down" | "same"; change: number } | null {
  const scores = completed
    .map((i) => i[field])
    .filter((s): s is number => s != null);
  if (scores.length < 2) return null;
  const recent = scores.slice(0, Math.min(2, scores.length));
  const earlier = scores.slice(Math.min(2, scores.length));
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgEarlier =
    earlier.length > 0
      ? earlier.reduce((a, b) => a + b, 0) / earlier.length
      : avgRecent;
  const change = Math.round(avgRecent - avgEarlier);
  if (change > 2) return { direction: "up", change };
  if (change < -2) return { direction: "down", change };
  return { direction: "same", change: 0 };
}

export function computeComparison30Days(completed: InterviewSession[]): {
  clarity: { change: number; direction: "up" | "down" | "same" };
  confidence: { change: number; direction: "up" | "down" | "same" };
  structure: { change: number; direction: "up" | "down" | "same" };
} {
  const now = Date.now();
  const cutoff30 = now - 30 * 86400000;
  const cutoff60 = now - 60 * 86400000;
  const recent = completed.filter(
    (i) => new Date(i.createdAt).getTime() >= cutoff30,
  );
  const earlier = completed.filter(
    (i) =>
      new Date(i.createdAt).getTime() >= cutoff60 &&
      new Date(i.createdAt).getTime() < cutoff30,
  );

  const avg = (items: InterviewSession[], field: ScoreField) => {
    const vals = items
      .map((i) => i[field])
      .filter((s): s is number => s != null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 50;
  };

  const delta = (field: ScoreField) => {
    const r = avg(recent, field);
    const e = avg(earlier, field);
    const diff = Math.round(r - e);
    return {
      change: diff,
      direction:
        diff > 2
          ? ("up" as const)
          : diff < -2
            ? ("down" as const)
            : ("same" as const),
    };
  };

  return {
    clarity: delta("overallScore"),
    confidence: delta("communicationScore"),
    structure: delta("technicalScore"),
  };
}

export function computeMilestones(completed: InterviewSession[]): {
  totalCompleted: number;
  uniquePositions: number;
  nextMilestone: { label: string; progress: number } | null;
} {
  const totalCompleted = completed.length;
  const uniquePositions = new Set(
    completed.map((i) => i.position).filter(Boolean),
  ).size;
  const milestones = [
    { label: "10 sessions", target: 10 },
    { label: "20 sessions", target: 20 },
    { label: "3 tracks", target: 3, type: "tracks" as const },
  ];
  const next = milestones.find((m) =>
    m.type === "tracks"
      ? uniquePositions < m.target
      : totalCompleted < m.target,
  );
  const nextMilestone = next
    ? {
        label: next.label,
        progress:
          next.type === "tracks"
            ? Math.min(uniquePositions / next.target, 1)
            : Math.min(totalCompleted / next.target, 1),
      }
    : null;
  return { totalCompleted, uniquePositions, nextMilestone };
}
