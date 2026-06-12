export function OrbitalMark({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="5"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
        transform="rotate(-24 16 16)"
      />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      <circle cx="27" cy="12" r="1.5" fill="currentColor" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 16 16"
          to="360 16 16"
          dur="18s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}
