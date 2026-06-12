import { useState } from "react"
import { motion } from "motion/react"
import type { InterviewTurn } from "@ai-interview/shared"

function ScoreBadge({ score }: { score: number }) {
  const color =
    score === 0 ? "rgba(220,80,80,0.8)" : score < 6 ? "rgba(255,180,60,0.8)" : "rgba(80,200,120,0.8)"
  return (
    <span style={{ fontSize: "14px", fontWeight: 600, color, whiteSpace: "nowrap", flexShrink: 0 }}>
      {score}/10
    </span>
  )
}

function ModelAnswer() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          fontSize: "12px",
          color: "rgba(108,99,255,0.6)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {open ? "\u25BC Hide model answer" : "\u25B6 Show model answer"}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "8px",
            padding: "12px",
            borderRadius: "8px",
            background: "rgba(108,99,255,0.06)",
            border: "1px solid rgba(108,99,255,0.15)",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          A strong response would directly address the question with a specific example from your
          experience, using the STAR method (Situation, Task, Action, Result) to structure your answer
          clearly and concisely.
        </motion.div>
      )}
    </div>
  )
}

export function QASection({ turns }: { turns: InterviewTurn[] }) {
  return (
    <div style={{ padding: "0 0 48px" }}>
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "20px",
        }}
      >
        Questions &amp; Answers
      </p>
      <div>
        {turns.map((turn, i) => {
          const score = turn.score != null ? Math.round(turn.score / 10) : null
          const isLow = score != null && score < 6
          return (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: "20px 0",
                borderBottom: i < turns.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "6px",
                }}
              >
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--landing-fg)", lineHeight: 1.5 }}>
                  {turn.questionText}
                </p>
                {score != null && <ScoreBadge score={score} />}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.6,
                  marginBottom: turn.feedback ? "8px" : 0,
                }}
              >
                {turn.answerText || "(no answer)"}
              </p>
              {turn.feedback && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.5 }}>
                  {turn.feedback}
                </p>
              )}
              {isLow && <ModelAnswer />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
