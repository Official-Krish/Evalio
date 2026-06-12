export function ScanLine({ progress = 0, className = "" }: { progress?: number; className?: string }) {
  const y = 8 + progress * 84
  return (
    <svg viewBox="0 0 2 100" fill="none" className={className} aria-hidden preserveAspectRatio="none">
      <line x1="1" y1="0" x2="1" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      <circle cx="1" cy={y} r="2" fill="currentColor" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
