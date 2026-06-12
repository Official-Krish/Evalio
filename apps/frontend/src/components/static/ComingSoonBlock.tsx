import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { RevealSection } from "@/components/motion/RevealSection"

type ComingSoonBlockProps = {
  title: string
  description: string
  hint?: ReactNode
}

export function ComingSoonBlock({ title, description, hint }: ComingSoonBlockProps) {
  return (
    <RevealSection>
      <div className="landing-container pb-28">
        <div className="static-coming-soon max-w-xl">
          <div className="static-coming-soon-inner">
            <span className="landing-pulse-dot" aria-hidden />
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--landing-fg-faint)] mt-4">
              In development
            </p>
            <h2 className="landing-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] text-[var(--landing-fg)] mt-3">
              {title}
            </h2>
            <p className="mt-4 text-[14px] leading-[1.75] text-[var(--landing-fg-muted)]">{description}</p>
            {hint && (
              <p className="mt-3 text-[13px] text-[var(--landing-fg-faint)]">{hint}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="landing-cta-primary landing-cta-sharp text-[13px]">
                Start interview
              </Link>
              <Link to="/" className="landing-cta-ghost text-[13px]">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}
