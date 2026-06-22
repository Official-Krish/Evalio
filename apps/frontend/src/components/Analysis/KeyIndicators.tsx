import {
  IconAward,
  IconCalendar,
  IconTrophy,
  IconActivity,
} from "@tabler/icons-react";

interface KeyIndicatorsProps {
  avgScore: number;
  completedCount: number;
  mostImproved: string | null;
  failurePatternsCount: number;
}

export function KeyIndicators({
  avgScore,
  completedCount,
  mostImproved,
  failurePatternsCount,
}: KeyIndicatorsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
        <div className="p-2.5 rounded-lg bg-[#b8a88a]/5 text-[#b8a88a] border border-[#b8a88a]/10">
          <IconAward size={16} />
        </div>
        <div>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">
            Average Rating
          </span>
          <span className="text-xl font-bold font-sans text-[var(--color-text)]">
            {avgScore}%
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
        <div className="p-2.5 rounded-lg bg-purple-500/5 text-purple-400 border border-purple-500/10">
          <IconCalendar size={16} />
        </div>
        <div>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">
            Sessions Run
          </span>
          <span className="text-xl font-bold font-sans text-[var(--color-text)]">
            {String(completedCount).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
        <div className="p-2.5 rounded-lg bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
          <IconTrophy size={16} />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block truncate">
            Most Improved
          </span>
          <span className="text-[13px] font-semibold text-[var(--color-text)] truncate block mt-0.5">
            {mostImproved ?? "None Yet"}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
        <div className="p-2.5 rounded-lg bg-amber-500/5 text-amber-400 border border-amber-500/10">
          <IconActivity size={16} />
        </div>
        <div>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">
            Behavior Signals
          </span>
          <span className="text-xl font-bold font-sans text-[var(--color-text)]">
            {String(failurePatternsCount).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
