import { useScroll, useTransform, motion } from "motion/react"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      className="fixed top-[72px] left-0 right-0 h-[1px] z-50 pointer-events-none"
      style={{
        scaleX,
        transformOrigin: "left",
        background: "linear-gradient(90deg, rgba(184,168,138,0.6), rgba(184,168,138,0.2))",
      }}
    />
  )
}
