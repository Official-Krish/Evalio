import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDuration, computeChange, isIncomplete } from "./helpers"
import type { InterviewSession } from "@ai-interview/shared"

interface PastSessionsTableProps {
  completed: InterviewSession[]
}

function IncompletePill() {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "10px",
        fontWeight: 500,
        padding: "1px 8px",
        borderRadius: "10px",
        background: "rgba(255,180,0,0.15)",
        color: "rgba(255,180,0,0.8)",
        letterSpacing: "0.02em",
      }}
    >
      Incomplete
    </span>
  )
}

export function PastSessionsTable({ completed }: PastSessionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [durationSort, setDurationSort] = useState<"asc" | "desc" | null>(null)
  const [hoveringDuration, setHoveringDuration] = useState(false)
  const pageSize = 5

  const filtered = searchQuery
    ? completed.filter((i) => (i.position ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
    : completed

  const sorted = durationSort
    ? [...filtered].sort((a, b) => {
        const da = a.durationSeconds ?? 0
        const db = b.durationSeconds ?? 0
        return durationSort === "asc" ? da - db : db - da
      })
    : filtered

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          PAST SESSIONS &middot; {filtered.length}
        </p>
        <input
          placeholder="Search by role..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          style={{
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.6)",
            outline: "none",
            width: "160px",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
          gap: "8px",
          padding: "0 0 8px 0",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span>Role</span>
        <span>Date</span>
        <span
          style={{ cursor: "pointer", userSelect: "none" }}
          onMouseEnter={() => setHoveringDuration(true)}
          onMouseLeave={() => setHoveringDuration(false)}
          onClick={() => setDurationSort(durationSort === "asc" ? "desc" : "asc")}
        >
          Duration
          {hoveringDuration && (
            <span style={{ marginLeft: "4px", opacity: 0.5 }}>
              {durationSort === "asc" ? "\u2191" : durationSort === "desc" ? "\u2193" : "\u2195"}
            </span>
          )}
        </span>
        <span>Clarity</span>
        <span>Result</span>
      </div>

      <div>
        {paginated.map((interview) => {
          const globalIndex = completed.indexOf(interview)
          const prevScore = globalIndex < completed.length - 1 ? completed[globalIndex + 1]?.overallScore ?? null : null
          const change = computeChange(interview.overallScore, prevScore)
          const incomplete = isIncomplete(interview)
          return (
            <Link
              key={interview.id}
              to={`/results/${interview.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
                gap: "8px",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "background 0.15s",
                opacity: incomplete ? 0.45 : 1,
              }}
              onMouseEnter={(e) => { if (!incomplete) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <span style={{ fontSize: "13px", color: "var(--landing-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {interview.position || "Interview"}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                {new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                {incomplete ? <IncompletePill /> : formatDuration(interview.durationSeconds)}
              </span>
              <span style={{ fontSize: "13px", color: "var(--landing-fg)", fontVariantNumeric: "tabular-nums" }}>
                {interview.overallScore != null ? `${Math.round(interview.overallScore)}%` : "\u2014"}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontVariantNumeric: "tabular-nums",
                  color: change?.type === "up"
                    ? "rgba(120,220,150,0.9)"
                    : change?.type === "down"
                      ? "rgba(220,100,100,0.7)"
                      : "rgba(255,255,255,0.25)",
                }}
              >
                {change?.text ?? "\u2014"}
              </span>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
          <button
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              background: "transparent",
              color: safePage <= 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
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
                borderBottom: n === safePage ? "2px solid rgba(255,255,255,0.5)" : "2px solid transparent",
                background: "transparent",
                color: n === safePage ? "var(--landing-fg)" : "rgba(255,255,255,0.4)",
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
              color: safePage >= totalPages ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
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
