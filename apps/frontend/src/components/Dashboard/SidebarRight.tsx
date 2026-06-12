import { useMemo, useState } from "react"
import type { InterviewSession } from "@ai-interview/shared"
import { computeStreak } from "./helpers"
import { Calendar } from "@/components/ui/calendar"
import {
  IconFlame,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconCircleCheckFilled,
  IconCircle,
} from "@tabler/icons-react"

interface SidebarRightProps {
  interviews: InterviewSession[]
  completed: InterviewSession[]
  comparison: {
    clarity: { change: number; direction: "up" | "down" | "same" }
    confidence: { change: number; direction: "up" | "down" | "same" }
    structure: { change: number; direction: "up" | "down" | "same" }
  }
  milestones: {
    totalCompleted: number
    uniquePositions: number
    nextMilestone: { label: string; progress: number } | null
  }
}

/* ─── Streak ─── */

function StreakCard({ interviews }: { interviews: InterviewSession[] }) {
  const streak = computeStreak(interviews)

  const last7 = useMemo(() => {
    const now = new Date()
    const days: boolean[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toDateString()
      days.push(interviews.some((iv) => new Date(iv.createdAt).toDateString() === key))
    }
    return days
  }, [interviews])

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <IconFlame size={18} color={streak >= 2 ? "#F59E0B" : "var(--color-text-muted)"} />
        <span style={{ fontSize: "28px", fontWeight: 600, color: "var(--color-text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {streak}
        </span>
        <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>day{streak !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {last7.map((active, i) => (
          <div
            key={i}
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: active ? "#7C3AED" : "var(--color-border-light)",
              transition: "background 0.15s",
            }}
          />
        ))}
      </div>

      <p style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", margin: 0 }}>
        CURRENT STREAK
      </p>
    </div>
  )
}

/* ─── Heatmap ─── */

function HeatmapCard({ interviews }: { interviews: InterviewSession[] }) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const iv of interviews) {
      const key = new Date(iv.createdAt).toISOString().slice(0, 10)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [interviews])

  const lastInterview = interviews[0]
  const lastActive = lastInterview
    ? new Date(lastInterview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null

  const modifiers = useMemo(() => {
    const l1: Date[] = []
    const l2: Date[] = []
    const l3: Date[] = []
    activityMap.forEach((count, dateStr) => {
      const d = new Date(dateStr + "T00:00:00")
      if (count >= 3) l3.push(d)
      else if (count >= 2) l2.push(d)
      else l1.push(d)
    })
    return { level1: l1, level2: l2, level3: l3 }
  }, [activityMap])

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "12px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>ACTIVITY</span>
      </div>

      <Calendar
        numberOfMonths={1}
        modifiers={modifiers}
        modifiersClassNames={{
          level1: "!bg-[#4C1D95] !text-white rounded-sm",
          level2: "!bg-[#6D28D9] !text-white rounded-sm",
          level3: "!bg-[#7C3AED] !text-white rounded-sm font-medium",
        }}
        onDayMouseEnter={(date, _m, e) => {
          const key = date.toISOString().slice(0, 10)
          const count = activityMap.get(key) ?? 0
          if (count > 0) {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setTooltip({ text: `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${count}`, x: r.left + r.width / 2, y: r.top - 4 })
          }
        }}
        onDayMouseLeave={() => setTooltip(null)}
        showOutsideDays={false}
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full",
          month_caption: "hidden",
          nav: "hidden",
          weekdays: "flex",
          weekday: "flex-1 text-[9px] font-normal text-[var(--color-text-muted)] pb-0.5 text-center",
          week: "mt-px flex w-full",
          day: "flex-1 aspect-square p-0 text-center text-[10px] text-[var(--color-text-muted)]",
          day_button: "size-full rounded-sm hover:bg-[var(--color-bg-hover)] data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit",
          outside: "opacity-0",
          disabled: "opacity-0",
          hidden: "hidden",
          today: "",
        }}
      />

      {lastActive && (
        <p style={{ fontSize: "9px", color: "var(--color-text-muted)", margin: "6px 0 0" }}>
          Last active: {lastActive}
        </p>
      )}

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "#1E1B4B",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

/* ─── Milestones ─── */

function MilestonesCard({ milestones }: { milestones: SidebarRightProps["milestones"] }) {
  const items = [
    { label: "First interview", done: milestones.totalCompleted >= 1 },
    { label: "5 interviews", done: milestones.totalCompleted >= 5 },
    { label: "10 interviews", done: milestones.totalCompleted >= 10 },
    { label: "2 tracks explored", done: milestones.uniquePositions >= 2 },
  ]

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <p style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "12px" }}>
        MILESTONES
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {item.done ? (
              <IconCircleCheckFilled size={14} color="#10B981" />
            ) : (
              <IconCircle size={14} color="var(--color-text-muted)" />
            )}
            <span
              style={{
                fontSize: "12px",
                color: item.done ? "var(--color-text-muted)" : "var(--color-text)",
                textDecoration: item.done ? "line-through" : "none",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {milestones.nextMilestone && (
        <div>
          <p style={{ fontSize: "10px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
            Next: {milestones.nextMilestone.label}
          </p>
          <div
            style={{
              height: "3px",
              borderRadius: "999px",
              background: "var(--color-border-light)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "999px",
                background: "#7C3AED",
                width: `${milestones.nextMilestone.progress * 100}%`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Comparison ─── */

function ComparisonCard({ comparison }: { comparison: SidebarRightProps["comparison"] }) {
  const rows = [
    { label: "Clarity", value: comparison.clarity },
    { label: "Confidence", value: comparison.confidence },
    { label: "Structure", value: comparison.structure },
  ] as const

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <p style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px" }}>
        LAST 30 DAYS
      </p>

      {rows.map((row, i) => {
        const isPos = row.value.direction === "up"
        const isNeg = row.value.direction === "down"
        const color = isPos ? "#10B981" : isNeg ? "#EF4444" : "var(--color-text-muted)"
        const sign = isPos ? "+" : ""
        return (
          <div key={row.label}>
            {i > 0 && <div style={{ height: "0.5px", background: "var(--color-border-light)" }} />}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-hover)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{row.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color, fontSize: "13px", fontWeight: 500 }}>
                {isPos && <IconArrowUp size={12} />}
                {isNeg && <IconArrowDown size={12} />}
                {!isPos && !isNeg && <IconMinus size={12} />}
                {sign}{row.value.change}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main ─── */

export function SidebarRight({ interviews, completed, comparison, milestones }: SidebarRightProps) {
  const hasData = completed.length > 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <StreakCard interviews={interviews} />
      {hasData && <HeatmapCard interviews={interviews} />}
      {hasData && <MilestonesCard milestones={milestones} />}
      {hasData && <ComparisonCard comparison={comparison} />}
    </div>
  )
}
