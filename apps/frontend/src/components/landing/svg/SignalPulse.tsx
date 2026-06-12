export function SignalPulse({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />
      <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="0.5" opacity="0.18">
        <animate
          attributeName="r"
          values="36;40;36"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.18;0.08;0.18"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.9">
        <animate
          attributeName="opacity"
          values="0.9;0.5;0.9"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <path
        d="M60 20v12M60 88v12M20 60h12M88 60h12"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  )
}
