export function WaveTrace({ className = "", active = true }: { className?: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 320 48" fill="none" className={className} aria-hidden preserveAspectRatio="none">
      <path
        d="M0 24 C40 8, 80 40, 120 24 S200 8, 240 24 S300 40, 320 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      >
        {active && (
          <animate
            attributeName="d"
            values="
              M0 24 C40 8, 80 40, 120 24 S200 8, 240 24 S300 40, 320 24;
              M0 24 C40 36, 80 12, 120 24 S200 36, 240 24 S300 12, 320 24;
              M0 24 C40 8, 80 40, 120 24 S200 8, 240 24 S300 40, 320 24
            "
            dur="6s"
            repeatCount="indefinite"
          />
        )}
      </path>
      <path
        d="M0 28 C50 14, 90 38, 140 28 S220 14, 270 28 S310 38, 320 28"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.15"
        fill="none"
      >
        {active && (
          <animate
            attributeName="d"
            values="
              M0 28 C50 14, 90 38, 140 28 S220 14, 270 28 S310 38, 320 28;
              M0 28 C50 38, 90 18, 140 28 S220 38, 270 28 S310 18, 320 28;
              M0 28 C50 14, 90 38, 140 28 S220 14, 270 28 S310 38, 320 28
            "
            dur="7.5s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </svg>
  )
}
