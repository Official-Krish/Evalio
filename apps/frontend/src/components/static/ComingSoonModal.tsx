import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Link } from "react-router-dom"

type ComingSoonModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
}

export function ComingSoonModal({
  open,
  onClose,
  title = "Coming soon",
  description = "We're still building this. Check back shortly — or start a practice interview today.",
}: ComingSoonModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md border border-[var(--landing-line)] bg-[var(--landing-bg)] p-8"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--landing-fg-faint)] mb-4">
              Not available yet
            </p>
            <h2 id="coming-soon-title" className="landing-serif text-[28px] leading-[1.15] text-[var(--landing-fg)]">
              {title}
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-[var(--landing-fg-muted)]">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="landing-cta-primary landing-cta-sharp text-[13px]" onClick={onClose}>
                Start interview
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="landing-cta-ghost text-[13px] px-3"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
