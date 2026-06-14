export function SpectrumWave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 180"
      fill="none"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M0 90 C120 40 240 140 360 90 S600 40 720 90 S960 140 1080 90 S1200 40 1200 90"
        className="stroke-[var(--landing-line)]"
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      >
        <animate
          attributeName="d"
          values="
            M0 90 C120 40 240 140 360 90 S600 40 720 90 S960 140 1080 90 S1200 40 1200 90;
            M0 90 C120 130 240 50 360 90 S600 130 720 90 S960 50 1080 90 S1200 130 1200 90;
            M0 90 C120 40 240 140 360 90 S600 40 720 90 S960 140 1080 90 S1200 40 1200 90
          "
          dur="6s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0 110 C160 60 320 160 480 110 S720 60 880 110 S1040 160 1200 110"
        className="stroke-[var(--landing-line)]"
        strokeWidth="0.5"
        opacity="0.12"
        fill="none"
      >
        <animate
          attributeName="d"
          values="
            M0 110 C160 60 320 160 480 110 S720 60 880 110 S1040 160 1200 110;
            M0 110 C160 150 320 70 480 110 S720 150 880 110 S1040 70 1200 110;
            M0 110 C160 60 320 160 480 110 S720 60 880 110 S1040 160 1200 110
          "
          dur="7.5s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0 75 C80 25 200 125 320 75 S480 25 600 75 S760 125 880 75 S1000 25 1120 75 S1200 125 1200 75"
        className="stroke-[var(--landing-accent)]"
        strokeWidth="0.5"
        opacity="0.08"
        fill="none"
      >
        <animate
          attributeName="d"
          values="
            M0 75 C80 25 200 125 320 75 S480 25 600 75 S760 125 880 75 S1000 25 1120 75 S1200 125 1200 75;
            M0 75 C80 115 200 35 320 75 S480 115 600 75 S760 35 880 75 S1000 115 1120 75 S1200 35 1200 75;
            M0 75 C80 25 200 125 320 75 S480 25 600 75 S760 125 880 75 S1000 25 1120 75 S1200 125 1200 75
          "
          dur="5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}
