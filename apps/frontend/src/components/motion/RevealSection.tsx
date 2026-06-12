import { motion, type Variants } from "motion/react"
import type { ReactNode } from "react"

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
}

export function RevealSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
