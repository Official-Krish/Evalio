import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

type FAQItem = { q: string; a: string }

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-[var(--landing-line)] bg-[var(--landing-surface)] overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex items-center justify-between w-full px-4 py-3.5 text-left text-[13px] font-medium text-[var(--landing-fg)] transition-colors hover:bg-[var(--landing-surface-hover)]"
          >
            {item.q}
            <motion.svg
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 shrink-0 text-[var(--landing-fg-muted)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-4 text-sm text-[var(--landing-fg-muted)] leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
