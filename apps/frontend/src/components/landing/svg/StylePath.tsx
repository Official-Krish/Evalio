import { motion, useTransform, type MotionValue } from "motion/react"
import type { InterviewStyle } from "@evalio/shared"

const pathD =
  "M 40 320 C 120 280, 180 120, 280 100 S 420 180, 480 80 S 560 200, 620 140"

const styleGlyphs: Record<InterviewStyle, { d: string; viewBox: string }> = {
  SUPPORTIVE: {
    viewBox: "0 0 64 64",
    d: "M32 8 C48 8 56 24 56 36 C56 48 44 58 32 58 C20 58 8 48 8 36 C8 24 16 8 32 8 M32 22 C28 22 24 26 24 32 C24 38 28 42 32 42 C36 42 40 38 40 32 C40 26 36 22 32 22",
  },
  PROFESSIONAL: {
    viewBox: "0 0 64 64",
    d: "M12 48 L32 12 L52 48 M20 38 L44 38",
  },
  CHALLENGING: {
    viewBox: "0 0 64 64",
    d: "M32 10 L54 28 L44 54 L20 54 L10 28 Z M32 24 L32 40 M26 32 L38 32",
  },
  BAR_RAISER: {
    viewBox: "0 0 64 64",
    d: "M32 6 L38 24 L58 26 L42 38 L48 58 L32 46 L16 58 L22 38 L6 26 L26 24 Z",
  },
}

function StylePathSvg({
  pathLength,
  className = "",
}: {
  pathLength: number | MotionValue<number>
  className?: string
}) {
  return (
    <svg viewBox="0 0 660 360" fill="none" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="style-path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--landing-fg-muted)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="var(--landing-accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <path
        d={pathD}
        stroke="var(--landing-line)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
      />

      <motion.path
        d={pathD}
        stroke="url(#style-path-grad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        style={{ pathLength }}
      />

      {[0.08, 0.35, 0.62, 0.92].map((t, i) => {
        const x = 40 + t * 580
        const y = i === 0 ? 300 : i === 1 ? 130 : i === 2 ? 115 : 145
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="18" fill="var(--landing-bg)" stroke="var(--landing-line)" strokeWidth="1" />
            <circle cx={x} cy={y} r="6" fill="var(--landing-accent)" opacity="0.35" />
          </g>
        )
      })}
    </svg>
  )
}

function StylePathMotion({
  progress,
  className = "",
}: {
  progress: MotionValue<number>
  className?: string
}) {
  const pathLength = useTransform(progress, (p) => p)
  return <StylePathSvg pathLength={pathLength} className={className} />
}

export function StylePath({
  progress,
  className = "",
}: {
  progress: number | MotionValue<number>
  className?: string
}) {
  if (typeof progress === "number") {
    return <StylePathSvg pathLength={progress} className={className} />
  }
  return <StylePathMotion progress={progress} className={className} />
}

export function StyleGlyph({
  style,
  active = false,
  className = "",
}: {
  style: InterviewStyle
  active?: boolean
  className?: string
}) {
  const g = styleGlyphs[style]
  return (
    <svg viewBox={g.viewBox} fill="none" className={className} aria-hidden>
      <motion.path
        d={g.d}
        stroke="var(--landing-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "var(--landing-accent-soft)" : "transparent"}
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{
          pathLength: 1,
          opacity: active ? 1 : 0.45,
          strokeWidth: active ? 2.5 : 2,
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
