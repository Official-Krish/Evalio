interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Trending-up icon.
 * Pairs with: "Tracks how you improve"
 * Visual idea: an ascending line with a sharp final breakout point —
 * deliberate upward trajectory, not a generic line chart.
 */
export function IconTrendingUp({
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
      <path d="M3 17l5-5 4 4 8-9" />
      <path d="M14 7h6v6" />
    </svg>
  );
}

export default IconTrendingUp;
