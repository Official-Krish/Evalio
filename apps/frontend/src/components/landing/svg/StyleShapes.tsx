import type { InterviewStyle } from "@evalio/shared"

const styleConfig: Record<InterviewStyle, { path: string; viewBox: string }> = {
  SUPPORTIVE: {
    viewBox: "0 0 48 48",
    path: "M24 4 C34 4 44 14 44 24 C44 34 34 44 24 44 C14 44 4 34 4 24 C4 14 14 4 24 4 Z",
  },
  PROFESSIONAL: {
    viewBox: "0 0 48 48",
    path: "M24 4 L40 24 L24 44 L8 24 Z",
  },
  CHALLENGING: {
    viewBox: "0 0 48 48",
    path: "M24 4 L36 14 L36 28 L24 44 L12 28 L12 14 Z",
  },
  BAR_RAISER: {
    viewBox: "0 0 48 48",
    path: "M24 2 L30 16 L44 18 L33 29 L36 44 L24 36 L12 44 L15 29 L4 18 L18 16 Z",
  },
}

export function StyleShape({
  style,
  className = "",
  active = false,
}: {
  style: InterviewStyle
  className?: string
  active?: boolean
}) {
  const config = styleConfig[style]
  return (
    <svg
      viewBox={config.viewBox}
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d={config.path}
        className={active ? "stroke-[var(--landing-accent)]" : "stroke-[var(--landing-fg-muted)]"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity={active ? 0.9 : 0.35}
        fill={active ? "var(--landing-accent-soft)" : "transparent"}
      />
    </svg>
  )
}
