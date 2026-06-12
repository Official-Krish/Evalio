import type { InterviewSession } from "@ai-interview/shared"

export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) {
    const hours = Math.floor(diff / 3600000)
    if (hours === 0) return "just now"
    return `${hours}h ago`
  }
  if (days === 1) return "yesterday"
  return `${days} days ago`
}

export function isToday(date: Date): boolean {
  const d = new Date()
  return date.getDate() === d.getDate() &&
    date.getMonth() === d.getMonth() &&
    date.getFullYear() === d.getFullYear()
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Morning"
  if (h < 17) return "Afternoon"
  return "Evening"
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "\u2014"
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

export function computeTrend(scores: number[]): string {
  if (scores.length === 0) return ""
  if (scores.length === 1) return `A score of ${Math.round(scores[0]!)}% \u2014 solid start.`
  const latest = scores[scores.length - 1]!
  const avgPrev = scores.slice(0, -1).reduce((a, b) => a + b, 0) / (scores.length - 1)
  if (latest >= avgPrev) return `Your clarity is climbing.`
  return `Your clarity could use work.`
}

export function computeChange(current: number | null, previous: number | null): { text: string; type: "up" | "down" | "same" } | null {
  if (current == null) return null
  if (previous == null) return { text: "\u2014", type: "same" }
  const diff = Math.round(current - previous)
  if (diff > 0) return { text: `\u2191 +${diff}`, type: "up" }
  if (diff < 0) return { text: `\u2193 ${diff}`, type: "down" }
  return { text: "\u2014", type: "same" }
}

export function computeStreak(interviews: { createdAt: Date }[]): number {
  const unique = [...new Set(interviews.map((d) => new Date(d.createdAt).toDateString()))]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(today.getTime() - i * 86400000)
    if (unique.includes(expected.toDateString())) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function isIncomplete(interview: { durationSeconds: number | null; overallScore: number | null }): boolean {
  return (interview.durationSeconds == null || interview.durationSeconds < 60) && interview.overallScore == null
}

/* ─── New analysis helpers ─── */

type ScoreField = "overallScore" | "communicationScore" | "technicalScore" | "problemSolvingScore"

export function computeReadiness(completed: InterviewSession[]): number {
  if (completed.length === 0) return 0
  const allScores = completed.flatMap((i) =>
    [i.overallScore, i.communicationScore, i.technicalScore, i.problemSolvingScore].filter((s): s is number => s != null),
  )
  if (allScores.length === 0) return 0
  const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length
  const sessionBonus = Math.min(completed.length * 2, 20)
  return Math.min(Math.round(avg + sessionBonus), 100)
}

export function computeDimensionTrend(
  completed: InterviewSession[],
  field: ScoreField,
): { direction: "up" | "down" | "same"; change: number } | null {
  const scores = completed.map((i) => i[field]).filter((s): s is number => s != null)
  if (scores.length < 2) return null
  const recent = scores.slice(0, Math.min(2, scores.length))
  const earlier = scores.slice(Math.min(2, scores.length))
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
  const avgEarlier = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : avgRecent
  const change = Math.round(avgRecent - avgEarlier)
  if (change > 2) return { direction: "up", change }
  if (change < -2) return { direction: "down", change }
  return { direction: "same", change: 0 }
}

export function detectWeaknesses(completed: InterviewSession[]): { label: string; count: number; type: "metric" | "conclusion" | "filler" }[] {
  const counts: Record<string, { count: number; type: "metric" | "conclusion" | "filler" }> = {
    "Missing Metrics": { count: 0, type: "metric" },
    "Weak Conclusions": { count: 0, type: "conclusion" },
    "Filler Words": { count: 0, type: "filler" },
  }
  for (const iv of completed) {
    const mm = counts["Missing Metrics"]
    const wc = counts["Weak Conclusions"]
    const fw = counts["Filler Words"]
    if (iv.technicalScore != null && iv.technicalScore < 60 && mm) mm.count++
    if (iv.overallScore != null && iv.overallScore < 55 && wc) wc.count++
    if (iv.communicationScore != null && iv.communicationScore < 50 && fw) fw.count++
  }
  return Object.entries(counts)
    .map(([label, v]) => ({ label, count: v.count, type: v.type }))
    .sort((a, b) => b.count - a.count)
    .filter((w) => w.count > 0)
}

export function getLatestInsight(completed: InterviewSession[]): string | null {
  if (completed.length === 0) return null
  const latest = completed[0]
  if (!latest) return null
  const comm = latest.communicationScore
  const tech = latest.technicalScore
  const prob = latest.problemSolvingScore
  if (comm != null && tech != null && comm > tech + 15) return "You speak confidently about implementation, but struggle when explaining tradeoffs."
  if (tech != null && comm != null && tech > comm + 15) return "Your technical answers are strong, but work on articulating your thought process."
  if (prob != null && prob < 50) return "You tend to jump to solutions without fully defining the problem first."
  if (comm != null && comm > 70) return "Strong communication — now focus on depth over delivery."
  return "Keep practicing. Each session builds toward mastery."
}

export function analyzeAcrossSessions(completed: InterviewSession[]): {
  strongest: string | null
  weakest: string | null
  mostImproved: string | null
  impactNote: string
} {
  const byPosition = new Map<string, number[]>()
  for (const iv of completed) {
    if (!iv.position) continue
    const scores = byPosition.get(iv.position) ?? []
    if (iv.overallScore != null) scores.push(iv.overallScore)
    byPosition.set(iv.position, scores)
  }
  let strongest: string | null = null
  let weakest: string | null = null
  let highestAvg = 0
  let lowestAvg = 100
  for (const [pos, scores] of byPosition) {
    if (scores.length === 0) continue
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg > highestAvg) { highestAvg = avg; strongest = pos }
    if (avg < lowestAvg) { lowestAvg = avg; weakest = pos }
  }

  const firstScore = completed[completed.length - 1]?.overallScore
  const lastScore = completed[0]?.overallScore
  let mostImproved: string | null = null
  if (firstScore != null && lastScore != null) {
    const diff = lastScore - firstScore
    if (diff > 10) mostImproved = "Communication"
    else if (diff > 5) mostImproved = "Structure"
    else if (diff > 0) mostImproved = "Confidence"
  }

  const lowMetrics = completed.filter((i) => i.technicalScore != null && i.technicalScore < 60).length
  const impactNote = lowMetrics > completed.length * 0.3
    ? "You rarely mention impact metrics"
    : "You show awareness of business impact"

  return { strongest, weakest, mostImproved, impactNote }
}

export function computeComparison30Days(completed: InterviewSession[]): {
  clarity: { change: number; direction: "up" | "down" | "same" }
  confidence: { change: number; direction: "up" | "down" | "same" }
  structure: { change: number; direction: "up" | "down" | "same" }
} {
  const now = Date.now()
  const cutoff30 = now - 30 * 86400000
  const cutoff60 = now - 60 * 86400000
  const recent = completed.filter((i) => new Date(i.createdAt).getTime() >= cutoff30)
  const earlier = completed.filter(
    (i) =>
      new Date(i.createdAt).getTime() >= cutoff60 && new Date(i.createdAt).getTime() < cutoff30,
  )

  const avg = (items: InterviewSession[], field: ScoreField) => {
    const vals = items.map((i) => i[field]).filter((s): s is number => s != null)
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 50
  }

  const delta = (field: ScoreField) => {
    const r = avg(recent, field)
    const e = avg(earlier, field)
    const diff = Math.round(r - e)
    return {
      change: diff,
      direction: diff > 2 ? "up" as const : diff < -2 ? "down" as const : "same" as const,
    }
  }

  return {
    clarity: delta("overallScore"),
    confidence: delta("communicationScore"),
    structure: delta("technicalScore"),
  }
}

export function computeMilestones(completed: InterviewSession[]): {
  totalCompleted: number
  uniquePositions: number
  nextMilestone: { label: string; progress: number } | null
} {
  const totalCompleted = completed.length
  const uniquePositions = new Set(completed.map((i) => i.position).filter(Boolean)).size
  const milestones = [
    { label: "10 sessions", target: 10 },
    { label: "20 sessions", target: 20 },
    { label: "3 tracks", target: 3, type: "tracks" as const },
  ]
  const next = milestones.find((m) =>
    m.type === "tracks" ? uniquePositions < m.target : totalCompleted < m.target,
  )
  const nextMilestone = next
    ? {
        label: next.label,
        progress: next.type === "tracks"
          ? Math.min(uniquePositions / next.target, 1)
          : Math.min(totalCompleted / next.target, 1),
      }
    : null
  return { totalCompleted, uniquePositions, nextMilestone }
}

export function computeRoleRecommendations(completed: InterviewSession[]): {
  role: string
  reason: string
}[] {
  const byPosition = new Map<string, number[]>()
  for (const iv of completed) {
    if (!iv.position) continue
    const scores = byPosition.get(iv.position) ?? []
    if (iv.overallScore != null) scores.push(iv.overallScore)
    byPosition.set(iv.position, scores)
  }
  const positions = Array.from(byPosition.entries())
    .map(([role, scores]) => ({
      role,
      avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  const recommendations: { role: string; reason: string }[] = []
  const hasRole = (r: string) => positions.some((p) => p.role.toLowerCase() === r.toLowerCase())

  if (!hasRole("Backend Engineer")) {
    recommendations.push({ role: "Backend Engineer", reason: "Based on communication strengths" })
  }
  if (!hasRole("Data Scientist")) {
    recommendations.push({ role: "Data Scientist", reason: "Needs more structured answers" })
  }
  if (!hasRole("Engineering Manager")) {
    recommendations.push({ role: "Engineering Manager", reason: "Good foundation for leadership" })
  }

  return recommendations.slice(0, 3)
}
