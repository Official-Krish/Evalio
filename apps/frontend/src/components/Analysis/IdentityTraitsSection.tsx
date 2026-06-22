import { motion } from "motion/react";

interface IdentityTrait {
  score: number;
  level: string;
  trend: string;
  description: string;
}

interface IdentityTraitsSectionProps {
  traits: Record<string, IdentityTrait> | null;
}

export function IdentityTraitsSection({ traits }: IdentityTraitsSectionProps) {
  if (!traits) return null;

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
      <span className="db-section-label mb-5 block">
        Interview Identity Map
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {Object.entries(traits).map(([key, trait]) => {
          const levelColor =
            trait.level === "high"
              ? "#10b981"
              : trait.level === "medium"
                ? "#f59e0b"
                : "#ef4444";
          return (
            <div
              key={key}
              className="p-4 rounded-xl border border-white/[0.02] bg-white/[0.005] hover:bg-white/[0.01] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                  style={{
                    background: `${levelColor}15`,
                    color: levelColor,
                    border: `1px solid ${levelColor}20`,
                  }}
                >
                  {trait.level}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2.5">
                <span className="text-2xl font-bold font-sans text-[var(--color-text)]">
                  {trait.score}%
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  alignment
                </span>
              </div>

              <div className="h-[3px] rounded-full overflow-hidden bg-white/[0.04] mb-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.score}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: levelColor }}
                />
              </div>

              <p className="text-[10.5px] leading-relaxed text-[var(--color-text-muted)] m-0 capitalize">
                trending {trait.trend}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
