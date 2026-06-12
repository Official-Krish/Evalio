/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "motion/react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variantStyles: Record<string, string> = {
  primary: "bg-accent text-white hover:brightness-110 shadow-lg shadow-accent/20",
  secondary:
    "bg-[var(--color-bg-card)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]",
  danger:
    "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
}

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */
