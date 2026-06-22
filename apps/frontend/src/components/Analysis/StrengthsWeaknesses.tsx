interface StrengthsWeaknessesProps {
  strengths: string[];
  weaknesses: string[];
}

export function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: StrengthsWeaknessesProps) {
  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {strengths.length > 0 && (
        <section
          className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.04]"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(16,185,129,0.03) 0%, transparent 60%), var(--color-bg-card, rgba(18,18,18,0.6))",
            backdropFilter: "blur(24px)",
          }}
        >
          <span className="db-section-label mb-4 block text-emerald-400">
            Key strengths verified
          </span>
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]"
              >
                <span className="mt-[6px] size-[5px] rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_#10b981]" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
      {weaknesses.length > 0 && (
        <section
          className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.04]"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(245,158,11,0.03) 0%, transparent 60%), var(--color-bg-card, rgba(18,18,18,0.6))",
            backdropFilter: "blur(24px)",
          }}
        >
          <span className="db-section-label mb-4 block text-amber-400">
            Identified areas to improve
          </span>
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {weaknesses.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]"
              >
                <span className="mt-[6px] size-[5px] rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_#f59e0b]" />
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
