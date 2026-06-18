import { DIFFICULTY_COLORS, APPROACH_LABELS } from "./constants";
import { CodeBlock } from "./CodeBlock";
import type { DsaSessionData } from "./types";

export function DsaResultsSection({ session }: { session: DsaSessionData }) {
  const questions = session.questions as Array<{
    dbId: string;
    leetcodeId: number;
    title: string;
    slug: string;
    difficulty: string;
  }>;

  return (
    <div className="mb-12">
      <p
        className="text-[11px] tracking-[0.1em] uppercase mb-5 font-semibold"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        CODING ASSESSMENT
      </p>

      <div className="flex flex-col gap-8">
        {questions.map((q, qIdx) => {
          const attempt = session.attempts.find((a) => a.index === qIdx);
          const snapshots = attempt?.codeSnapshots ?? {};
          const diffColor =
            DIFFICULTY_COLORS[q.difficulty] ?? "var(--color-text-muted)";

          const approaches = [
            "understanding",
            "brute_force",
            "optimization",
          ].filter((p) => snapshots[p]);

          return (
            <div
              key={q.dbId}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-card)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[13px] font-[600]"
                  style={{ color: "var(--color-text)" }}
                >
                  {qIdx + 1}. {q.title}
                </span>
                <span
                  className="text-[10px] font-[600] px-[8px] py-[2px] rounded-md uppercase tracking-[0.04em]"
                  style={{ color: diffColor, background: `${diffColor}18` }}
                >
                  {q.difficulty}
                </span>
                <span
                  className="text-[10px] px-[8px] py-[2px] rounded-md"
                  style={{
                    color: "var(--color-text-muted)",
                    background: "var(--color-bg-hover)",
                  }}
                >
                  {session.language}
                </span>
              </div>

              {attempt?.score != null && (
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[12px] font-[500]"
                    style={{
                      color:
                        attempt.score >= 7
                          ? "#5DCAA5"
                          : attempt.score >= 4
                            ? "#eab308"
                            : "#ef4444",
                    }}
                  >
                    Score: {Math.round(attempt.score)}/10
                  </span>
                  {attempt.complexity && (
                    <span
                      className="text-[11px] font-mono px-[8px] py-[2px] rounded-md"
                      style={{
                        color: "var(--color-text-muted)",
                        background: "var(--color-bg-hover)",
                      }}
                    >
                      {attempt.complexity}
                    </span>
                  )}
                </div>
              )}

              {attempt?.feedback && (
                <blockquote
                  className="text-[12.5px] leading-[1.6] italic mb-4 pl-4"
                  style={{
                    color: "var(--color-text-muted)",
                    borderLeft: "2px solid var(--app-accent-border)",
                  }}
                >
                  {attempt.feedback}
                </blockquote>
              )}

              {approaches.length > 0 ? (
                approaches.map((phase) => {
                  const info = APPROACH_LABELS[phase] ?? {
                    label: phase,
                    description: "",
                  };
                  return (
                    <div key={phase} className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-[600] tracking-[0.06em] uppercase"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {info.label}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          — {info.description}
                        </span>
                      </div>
                      <CodeBlock
                        code={snapshots[phase]!}
                        language={session.language}
                      />
                    </div>
                  );
                })
              ) : (
                <p
                  className="text-[12px] italic"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {attempt?.code
                    ? "Code submitted during implementation phase."
                    : "No code submitted for this question."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
