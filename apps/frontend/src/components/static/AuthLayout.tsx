import { useEffect, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Ambient } from "@/components/landing/Ambient"
import { EvalioMark } from "@/components/landing/svg/EvalioMark"
import { ConfidenceOrb } from "@/components/landing/svg/ConfidenceOrb"
import { AuthAside } from "./AuthAside"

type AuthLayoutProps = {
  children: ReactNode
  variant: "login" | "signup"
}

export function AuthLayout({ children, variant }: AuthLayoutProps) {
  useEffect(() => {
    document.documentElement.classList.add("landing-active")
    return () => document.documentElement.classList.remove("landing-active")
  }, [])

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-fg)] relative flex flex-col">
      <Ambient />
      <header className="landing-container flex items-center justify-between h-[72px] shrink-0">
        <Link to="/" className="flex items-center gap-2.5 text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] transition-colors">
          <EvalioMark size={22} />
          <span className="text-[11px] tracking-[0.14em] uppercase">Evalio</span>
        </Link>
        <Link to="/" className="text-[13px] text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors">
          Home
        </Link>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="lg:hidden landing-container pb-6">
          <div className="flex items-center gap-4 border border-[var(--landing-line)] bg-[var(--landing-surface)] px-4 py-3">
            <ConfidenceOrb score={variant === "login" ? 68 : 42} listening size={52} className="shrink-0 text-[var(--landing-fg-faint)]" />
            <p className="text-[12px] leading-[1.6] text-[var(--landing-fg-muted)]">
              {variant === "login"
                ? "Your session history and feedback are waiting."
                : "First session takes twelve minutes. No card needed."}
            </p>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <AuthAside variant={variant} />
          <main className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 pb-16 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
