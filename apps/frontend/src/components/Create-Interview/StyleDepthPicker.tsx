import type { InterviewStyle, InterviewDepth } from "@evalio/shared";
import { motion } from "motion/react";

const styleOptions: {
  value: InterviewStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "SUPPORTIVE",
    label: "Supportive",
    description: "Friendly coach — patient, encouraging, offers hints",
  },
  {
    value: "PROFESSIONAL",
    label: "Professional",
    description: "Corporate — structured, neutral, steady pace",
  },
  {
    value: "CHALLENGING",
    label: "Challenging",
    description: "Tough — interrupts rambling, demands specifics",
  },
  {
    value: "BAR_RAISER",
    label: "Bar Raiser",
    description: "Elite — deliberate silence, disagrees, demands proof",
  },
];

const depthOptions: {
  value: InterviewDepth;
  label: string;
  description: string;
}[] = [
  {
    value: "STANDARD",
    label: "Standard",
    description: "One question at a time, smooth flow",
  },
  {
    value: "PROBING",
    label: "Probing",
    description: "Occasional follow-ups for detail",
  },
  {
    value: "CHALLENGE",
    label: "Challenge",
    description: "Challenge every answer before moving on",
  },
  {
    value: "BAR_RAISER",
    label: "Bar Raiser",
    description: "Relentless depth — disagree until proven",
  },
];

interface StyleDepthPickerProps {
  style: InterviewStyle;
  depth: InterviewDepth;
  onStyleChange: (s: InterviewStyle) => void;
  onDepthChange: (d: InterviewDepth) => void;
}

export function StyleDepthPicker({
  style,
  depth,
  onStyleChange,
  onDepthChange,
}: StyleDepthPickerProps) {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            margin: "0 0 12px",
          }}
        >
          Interview Style
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {styleOptions.map((opt, i) => {
            const active = style === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => onStyleChange(opt.value)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: active
                    ? "1.5px solid var(--app-accent, #b8a88a)"
                    : "1px solid var(--color-border-light)",
                  background: active
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: active
                      ? "5px solid var(--app-accent, #b8a88a)"
                      : "2px solid var(--color-text-muted)",
                    flexShrink: 0,
                    transition: "all 0.15s",
                    opacity: active ? 1 : 0.5,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--color-text)",
                      display: "block",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {opt.description}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            margin: "0 0 12px",
          }}
        >
          Interview Depth
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {depthOptions.map((opt, i) => {
            const active = depth === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => onDepthChange(opt.value)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: active
                    ? "1.5px solid var(--app-accent, #b8a88a)"
                    : "1px solid var(--color-border-light)",
                  background: active
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: active
                      ? "5px solid var(--app-accent, #b8a88a)"
                      : "2px solid var(--color-text-muted)",
                    flexShrink: 0,
                    transition: "all 0.15s",
                    opacity: active ? 1 : 0.5,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--color-text)",
                      display: "block",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {opt.description}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
