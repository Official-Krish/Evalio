import { motion } from "motion/react";
import {
  IconAlertOctagon,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";

interface FailurePattern {
  code: string;
  label: string | null;
  frequency: number;
  totalSessions: number;
  severity: string;
  trend: string;
}

interface FailurePatternsProps {
  patterns: FailurePattern[];
}

export function FailurePatterns({ patterns }: FailurePatternsProps) {
  if (patterns.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.03) 100%), var(--color-bg-card, rgba(18,18,18,0.6))",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <span className="db-section-label mb-2 block">
        Behavioral Diagnostics
      </span>
      <p className="text-[12.5px] mb-6 leading-relaxed max-w-2xl text-[var(--color-text-secondary)]">
        Recurring behavioral signals detected across your sessions. These
        patterns surface when you consistently approach technical or
        communicative situations in a specific style.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.slice(0, 6).map((pattern, i) => {
          const pct =
            pattern.totalSessions > 0
              ? Math.round((pattern.frequency / pattern.totalSessions) * 100)
              : 0;

          const isHigh = pattern.severity === "high";
          const isMed = pattern.severity === "medium";
          const severityColor = isHigh
            ? "#ef4444"
            : isMed
              ? "#f59e0b"
              : "#94a3b8";

          // Trend icon mapping
          const tr = pattern.trend.toLowerCase();
          const TrendIcon =
            tr.includes("up") || tr.includes("improve")
              ? IconTrendingUp
              : tr.includes("down") || tr.includes("decline")
                ? IconTrendingDown
                : IconMinus;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="p-4 rounded-xl border relative overflow-hidden group transition-all duration-300 hover:bg-white/[0.02]"
              style={{
                background: "rgba(255, 255, 255, 0.01)",
                borderColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              {/* Soft hover glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 filter blur-[20px]"
                style={{
                  background: `radial-gradient(circle at 90% 10%, ${severityColor}06 0%, transparent 50%)`,
                }}
              />

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <IconAlertOctagon
                    size={14}
                    style={{ color: severityColor }}
                  />
                  <span className="text-[13px] font-semibold text-[var(--color-text)] tracking-tight">
                    {pattern.label || pattern.code.replace(/_/g, " ")}
                  </span>
                </div>

                <span
                  className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold shrink-0"
                  style={{
                    background: isHigh
                      ? "rgba(239, 68, 68, 0.1)"
                      : isMed
                        ? "rgba(245, 158, 11, 0.1)"
                        : "rgba(148, 163, 184, 0.08)",
                    color: severityColor,
                    border: `1px solid ${severityColor}15`,
                  }}
                >
                  {pattern.severity}
                </span>
              </div>

              {/* Progress and numbers */}
              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-2 font-mono">
                <span>Signal Frequency</span>
                <span className="text-[var(--color-text-secondary)] font-medium">
                  {pattern.frequency} of {pattern.totalSessions} sessions ({pct}
                  %)
                </span>
              </div>

              <div className="h-[4px] rounded-full overflow-hidden mb-3 bg-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.1 + 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: severityColor,
                    boxShadow: `0 0 8px ${severityColor}40`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-1">
                <div className="flex items-center gap-1">
                  <TrendIcon size={12} className="opacity-70" />
                  <span className="capitalize">Trending {pattern.trend}</span>
                </div>
                <span className="font-mono opacity-40">
                  #{pattern.code.substring(0, 5)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
