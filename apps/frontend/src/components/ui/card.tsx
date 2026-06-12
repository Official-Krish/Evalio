import { motion } from "motion/react"
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-[var(--radius-lg)] p-5 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm ${hover ? "hover:border-accent/30 hover:shadow-md hover:shadow-accent/5 transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </motion.div>
  )
}
