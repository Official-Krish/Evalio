import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

function formatWait(position: number): string {
  if (position <= 1) return "You're next";
  const minutes = Math.ceil(((position - 1) * 15) / 4);
  if (minutes < 1) return "Less than a minute";
  if (minutes === 1) return "About 1 minute";
  return `About ${minutes} minutes`;
}

export function InterviewQueue({
  position,
  onLeave,
}: {
  position: number;
  onLeave: () => void;
}) {
  return (
    <div
      className="interview-room flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-6"
      style={{ background: "var(--color-bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div
          className="interview-queue-position"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "2px solid var(--landing-accent, #b8a88a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <motion.span
            className="interview-queue-number"
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "var(--color-text)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
            }}
            key={position}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {position}
          </motion.span>
          <motion.div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: "1px solid var(--landing-accent, #b8a88a)",
              opacity: 0.3,
            }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            You're in line
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              margin: "6px 0 0",
              maxWidth: 280,
              lineHeight: 1.5,
            }}
          >
            {formatWait(position)}. We'll notify you as soon as a slot opens.
          </p>
        </div>

        <button
          onClick={onLeave}
          style={{
            marginTop: 8,
            padding: "8px 20px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Leave queue
        </button>
      </motion.div>
    </div>
  );
}
