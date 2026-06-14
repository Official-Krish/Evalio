import { Link } from "react-router-dom"
import { useEffect } from "react"
import { IconArrowRight } from "@tabler/icons-react"
import { usePageTitle } from "@/lib/usePageTitle"

export function NotFoundPage() {
  usePageTitle("Page Not Found")
  useEffect(() => {
    document.documentElement.classList.add("landing-active")
    return () => document.documentElement.classList.remove("landing-active")
  }, [])

  return (
    <div className="landing-page min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <p className="text-[120px] font-bold leading-none tracking-[-0.06em] text-[var(--landing-fg-faint)] select-none">
          404
        </p>
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--landing-fg)] mt-4 mb-2">
          Page not found
        </h1>
        <p className="text-[14px] text-[var(--landing-fg-muted)] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[13px] font-medium text-white bg-[var(--landing-accent)] hover:brightness-110 transition-all"
        >
          Back to home
          <IconArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
