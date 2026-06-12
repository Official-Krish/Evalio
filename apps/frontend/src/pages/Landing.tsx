import { useEffect } from "react"
import { Ambient } from "@/components/landing/Ambient"
import { CursorPresence } from "@/components/landing/CursorPresence"
import { AppBar } from "@/components/layout/AppBar"
import { Opening } from "@/components/landing/Opening"
import { Manifesto } from "@/components/landing/Manifesto"
import { Presence } from "@/components/landing/Presence"
import { Method } from "@/components/landing/Method"
import { Voices } from "@/components/landing/Voices"
import { Threshold } from "@/components/landing/Threshold"
import { Footer } from "@/components/Footer"

export function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add("landing-active")
    return () => {
      document.documentElement.classList.remove("landing-active")
    }
  }, [])

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-fg)] selection:bg-[var(--landing-accent-soft)] selection:text-[var(--landing-fg)]">
      <Ambient />
      <CursorPresence />
      <AppBar />
      <main>
        <Opening />
        <Manifesto />
        <Presence />
        <Method />
        <Voices />
        <Threshold />
      </main>
      <Footer />
    </div>
  )
}
