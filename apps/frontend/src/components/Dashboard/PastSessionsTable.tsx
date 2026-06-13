import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { formatDuration, computeChange, isIncomplete } from "./helpers"
import type { InterviewSession } from "@ai-interview/shared"
import { IconSearch, IconCalendarMonth } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"

interface PastSessionsTableProps {
  completed: InterviewSession[]
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null
  const color =
    score >= 70
      ? { bg: "rgba(16,185,129,0.1)", text: "#6EE7B7" }
      : score >= 40
        ? { bg: "rgba(245,158,11,0.1)", text: "#FDE68A" }
        : { bg: "rgba(239,68,68,0.1)", text: "#FCA5A5" }
  return (
    <span
      style={{
        background: color.bg,
        color: color.text,
        fontSize: "11px",
        fontWeight: 500,
        borderRadius: "999px",
        padding: "2px 10px",
      }}
    >
      {Math.round(score)}%
    </span>
  )
}

function IncompletePill() {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 500,
        padding: "1px 8px",
        borderRadius: "10px",
        background: "rgba(255,180,0,0.15)",
        color: "rgba(255,180,0,0.8)",
      }}
    >
      Incomplete
    </span>
  )
}

export function PastSessionsTable({ completed }: PastSessionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [showCalendar, setShowCalendar] = useState(false)
  const [monthFilter, setMonthFilter] = useState<Date | null>(null)
  const pageSize = 5

  const filtered = useMemo(() => {
    let result = completed
    if (searchQuery) {
      result = result.filter((i) => (i.position ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (monthFilter) {
      const year = monthFilter.getFullYear()
      const month = monthFilter.getMonth()
      result = result.filter((i) => {
        const d = new Date(i.createdAt)
        return d.getFullYear() === year && d.getMonth() === month
      })
    }
    return result
  }, [completed, searchQuery, monthFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleDayClick(date: Date) {
    setMonthFilter((prev) =>
      prev && prev.getMonth() === date.getMonth() && prev.getFullYear() === date.getFullYear()
        ? null
        : date
    )
    setShowCalendar(false)
  }

  return (
    <section>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          PAST SESSIONS &middot; {filtered.length}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                background: monthFilter ? "rgba(124,58,237,0.1)" : "var(--color-bg-hover)",
                color: monthFilter ? "#A78BFA" : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!monthFilter) e.currentTarget.style.borderColor = "#7C3AED" }}
              onMouseLeave={(e) => { if (!monthFilter) e.currentTarget.style.borderColor = "var(--color-border)" }}
            >
              <IconCalendarMonth size={14} />
              {monthFilter
                ? monthFilter.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "Month"}
            </button>
            {showCalendar && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "4px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "8px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  zIndex: 40,
                }}
              >
                <Calendar
                  numberOfMonths={1}
                  onDayClick={handleDayClick}
                  showOutsideDays={false}
                  classNames={{
                    root: "w-full",
                    months: "w-full",
                    month: "w-full",
                    month_caption: "text-xs font-medium text-[var(--color-text)] px-2 py-1",
                    nav: "flex items-center justify-between px-2 mb-1",
                    button_previous: "size-7 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]",
                    button_next: "size-7 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]",
                    weekdays: "flex",
                    weekday: "flex-1 text-[10px] font-normal text-[var(--color-text-muted)] pb-1 text-center",
                    week: "mt-0.5 flex w-full",
                    day: "flex-1 aspect-square p-0 text-center text-[11px] text-[var(--color-text-muted)]",
                    day_button: "size-full rounded-sm hover:bg-[var(--color-bg-hover)] data-[selected=true]:!bg-[#7C3AED] data-[selected=true]:!text-white",
                    outside: "opacity-0",
                    disabled: "opacity-0",
                    hidden: "hidden",
                    today: "ring-1 ring-[var(--color-border)] rounded-sm",
                  }}
                  components={{
                    Chevron: ({ orientation }) => (
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {orientation === "left" ? (
                          <polyline points="15 18 9 12 15 6" />
                        ) : (
                          <polyline points="9 18 15 12 9 6" />
                        )}
                      </svg>
                    ),
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <IconSearch size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
            <input
              placeholder="Search by role..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              style={{
                fontSize: "12px",
                padding: "6px 12px 6px 32px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-hover)",
                color: "var(--color-text)",
                outline: "none",
                width: "160px",
              }}
              onFocus={(e) => e.target.style.borderColor = "#7C3AED"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>
        </div>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr auto 0.8fr 0.5fr",
          gap: "8px",
          padding: "8px 0",
          fontSize: "11px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          borderBottom: "0.5px solid var(--color-border-light)",
        }}
      >
        <span>Role</span>
        <span>Company</span>
        <span>Duration</span>
        <span>Score</span>
        <span></span>
      </div>

      {/* Rows */}
      <div>
        {paginated.map((interview) => {
          const globalIndex = completed.indexOf(interview)
          const prevScore = globalIndex < completed.length - 1 ? completed[globalIndex + 1]?.overallScore ?? null : null
          const change = computeChange(interview.overallScore, prevScore)
          const incomplete = isIncomplete(interview)
          const companyLabel = interview.companyName
          const styleLabel = interview.interviewStyle
          const depthLabel = interview.interviewDepth
          return (
            <Link
              key={interview.id}
              to={`/results/${interview.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr auto 0.8fr 0.5fr",
                gap: "8px",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "0.5px solid var(--color-border-light)",
                textDecoration: "none",
                transition: "background 0.15s",
                opacity: incomplete ? 0.45 : 1,
              }}
              onMouseEnter={(e) => { if (!incomplete) e.currentTarget.style.background = "var(--color-bg-hover)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <span style={{ fontSize: "13px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {interview.position || "Interview"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {companyLabel || "\u2014"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                {incomplete ? <IncompletePill /> : formatDuration(interview.durationSeconds)}
              </span>
              <span>
                {incomplete ? "\u2014" : <ScoreBadge score={interview.overallScore} />}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontVariantNumeric: "tabular-nums",
                  color: change?.type === "up"
                    ? "#10B981"
                    : change?.type === "down"
                      ? "#EF4444"
                      : "var(--color-text-muted)",
                }}
              >
                {change?.type === "up" && "\u2191"}
                {change?.type === "down" && "\u2193"}
                {change && change.type !== "same" && Math.abs(parseInt(change.text.replace(/\D/g, ""))) || ""}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "16px" }}>
          <button
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              background: "transparent",
              color: safePage <= 1 ? "var(--color-text-muted)" : "var(--color-text-muted)",
              opacity: safePage <= 1 ? 0.3 : 1,
              cursor: safePage <= 1 ? "default" : "pointer",
              fontSize: "13px",
            }}
          >
            &lsaquo;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              style={{
                padding: "2px 0",
                width: "24px",
                border: "none",
                borderBottom: n === safePage ? "2px solid #7C3AED" : "2px solid transparent",
                background: "transparent",
                color: n === safePage ? "var(--color-text)" : "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "13px",
                lineHeight: 1.4,
              }}
            >
              {n}
            </button>
          ))}
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              background: "transparent",
              color: safePage >= totalPages ? "var(--color-text-muted)" : "var(--color-text-muted)",
              opacity: safePage >= totalPages ? 0.3 : 1,
              cursor: safePage >= totalPages ? "default" : "pointer",
              fontSize: "13px",
            }}
          >
            &rsaquo;
          </button>
        </div>
      )}
    </section>
  )
}
