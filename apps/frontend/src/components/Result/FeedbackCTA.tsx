import { Link } from "react-router-dom";
import { motion } from "motion/react";

export function FeedbackCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 relative overflow-hidden rounded-2xl"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
      }}
    >
      <div
        className="absolute top-20 left-20 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--app-accent-glow, rgba(184,168,138,0.12)) 0%, transparent 65%)",
          filter: "blur(1px)",
        }}
      />
      <div
        className="absolute bottom-16 right-16 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--app-accent-glow, rgba(184,168,138,0.07)) 0%, transparent 65%)",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--app-accent-border, rgba(184,168,138,0.3)) 40%, var(--app-accent, #b8a88a) 50%, var(--app-accent-border, rgba(184,168,138,0.3)) 60%, transparent 100%)",
        }}
      />

      <div className="relative px-10 py-12 flex flex-col items-center text-center gap-0">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-[10px] tracking-[0.18em] uppercase font-semibold mb-5"
          style={{ color: "var(--app-accent, #b8a88a)" }}
        >
          Your Voice Matters
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(22px,4vw,30px)] font-[400] tracking-[-0.03em] leading-[1.15] m-0 mb-3"
          style={{
            color: "var(--color-text)",
            fontFamily: "Instrument Serif, Georgia, serif",
            fontStyle: "italic",
          }}
        >
          How was your experience?
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="text-[13px] leading-[1.7] m-0 mb-8 max-w-[340px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Help us sharpen every session. Your feedback shapes what comes next.
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/feedback"
              className="inline-flex items-center gap-2.5 px-7 py-2.75 rounded-full text-[14px] font-bold no-underline tracking-[0.02em]"
              style={{
                background:
                  "linear-gradient(135deg, var(--app-accent, #b8a88a) 0%, var(--app-accent-soft, #cfc0a6) 100%)",
                color: "#0a0a0a",
                boxShadow:
                  "0 4px 24px var(--app-accent-glow, rgba(184,168,138,0.25)), 0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              Share feedback
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2.5l4.5 4-4.5 4" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
