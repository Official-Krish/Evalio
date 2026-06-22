import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import type { Session } from "./types";

interface SessionHistoryProps {
  sessions: Session[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.03) 100%), var(--color-bg-card, rgba(18,18,18,0.6))",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(24px)",
      }}
    >
      <span className="db-section-label mb-4 block">Simulation Logs</span>
      <div className="flex flex-col divide-y divide-white/[0.03]">
        {[...sessions].reverse().map((s, i) => {
          const scoreColor =
            s.overallScore != null
              ? s.overallScore >= 80
                ? "#10b981"
                : s.overallScore >= 60
                  ? "#f59e0b"
                  : "#ef4444"
              : "#6b7280";

          return (
            <Link
              key={s.id}
              to={`/results/${s.id}`}
              className="flex items-center justify-between py-3.5 px-2 -mx-2 rounded-xl no-underline transition-all duration-200 hover:bg-white/[0.02] group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0 w-8">
                  #{String(sessions.length - i).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-[var(--color-text)] truncate m-0 mb-0.5 group-hover:text-accent transition-colors">
                    {s.companyName || s.roleTitle || "Practice Interview"}
                  </h4>
                  <div className="flex items-center gap-2 text-[10.5px] text-[var(--color-text-muted)] font-mono">
                    <span className="uppercase">{s.mode}</span>
                    <span>·</span>
                    <span>
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {s.overallScore != null && (
                  <div className="text-right">
                    <span
                      className="text-sm font-semibold font-mono"
                      style={{ color: scoreColor }}
                    >
                      {Math.round(s.overallScore)}%
                    </span>
                  </div>
                )}
                <IconChevronRight
                  size={14}
                  className="text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
