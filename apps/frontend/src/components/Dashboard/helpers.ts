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
