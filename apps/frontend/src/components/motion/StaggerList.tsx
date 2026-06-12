import { motion, type Variants } from "motion/react"
import type { ReactNode } from "react"

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
}

export function StaggerList({
  children,
  className,
  as = "div",
}: {
  children: ReactNode
  className?: string
  as?: "div" | "ul" | "ol"
}) {
  const Tag = motion[as as "div" | "ul" | "ol"] as typeof motion.div
  return (
    <Tag
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </Tag>
  )
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode
  className?: string
  as?: "div" | "li"
}) {
  const Tag = motion[as as "div" | "li"] as typeof motion.div
  return (
    <Tag variants={staggerItem} className={className}>
      {children}
    </Tag>
  )
}
