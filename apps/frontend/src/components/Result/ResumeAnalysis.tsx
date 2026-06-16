import type { InterviewSummary } from "@evalio/shared";

export function ResumeAnalysis({ summary }: { summary: InterviewSummary }) {
  const strengths = summary.resumeStrengths as string[];
  const weaknesses = summary.resumeWeaknesses as string[];

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="pb-12">
      <p
        className="text-[11px] tracking-[0.1em] uppercase mb-4"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        RESUME ANALYSIS
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div
            className="rounded-xl p-4 pl-5 border-[0.5px] flex flex-col gap-2"
            style={{
              borderColor: "var(--color-border-tertiary)",
              background: "#EAF3DE22",
            }}
          >
            <p
              className="text-[11px] tracking-[0.08em] uppercase font-[500] mb-1"
              style={{ color: "#3B6D11" }}
            >
              What works
            </p>
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0"
                  style={{ background: "#639922" }}
                />
                <p
                  className="text-[13px] leading-[1.55] m-0"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {s}
                </p>
              </div>
            ))}
          </div>
        )}

        {weaknesses.length > 0 && (
          <div
            className="rounded-xl p-4 pl-5 border-[0.5px] flex flex-col gap-2"
            style={{
              borderColor: "var(--color-border-tertiary)",
              background: "#FAEEDA22",
            }}
          >
            <p
              className="text-[11px] tracking-[0.08em] uppercase font-[500] mb-1"
              style={{ color: "#854F0B" }}
            >
              What to improve
            </p>
            {weaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0"
                  style={{ background: "#BA7517" }}
                />
                <p
                  className="text-[13px] leading-[1.55] m-0"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {w}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
