import { useRef, type ReactNode } from "react"
import { motion } from "motion/react"

export function MagneticButton({
  children,
  className,
  as = "button",
  href,
  ...props
}: {
  children: ReactNode
  className?: string
  as?: "button" | "a"
  href?: string
  [key: string]: unknown
}) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null)

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
  }

  function handleLeave() {
    if (!ref.current) return
    ref.current.style.transform = "translate(0, 0)"
  }

  const Tag = as === "a" ? motion.a : motion.button

  return (
    <Tag
      ref={ref}
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </Tag>
  )
}
