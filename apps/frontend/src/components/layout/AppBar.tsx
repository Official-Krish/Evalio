import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useSession, useLogout } from "../../lib/auth"
import { useTheme } from "../../lib/use-theme"
import { OrbitalMark } from "../landing/svg/OrbitalMark"

const navItems = [
  { path: "/dashboard", label: "Interviews" },
  { path: "/dashboard/new", label: "New Interview" },
]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  )
}

export function AppBar() {
  const location = useLocation()
  const { data: session } = useSession()
  const logoutMutation = useLogout()
  const user = session?.user ?? null
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
        <div className="landing-container flex items-center justify-between h-[72px] pointer-events-auto">
          <div className="flex items-center gap-8">
            <Link to={user ? "/dashboard" : "/"} className="group flex items-center gap-2.5 text-[var(--landing-fg)]">
              <OrbitalMark size={22} className="text-[var(--landing-fg-muted)] group-hover:text-[var(--landing-fg)] transition-colors duration-500" />
              <span className="text-[12px] font-medium tracking-[0.12em] uppercase text-[var(--landing-fg-muted)] group-hover:text-[var(--landing-fg)] transition-colors duration-500">
                Interview
              </span>
            </Link>
            {user && (
              <nav className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-1.5 text-[13px] transition-colors duration-300 ${
                        active ? "text-[var(--landing-fg)]" : "text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-5">
            {!user && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-wide text-[var(--landing-fg-faint)]">
                <span className="landing-pulse-dot" aria-hidden />
                <span>Observing</span>
              </div>
            )}
            <ThemeToggle />
            {user ? (
              <div className="hidden sm:flex items-center gap-5">
                <span className="text-[13px] text-[var(--landing-fg-muted)]">{user.name}</span>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="text-[13px] text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg)] transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <nav className="flex items-center gap-5">
                <Link
                  to="/login"
                  className="text-[13px] text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] transition-colors duration-300"
                >
                  Sign in
                </Link>
                <Link to="/signup" className="landing-cta-ghost text-[13px]">
                  Start interview
                </Link>
              </nav>
            )}
            {/* mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-1.5 text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors"
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[72px] inset-x-0 z-40 sm:hidden bg-[var(--landing-bg)] border-b border-[var(--landing-line)]"
          >
            <div className="landing-container py-4 space-y-1">
              {user ? (
                <>
                  <p className="text-[13px] text-[var(--landing-fg-muted)] px-3 pb-2">{user.name}</p>
                  {navItems.map((item) => {
                    const active = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={`block px-3 py-2 text-[13px] transition-colors duration-300 ${
                          active ? "text-[var(--landing-fg)]" : "text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                  <div className="pt-2 mt-2 border-t border-[var(--landing-line)]">
                    <button
                      onClick={() => { logoutMutation.mutate(); setMenuOpen(false) }}
                      className="block w-full text-left px-3 py-2 text-[13px] text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg)] transition-colors duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[13px] text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] transition-colors duration-300">
                    Sign in
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-[13px] text-[var(--landing-fg)] transition-colors duration-300">
                    Start interview
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
