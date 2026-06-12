import { motion } from "motion/react"
import { useCursorSoft } from "./hooks"

export function Ambient() {
  const { x, y } = useCursorSoft(0.025)

  return (
    <div className="landing-ambient pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="landing-grain absolute inset-0" />
      <motion.div
        style={{ x, y }}
        className="absolute top-[18%] right-[12%] w-[min(42vw,520px)] h-[min(42vw,520px)] rounded-full opacity-[0.035]"
      >
        <div className="w-full h-full rounded-full bg-[var(--landing-fg)] blur-[100px]" />
      </motion.div>
      <div className="absolute left-[6%] top-[42%] w-px h-[28vh] bg-gradient-to-b from-transparent via-[var(--landing-line)] to-transparent opacity-60" />
    </div>
  )
}
