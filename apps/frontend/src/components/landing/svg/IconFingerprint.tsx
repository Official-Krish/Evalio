interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Fingerprint icon.
 * Pairs with: "Builds your interview profile"
 * Visual idea: concentric, slightly irregular ridge lines — echoes the
 * radar-polygon "crystal fingerprint" motif used elsewhere in the product
 * (IdentityEmergence section) rather than a generic biometric glyph.
 */
export function IconFingerprint({
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
      <path d="M12 2a8 8 0 0 0-8 8c0 2.5.5 4 1.5 6" />
      <path d="M12 2a8 8 0 0 1 8 8c0 1.5-.2 2.8-.7 4.2" />
      <path d="M8 8a4 4 0 0 1 8 0c0 3-1 5-1 8" />
      <path d="M12 8a2 2 0 0 1 2 2c0 3.5-1.5 6-3 8" />
      <path d="M8.5 14.5c-.5 1.5-1.2 3-2.5 4.5" />
    </svg>
  );
}

export default IconFingerprint;
