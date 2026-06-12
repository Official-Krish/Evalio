import { type InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-150 ${error ? "border-danger focus:ring-danger/30 focus:border-danger" : ""} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger mt-0.5">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
