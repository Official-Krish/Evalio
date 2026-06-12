import { useState, useMemo, useRef } from "react"
import type { InterviewSession } from "@ai-interview/shared"
import { IconFlame } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"

interface StreakHeatmapProps {
  interviews: InterviewSession[]
}

export function StreakHeatmap({ interviews }: StreakHeatmapProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const iv of interviews) {
      const key = new Date(iv.createdAt).toISOString().slice(0, 10)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [interviews])

  const streak = useMemo(() => {
    let count = 0
    const now = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if ((activityMap.get(key) ?? 0) > 0) count++
      else break
    }
    return count
  }, [activityMap])

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

  function handleMouseEnter(date: Date, _modifiers: Record<string, boolean>, e: React.MouseEvent) {
    const key = date.toISOString().slice(0, 10)
    const count = activityMap.get(key) ?? 0
    if (count > 0) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
      setTooltip(`${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${count} session${count !== 1 ? "s" : ""}`)
    }
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  return (
    <div
      ref={ref}
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "16px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          Interview streak
        </span>
      </div>

      <div style={{ padding: "4px 8px 8px" }}>
        <Calendar
          numberOfMonths={1}
          modifiers={modifiers}
          modifiersClassNames={{
            level1: "!bg-[#4C1D95] !text-white rounded-sm",
            level2: "!bg-[#6D28D9] !text-white rounded-sm",
            level3: "!bg-[#7C3AED] !text-white rounded-sm font-medium",
          }}
          onDayMouseEnter={handleMouseEnter}
          onDayMouseLeave={handleMouseLeave}
          showOutsideDays={false}
          classNames={{
            root: "w-full",
            months: "w-full",
            month: "w-full",
            month_caption: "text-xs font-medium text-[var(--color-text-muted)] px-2 py-1",
            nav: "hidden",
            weekdays: "flex",
            weekday: "flex-1 text-[10px] font-normal text-[var(--color-text-muted)] pb-1 text-center",
            week: "mt-0.5 flex w-full",
            day: "flex-1 aspect-square p-0 text-center text-[11px] text-[var(--color-text-muted)]",
            day_button: "size-full rounded-sm hover:bg-[var(--color-bg-hover)] data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit",
            outside: "opacity-0",
            disabled: "opacity-0",
            hidden: "hidden",
            today: "ring-1 ring-[var(--color-border)] rounded-sm",
          }}
        />
      </div>

      {streak > 0 && (
        <div style={{ padding: "0 16px 14px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(251,146,60,0.1)",
              border: "1px solid rgba(251,146,60,0.2)",
              color: "#FB923C",
              borderRadius: "999px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            <IconFlame size={12} />
            {streak} day streak
          </div>
        </div>
      )}

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
            background: "#1E1B4B",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "11px",
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  )
}
