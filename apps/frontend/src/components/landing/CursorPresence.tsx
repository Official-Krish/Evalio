import { motion, useMotionValue, useSpring } from "motion/react"
import { useEffect } from "react"

export function CursorPresence() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 180, damping: 26 })
  const springY = useSpring(y, { stiffness: 180, damping: 26 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [x, y])

  return (
    <motion.div
      className="landing-cursor-presence pointer-events-none fixed z-[40] hidden md:block"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      aria-hidden
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="var(--landing-accent)" strokeWidth="0.5" opacity="0.12" />
      </svg>
    </motion.div>
  )
}
