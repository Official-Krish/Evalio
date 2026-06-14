export function EvalioMark({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="6" y="9" width="18" height="2.5" rx="1.25" fill="currentColor" opacity="0.9" />
      <rect x="6" y="13.5" width="14" height="2.5" rx="1.25" fill="currentColor" opacity="0.7" />
      <rect x="6" y="18" width="10" height="2.5" rx="1.25" fill="currentColor" opacity="0.5" />
      <rect x="6" y="22.5" width="6" height="2.5" rx="1.25" fill="var(--landing-accent, #7c5cff)" />
    </svg>
  )
}
