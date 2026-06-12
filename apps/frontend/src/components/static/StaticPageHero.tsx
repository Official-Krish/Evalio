import type { ReactNode } from "react"
import { RevealSection } from "@/components/motion/RevealSection"

type StaticPageHeroProps = {
  badge: string
  title: ReactNode
  subtitle?: ReactNode
  align?: "left" | "center"
  className?: string
}

export function StaticPageHero({
  badge,
  title,
  subtitle,
  align = "left",
  className = "",
}: StaticPageHeroProps) {
  return (
    <RevealSection>
      <header
        className={`landing-container pt-28 pb-14 ${align === "center" ? "text-center" : ""} ${className}`}
      >
        <div className={align === "center" ? "max-w-2xl mx-auto" : "max-w-3xl"}>
          <p className="static-badge">{badge}</p>
          <h1 className="static-title mt-5">{title}</h1>
          {subtitle && <div className="static-subtitle mt-4">{subtitle}</div>}
        </div>
      </header>
    </RevealSection>
  )
}
