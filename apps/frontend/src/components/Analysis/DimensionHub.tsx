import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DimensionChart } from "./DimensionChart";
import { buildNarrative } from "./utils";
import type { Session } from "./types";

interface DimensionHubProps {
  overallVals: number[];
  techVals: number[];
  commVals: number[];
  probVals: number[];
  sessions: Session[];
}

type DimKey = "Overall" | "Technical" | "Communication" | "Problem Solving";

export function DimensionHub({
  overallVals,
  techVals,
  commVals,
  probVals,
  sessions,
}: DimensionHubProps) {
  const [activeDim, setActiveDim] = useState<DimKey>("Overall");

  const dims = useMemo(
    () => [
      {
        key: "Overall" as const,
        label: "Overall Rating",
        vals: overallVals,
        color: "#b8a88a",
      },
      {
        key: "Technical" as const,
        label: "Technical Skill",
        vals: techVals,
        color: "#7F77DD",
      },
      {
        key: "Communication" as const,
        label: "Communication",
        vals: commVals,
        color: "#5DCAA5",
      },
      {
        key: "Problem Solving" as const,
        label: "Problem Solving",
        vals: probVals,
        color: "#EF9F27",
      },
    ],
    [overallVals, techVals, commVals, probVals],
  );

  const activeDimData = useMemo(
    () => dims.find((d) => d.key === activeDim)!,
    [activeDim, dims],
  );

  const chartLabels = useMemo(
    () => sessions.map((_, i) => `${i + 1}`),
    [sessions],
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
      <div className="flex flex-col gap-3 lg:col-span-1 justify-between">
        <div className="flex flex-col gap-2">
          <div className="px-1 mb-2">
            <span className="db-section-label">Dimension Explorer</span>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
              Select a metric to query detailed scoring timelines and analytical
              feedback.
            </p>
          </div>

          {dims.map((dim) => {
            const isActive = activeDim === dim.key;
            const currentVal =
              dim.vals.length > 0 ? (dim.vals[dim.vals.length - 1] ?? 0) : 0;
            const prevVal =
              dim.vals.length > 1
                ? (dim.vals[dim.vals.length - 2] ?? null)
                : null;
            const delta = prevVal !== null ? currentVal - prevVal : null;

            return (
              <button
                key={dim.key}
                onClick={() => setActiveDim(dim.key)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden group outline-none cursor-pointer ${
                  isActive
                    ? "border-white/[0.06]"
                    : "border-transparent bg-white/[0.01] hover:bg-white/[0.02]"
                }`}
                style={{
                  background: isActive
                    ? `radial-gradient(circle at 100% 0%, ${dim.color}08 0%, transparent 60%), rgba(255, 255, 255, 0.02)`
                    : "rgba(255, 255, 255, 0.01)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ backgroundColor: dim.color }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                    {dim.label}
                  </span>
                  {delta !== null && delta !== 0 && (
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        delta > 0
                          ? "text-emerald-400 bg-emerald-500/5"
                          : "text-red-400 bg-red-500/5"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta} pt
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-sans text-[var(--color-text)]">
                      {currentVal}%
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">
                      current
                    </span>
                  </div>

                  <div className="flex gap-[2px] items-end h-4 w-12 opacity-40 group-hover:opacity-75 transition-opacity">
                    {dim.vals.slice(-5).map((val, idx) => (
                      <div
                        key={idx}
                        className="w-[6px] rounded-t-sm"
                        style={{
                          height: `${Math.max(20, val)}%`,
                          backgroundColor: isActive
                            ? dim.color
                            : "var(--color-text-secondary)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          <DimensionChart
            key={activeDimData.key}
            label={activeDimData.label}
            values={activeDimData.vals}
            labels={chartLabels.slice(0, activeDimData.vals.length)}
            color={activeDimData.color}
            currentValue={
              activeDimData.vals.length > 0
                ? activeDimData.vals[activeDimData.vals.length - 1]!
                : 0
            }
            narrative={buildNarrative(
              activeDimData.vals,
              activeDimData.key,
              sessions,
            )}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}
