interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * History / clock-rewind icon.
 * Pairs with: "Remembers every answer"
 * Visual idea: a clock face with a counter-clockwise rewind arrow —
 * reads as "looking back," not just "time passing."
 */
export function IconHistory({
  className,
  size = 24,
  strokeWidth = 2,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Rewind arrow sweeping into the clock face */}
      <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
      <path d="M3 3v5h5" />
      {/* Clock hands pointing to a past moment */}
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export default IconHistory;
