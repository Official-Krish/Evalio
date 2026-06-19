import { useState } from "react";
import { motion } from "motion/react";
import { CodeEditor } from "./CodeEditor";

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface DsaQuestion {
  dbId: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: string;
  description?: string;
  testCases?: TestCase[];
}

interface DsaAttempt {
  id: string;
  index: number;
  currentPhase: string;
  phasesCompleted: string[];
  code: string | null;
  score: number | null;
  feedback: string | null;
}

interface DsaPanelProps {
  questions: DsaQuestion[];
  attempts: DsaAttempt[];
  currentIndex: number;
  language: string;
  code: string;
  onCodeChange: (code: string) => void;
  visible: boolean;
  onRequestHint?: () => void;
}

const PHASES = [
  { id: "understanding", label: "Understand", short: "Understanding" },
  { id: "brute_force", label: "Brute Force", short: "Brute Force" },
  { id: "optimization", label: "Optimize", short: "Optimization" },
  { id: "implementation", label: "Implement", short: "Implementation" },
  { id: "testing", label: "Test", short: "Testing" },
  { id: "review", label: "Review", short: "Review" },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "#22c55e",
  MEDIUM: "#eab308",
  HARD: "#ef4444",
};

function PhaseStepper({
  currentPhase,
  phasesCompleted,
}: {
  currentPhase: string;
  phasesCompleted: string[];
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid var(--color-border-light)",
        background: "rgba(255, 255, 255, 0.01)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {PHASES.map((p, idx) => {
        const done = phasesCompleted.includes(p.id);
        const active = currentPhase === p.id;
        return (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              flex: idx === PHASES.length - 1 ? "none" : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                cursor: "default",
                zIndex: 2,
              }}
            >
              <motion.div
                animate={{
                  scale: active ? 1.15 : 1,
                  backgroundColor: done
                    ? "var(--app-accent, #b8a88a)"
                    : active
                      ? "var(--color-text)"
                      : "var(--color-bg-hover)",
                  borderColor: active
                    ? "var(--app-accent, #b8a88a)"
                    : done
                      ? "var(--app-accent, #b8a88a)"
                      : "var(--color-border)",
                  boxShadow: active
                    ? "0 0 10px var(--app-accent-glow)"
                    : "none",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "1px solid",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: done
                    ? "#080808"
                    : active
                      ? "var(--color-bg)"
                      : "var(--color-text-muted)",
                }}
              >
                {done ? "✓" : idx + 1}
              </motion.div>

              <span
                style={{
                  fontSize: "9px",
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.03em",
                  color: active
                    ? "var(--color-text)"
                    : done
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-tertiary)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.short}
              </span>
            </div>

            {idx < PHASES.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "9px",
                  left: "18px",
                  right: "0",
                  height: "1px",
                  background: done
                    ? "var(--app-accent, #b8a88a)"
                    : "var(--color-border-light)",
                  opacity: done ? 0.8 : 0.4,
                  zIndex: 1,
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TestCaseCard({
  testCase,
  index,
}: {
  testCase: TestCase;
  index: number;
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div
      style={{
        fontSize: "12px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "var(--color-text)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Example {index + 1}
        </span>
      </div>

      <div
        style={{
          background: "#0d0d0d",
          border: "1px solid var(--color-border-light)",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            background: "#141414",
            borderBottom: "1px solid var(--color-border-light)",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ff5f56",
              }}
            />
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ffbd2e",
              }}
            />
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#27c93f",
              }}
            />
          </div>
          <span
            style={{ fontFamily: "monospace", fontSize: "9px", color: "#666" }}
          >
            console
          </span>
        </div>

        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                color: "#777",
                marginBottom: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              $ Input
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "11px",
                color: "#e2e8f0",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {testCase.input}
            </pre>
          </div>

          <div style={{ borderTop: "1px solid #1c1c1c", paddingTop: "8px" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                color: "#5dcaa5",
                marginBottom: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              $ Expected Output
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "11px",
                color: "#4ade80",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {testCase.output}
            </pre>
          </div>

          {testCase.explanation && (
            <div style={{ borderTop: "1px solid #1c1c1c", paddingTop: "8px" }}>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--app-accent, #b8a88a)",
                  fontSize: "10px",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>{showExplanation ? "▼" : "▶"}</span> Explanation
              </button>
              {showExplanation && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: "#a0aec0",
                    lineHeight: 1.5,
                  }}
                >
                  {testCase.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProblemDescription({ question }: { question: DsaQuestion | null }) {
  const [showAllDescription, setShowAllDescription] = useState(false);

  if (!question) {
    return (
      <p
        style={{
          fontSize: "13px",
          color: "var(--color-text-muted)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        Loading question...
      </p>
    );
  }

  const diffColor =
    DIFFICULTY_COLORS[question.difficulty] ?? "var(--color-text-muted)";
  const testCases = question.testCases ?? [];
  const descriptionHtml = question.description ?? "";

  return (
    <div
      style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
        }}
      >
        {/* Title + Difficulty */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--color-text)",
              flex: 1,
            }}
          >
            {question.title}
          </h3>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: diffColor,
              padding: "2px 8px",
              borderRadius: "4px",
              background: `${diffColor}15`,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Problem Description */}
        {descriptionHtml && (
          <div
            style={{
              fontSize: "13px",
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              marginBottom: "16px",
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: showAllDescription
                  ? descriptionHtml
                  : descriptionHtml.slice(0, 2000),
              }}
            />
            {descriptionHtml.length > 2000 && (
              <button
                onClick={() => setShowAllDescription(!showAllDescription)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-accent, #b8a88a)",
                  fontSize: "12px",
                  cursor: "pointer",
                  padding: "4px 0",
                  marginTop: "4px",
                }}
              >
                {showAllDescription ? "Show less \u25B2" : "Show more \u25BC"}
              </button>
            )}
          </div>
        )}

        {/* Test Cases */}
        {testCases.length > 0 && (
          <div>
            <h4
              style={{
                margin: "0 0 8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              Examples
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {testCases.map((tc, i) => (
                <TestCaseCard key={i} testCase={tc} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DsaPanel({
  questions,
  attempts,
  currentIndex,
  language,
  code,
  onCodeChange,
  visible,
  onRequestHint,
}: DsaPanelProps) {
  const currentQuestion = questions[currentIndex] ?? null;
  const currentAttempt = attempts.find((a) => a.index === currentIndex) ?? null;

  const [tab, setTab] = useState<"problem" | "code">("code");

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(520px, 45vw)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "var(--db-card-bg)",
        borderLeft: "1px solid var(--app-accent-border)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "var(--db-card-shadow)",
      }}
    >
      {/* Phase stepper */}
      <PhaseStepper
        currentPhase={currentAttempt?.currentPhase ?? "understanding"}
        phasesCompleted={currentAttempt?.phasesCompleted ?? []}
      />

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <button
          onClick={() => setTab("problem")}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            background:
              tab === "problem" ? "var(--color-bg-hover)" : "transparent",
            color:
              tab === "problem"
                ? "var(--color-text)"
                : "var(--color-text-muted)",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            borderBottom:
              tab === "problem"
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
            transition: "all 0.15s ease",
          }}
        >
          Problem
        </button>
        <button
          onClick={() => setTab("code")}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            background:
              tab === "code" ? "var(--color-bg-hover)" : "transparent",
            color:
              tab === "code" ? "var(--color-text)" : "var(--color-text-muted)",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            borderBottom:
              tab === "code"
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
            transition: "all 0.15s ease",
          }}
        >
          Code
        </button>
        {onRequestHint && (
          <button
            onClick={onRequestHint}
            title="Ask for a hint"
            style={{
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Hint
          </button>
        )}
      </div>

      {/* Content area */}
      {tab === "problem" ? (
        <ProblemDescription question={currentQuestion} />
      ) : (
        <div style={{ flex: 1, padding: "12px", overflow: "hidden" }}>
          <CodeEditor language={language} code={code} onChange={onCodeChange} />
        </div>
      )}
    </div>
  );
}
