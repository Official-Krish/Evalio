import { motion } from "motion/react"

export function DimensionOrb({
  label,
  tagline,
  index = 0,
  className = "",
}: {
  label: string
  tagline: string
  index?: number
  className?: string
}) {
  return (
    <motion.div
      className={`flex flex-col items-center text-center ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3
          backdrop-blur-xl border border-white/[0.05]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
          bg-white/[0.02]"
        style={{
          animation: `landing-orb-pulse 3s ${index * 0.5}s ease-in-out infinite`,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="10" className="stroke-[var(--landing-fg-muted)]" strokeWidth="0.5" opacity="0.3" />
          <circle cx="11" cy="11" r="4" className="fill-[var(--landing-accent)]" opacity="0.5" />
          <circle cx="11" cy="11" r="1.5" className="fill-[var(--landing-fg)]" opacity="0.3" />
        </svg>
      </div>
      <span className="text-[10px] tracking-[0.12em] uppercase text-[var(--landing-fg)] font-medium mb-1">
        {label}
      </span>
      <span className="text-[11px] leading-[1.4] text-[var(--landing-fg-muted)] max-w-[120px]">
        {tagline}
      </span>
    </motion.div>
  )
}
