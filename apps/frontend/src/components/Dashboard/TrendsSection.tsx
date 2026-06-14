import { useMemo } from "react"
import type { InterviewSession, } from "@evalio/shared"
import { computeDimensionTrend } from "./helpers"
import { IconArrowUp, IconArrowDown, IconMinus } from "@tabler/icons-react"

interface TrendsSectionProps {
  completed: InterviewSession[]
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) {
    return (
      <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "9px", color: "var(--color-text-muted)" }}>No data yet</span>
      </div>
    )
  }

  const w = 100
  const h = 40
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 6) - 3
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width="100%" height="40" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {data.every((v) => v === data[0]) ? (
        <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="var(--color-text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
      ) : (
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

function TrendCard({
  label,
  trend,
  sparklineData,
}: {
  label: string
  trend: { direction: "up" | "down" | "same"; change: number } | null
  sparklineData: number[]
}) {
  const isPositive = trend?.direction === "up"
  const isNegative = trend?.direction === "down"
  const indicatorColor = isPositive ? "#10B981" : isNegative ? "#EF4444" : "var(--color-text-muted)"
  const sparkColor = isPositive ? "#10B981" : isNegative ? "#EF4444" : "var(--color-text-muted)"

  return (
    <div
      style={{
        background: "var(--color-bg-hover)",
        borderRadius: "10px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{label}</span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            color: indicatorColor,
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {trend ? (
            <>
              {isPositive ? <IconArrowUp size={12} /> : isNegative ? <IconArrowDown size={12} /> : <IconMinus size={12} />}
              {isPositive && "+"}{trend.change}%
            </>
          ) : (
            <IconMinus size={12} />
          )}
        </span>
      </div>
      <span style={{ fontSize: "28px", fontWeight: 600, color: "var(--color-text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {trend?.change ?? 0}
      </span>
      <Sparkline data={sparklineData} color={sparkColor} />
    </div>
  )
}

export function TrendsSection({ completed }: TrendsSectionProps) {
  const trends = useMemo(
    () => ({
      communication: computeDimensionTrend(completed, "communicationScore"),
      confidence: computeDimensionTrend(completed, "overallScore"),
      ownership: computeDimensionTrend(completed, "problemSolvingScore"),
      structure: computeDimensionTrend(completed, "technicalScore"),
    }),
    [completed],
  )

  const sparklines = useMemo(
    () => ({
      communication: completed.map((i) => i.communicationScore).filter((s): s is number => s != null).reverse(),
      confidence: completed.map((i) => i.overallScore).filter((s): s is number => s != null).reverse(),
      ownership: completed.map((i) => i.problemSolvingScore).filter((s): s is number => s != null).reverse(),
      structure: completed.map((i) => i.technicalScore).filter((s): s is number => s != null).reverse(),
    }),
    [completed],
  )

  return (
    <section>
      <p style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "10px" }}>
        TRENDS
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        <TrendCard label="Communication" trend={trends.communication} sparklineData={sparklines.communication} />
        <TrendCard label="Confidence" trend={trends.confidence} sparklineData={sparklines.confidence} />
        <TrendCard label="Ownership" trend={trends.ownership} sparklineData={sparklines.ownership} />
        <TrendCard label="Structure" trend={trends.structure} sparklineData={sparklines.structure} />
      </div>
    </section>
  )
}
