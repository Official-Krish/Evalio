import { useMemo, useState } from "react";
import { Liveline } from "liveline";
import { motion } from "motion/react";
import { useTheme } from "../../lib/use-theme";

interface DimensionChartProps {
  label: string;
  values: number[];
  labels: string[];
  color: string;
  currentValue: number;
  narrative: string;
}

export function DimensionChart({
  label,
  values,
  labels,
  color,
  currentValue,
  narrative,
}: DimensionChartProps) {
  const { theme } = useTheme();

  const trend = useMemo(() => {
    if (values.length < 2) return null;
    return values[values.length - 1]! - values[0]!;
  }, [values]);

  const [nowSecs] = useState(() => {
    const t = Date.now() / 1000;
    return Math.floor(t / 60) * 60;
  });
  const stepSeconds = 60; // 1 minute per session

  const livelineData = useMemo(() => {
    return values.map((v, i) => ({
      time: nowSecs - (values.length - 1 - i) * stepSeconds,
      value: v,
    }));
  }, [values, nowSecs]);

  const windowSecs = useMemo(() => {
    return values.length * stepSeconds;
  }, [values.length]);

  const formatValue = useMemo(() => {
    return (v: number) => `${Math.round(v)}%`;
  }, []);

  const formatTime = useMemo(() => {
    return (t: number) => {
      const index = Math.round(
        (t - nowSecs) / stepSeconds + (values.length - 1),
      );
      if (index >= 0 && index < values.length) {
        return labels[index] ?? `${index + 1}`;
      }
      return "";
    };
  }, [values.length, labels, nowSecs]);

  if (values.length < 1) return null;

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
        <div className="w-full h-[240px] mb-5 relative flex flex-col justify-end">
          {values.length >= 2 ? (
            <>
              <div className="flex-1 relative flex items-stretch min-h-0">
                {/* Rotated Y-Axis Label */}
                <div
                  className="flex items-center justify-center w-6 select-none shrink-0"
                  style={{ marginRight: "-4px" }}
                >
                  <span
                    className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--color-text-muted)] whitespace-nowrap block"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    Score (%)
                  </span>
                </div>

                {/* Liveline Canvas Container */}
                <div className="flex-grow relative min-w-0 h-full">
                  <Liveline
                    data={livelineData}
                    value={currentValue}
                    color={color}
                    theme={theme}
                    grid={true}
                    badge={true}
                    scrub={true}
                    paused={true}
                    window={windowSecs}
                    formatValue={formatValue}
                    formatTime={formatTime}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="text-center mt-3 select-none">
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Timeline (Sessions)
                </span>
              </div>
            </>
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
