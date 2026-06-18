import { useState } from "react";
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
        gap: "4px",
        padding: "10px 14px",
        borderBottom: "1px solid var(--color-border-light)",
        overflowX: "auto",
      }}
    >
      {PHASES.map((p) => {
        const done = phasesCompleted.includes(p.id);
        const active = currentPhase === p.id;
        return (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: active ? 600 : 400,
              color: done
                ? "var(--color-text)"
                : active
                  ? "var(--color-text)"
                  : "var(--color-text-muted)",
              background: active
                ? "var(--color-accent-bg, rgba(184,168,138,0.12))"
                : done
                  ? "var(--color-bg-hover)"
                  : "transparent",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                fontWeight: 700,
                background: done
                  ? "var(--color-accent, #b8a88a)"
                  : active
                    ? "var(--color-border)"
                    : "var(--color-border-light)",
                color: done ? "#080808" : "var(--color-text-muted)",
                flexShrink: 0,
              }}
            >
              {done ? "\u2713" : PHASES.indexOf(p) + 1}
            </span>
            {p.short}
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
        borderRadius: "8px",
        border: "1px solid var(--color-border-light)",
        overflow: "hidden",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "var(--color-bg-hover)",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "var(--color-text)",
            fontSize: "11px",
          }}
        >
          Example {index + 1}
        </span>
      </div>
      <div
        style={{
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Input
          </span>
          <div
            style={{
              marginTop: "2px",
              padding: "6px 8px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.03)",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "11px",
              color: "#e2e8f0",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {testCase.input}
          </div>
        </div>
        <div>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Output
          </span>
          <div
            style={{
              marginTop: "2px",
              padding: "6px 8px",
              borderRadius: "4px",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.15)",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "11px",
              color: "#4ade80",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {testCase.output}
          </div>
        </div>
        {testCase.explanation && (
          <>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "10px",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
                marginTop: "2px",
              }}
            >
              {showExplanation
                ? "Hide explanation \u25B2"
                : "Show explanation \u25BC"}
            </button>
            {showExplanation && (
              <div
                style={{
                  padding: "6px 8px",
                  borderRadius: "4px",
                  background: "rgba(255,255,255,0.03)",
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {testCase.explanation}
              </div>
            )}
          </>
        )}
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
        background: "var(--color-bg-elevated)",
        borderLeft: "1px solid var(--color-border-light)",
        backdropFilter: "blur(16px)",
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
