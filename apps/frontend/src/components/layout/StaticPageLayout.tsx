import { useEffect } from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { Ambient } from "@/components/landing/Ambient"
import { AppBar } from "./AppBar"
import { Footer } from "../Footer"

export function StaticPageLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("landing-active")
    return () => document.documentElement.classList.remove("landing-active")
  }, [])

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 20 })

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-fg)] selection:bg-[var(--landing-accent-soft)] selection:text-[var(--landing-fg)] relative">
      <Ambient />
      <motion.div
        className="fixed top-0 left-0 right-0 h-px bg-[var(--landing-accent)] origin-left z-[100]"
        style={{ scaleX, opacity: 0.5 }}
        aria-hidden
      />
      <AppBar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
