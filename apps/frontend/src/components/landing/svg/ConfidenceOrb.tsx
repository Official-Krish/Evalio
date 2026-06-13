import { motion } from "motion/react"

type ConfidenceOrbProps = {
  score?: number
  listening?: boolean
  size?: number
  className?: string
}

export function ConfidenceOrb({
  score = 0,
  listening = false,
  size = 220,
  className = "",
}: ConfidenceOrbProps) {
  const arcLength = 251.2
  const offset = arcLength * (1 - Math.min(score, 100) / 100)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="110" cy="110" r="98" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />

      <motion.circle
        cx="110"
        cy="110"
        r="78"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity={listening ? 0.28 : 0.14}
        animate={{ r: listening ? [78, 82, 78] : 78 }}
        transition={{ duration: listening ? 2.2 : 0.6, repeat: listening ? Infinity : 0, ease: "easeInOut" }}
      />

      <motion.g
        animate={{ rotate: listening ? 360 : 0 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "110px 110px" }}
      >
        <ellipse
          cx="110"
          cy="110"
          rx="88"
          ry="28"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.18"
        />
        <circle cx="198" cy="110" r="2" fill="currentColor" opacity="0.5" />
      </motion.g>

      <path
        d="M110 32v14M110 174v14M32 110h14M174 110h14"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.15"
      />

      <circle
        cx="110"
        cy="110"
        r="62"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="4 8"
        opacity="0.12"
      />

      <circle
        cx="110"
        cy="110"
        r="62"
        stroke="var(--landing-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${arcLength}`}
        strokeDashoffset={offset}
        transform="rotate(-90 110 110)"
        opacity={score > 0 ? 0.85 : 0.2}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />

      <motion.circle
        cx="110"
        cy="110"
        r="6"
        fill="var(--landing-accent)"
        animate={{
          opacity: listening ? [0.9, 0.45, 0.9] : 0.7,
          scale: listening ? [1, 1.15, 1] : 1,
        }}
        transition={{ duration: 2.4, repeat: listening ? Infinity : 0, ease: "easeInOut" }}
        style={{ transformOrigin: "110px 110px" }}
      />

      {listening && (
        <>
          <motion.circle
            cx="110"
            cy="110"
            r="20"
            stroke="var(--landing-accent)"
            strokeWidth="0.5"
            fill="none"
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            style={{ transformOrigin: "110px 110px" }}
          />
          <motion.circle
            cx="110"
            cy="110"
            r="20"
            stroke="var(--landing-accent)"
            strokeWidth="0.5"
            fill="none"
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
            style={{ transformOrigin: "110px 110px" }}
          />
        </>
      )}
    </svg>
  )
}
