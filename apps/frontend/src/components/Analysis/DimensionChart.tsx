import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";

interface DimensionChartProps {
  label: string;
  values: number[];
  labels: string[];
  color: string;
  currentValue: number;
  narrative: string;
}

function CustomTooltip({
  active,
  payload,
  label: tooltipLabel,
  color,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  color: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl border p-3 shadow-2xl backdrop-blur-md transition-all duration-300"
        style={{
          background: "rgba(18, 18, 18, 0.8)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${color}10`,
        }}
      >
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
          Session #{tooltipLabel}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold font-mono" style={{ color }}>
            {payload[0]!.value}%
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            Score
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function DimensionChart({
  label,
  values,
  labels,
  color,
  currentValue,
  narrative,
}: DimensionChartProps) {
  const chartData = useMemo(
    () =>
      values.map((v, i) => ({
        name: labels[i] ?? `${i + 1}`,
        score: v,
      })),
    [values, labels],
  );

  const trend = useMemo(() => {
    if (values.length < 2) return null;
    return values[values.length - 1]! - values[0]!;
  }, [values]);

  if (chartData.length < 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-6 h-full flex flex-col justify-between"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.03) 100%), var(--color-bg-card, rgba(18,18,18,0.6))`,
        border: "1px solid rgba(255, 255, 255, 0.04)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Dynamic glow effect background */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none filter blur-[40px] opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />

      <div>
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span
              className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              {label} Trend
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <p
                className="text-[clamp(32px,4.5vw,42px)] font-normal leading-none m-0 tracking-tight"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "Instrument Serif, Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                {currentValue}%
              </p>
              {trend != null && (
                <span
                  className={`text-[11px] font-medium font-mono flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                    trend >= 0
                      ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                      : "text-red-400 bg-red-500/5 border border-red-500/10"
                  }`}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-[0.5px]"
                  >
                    {trend >= 0 ? (
                      <path d="M1 7l3-4 3 2 2-2" />
                    ) : (
                      <path d="M1 3l3 4 3-2 2 2" />
                    )}
                  </svg>
                  {trend >= 0 ? "+" : ""}
                  {trend} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-[220px] mb-5 relative">
          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 4, left: -20 }}
              >
                <defs>
                  <linearGradient
                    id={`grad-${label.replace(/\s+/g, "")}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-text-secondary)",
                    fontFamily: "monospace",
                  }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  dy={4}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{
                    fontSize: 10,
                    fill: "var(--color-text-secondary)",
                    fontFamily: "monospace",
                  }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  width={28}
                  dx={-2}
                />
                <Tooltip
                  content={<CustomTooltip color={color} />}
                  cursor={{
                    stroke: "rgba(255,255,255,0.08)",
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${label.replace(/\s+/g, "")})`}
                  activeDot={{
                    r: 5,
                    fill: color,
                    stroke: "var(--color-bg, #080808)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                Awaiting more sessions to generate trends
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Narrative */}
      <div
        className="mt-2 p-3.5 rounded-xl border border-white/[0.02]"
        style={{
          background: "rgba(255, 255, 255, 0.01)",
        }}
      >
        <p className="text-[12.5px] leading-relaxed m-0 text-[var(--color-text-secondary)]">
          {narrative}
        </p>
      </div>
    </motion.div>
  );
}
