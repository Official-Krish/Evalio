import { useEffect, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Ambient } from "@/components/landing/Ambient"
import { OrbitalMark } from "@/components/landing/svg/OrbitalMark"

export function AuthLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("landing-active")
    return () => document.documentElement.classList.remove("landing-active")
  }, [])

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-fg)] relative flex flex-col">
      <Ambient />
      <header className="landing-container flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-2.5 text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] transition-colors">
          <OrbitalMark size={22} />
          <span className="text-[11px] tracking-[0.14em] uppercase">Interview Lab</span>
        </Link>
        <Link to="/" className="text-[13px] text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors">
          Home
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">{children}</main>
    </div>
  )
}
