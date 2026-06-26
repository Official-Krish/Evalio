import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useSession, useLogout } from "../../lib/auth";
import { useTheme } from "../../lib/use-theme";
import { EvalioMark } from "../landing/svg/EvalioMark";
import { ProfileDropdown } from "./ProfileDropdown";
import { ScrollProgress } from "./ScrollProgress";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

const navItems = [
  {
    path: "/dashboard",
    label: "Interviews",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  { path: "/interview/new", label: "New Interview", icon: "M12 4v16m8-8H4" },
  {
    path: "/contact?subject=Pro+upgrade",
    label: "Pro",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
];

export function AppBar() {
  const location = useLocation();
  const { data: session } = useSession();
  const logoutMutation = useLogout();
  const user = session?.user ?? null;
  const isAdmin = user?.role === "ADMIN";
  const visibleNavItems = isAdmin
    ? navItems.filter((item) => item.label !== "Pro")
    : navItems;
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
        <div className="landing-container flex items-center justify-between h-[72px] pointer-events-auto">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="group flex items-center gap-2.5 text-[var(--landing-fg)]"
            >
              <EvalioMark
                size={28}
                className="text-[var(--landing-fg-muted)] group-hover:text-[var(--landing-fg)] transition-colors duration-500"
              />
              <span className="text-[14px] font-medium tracking-[0.12em] text-[var(--landing-fg-muted)] group-hover:text-[var(--landing-fg)] transition-colors duration-500">
                Evalio
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            {!user && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-wide text-[var(--landing-fg-faint)]">
                <span className="landing-pulse-dot" aria-hidden />
                <span>Observing</span>
              </div>
            )}

            {user && (
              <>
                <nav className="hidden sm:flex items-center gap-1">
                  {visibleNavItems.map((item) => {
                    const active =
                      location.pathname === item.path.split("?")[0];
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-3 py-1.5 text-[13px] transition-colors duration-300 relative ${
                          active
                            ? "text-[var(--landing-fg)]"
                            : "text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)]"
                        }`}
                      >
                        {item.label}
                        {active && (
                          <span
                            className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                            style={{ background: "var(--color-accent)" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>
                <div
                  className="hidden sm:block w-px h-4"
                  style={{ background: "var(--color-border)" }}
                />
              </>
            )}

            <div className="flex items-center gap-1">
              <AnimatedThemeToggler
                theme={theme}
                onThemeChange={toggle}
                variant="circle"
                duration={500}
                className="p-1 rounded text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors"
              />
              {user ? (
                <ProfileDropdown user={user} />
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
            </div>
            {/* mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-1.5 text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors"
              aria-label="Menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <ScrollProgress />

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
                  <div className="px-3 pb-3 border-b border-[var(--landing-line)] mb-2">
                    <p className="text-[13px] font-medium text-[var(--landing-fg)]">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[var(--landing-fg-faint)]">
                      {user.email}
                    </p>
                  </div>
                  {[
                    ...visibleNavItems,
                    ...(isAdmin
                      ? []
                      : [
                          {
                            path: "/pricing",
                            label: "Pricing",
                            icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 6v12 M9 9h4a2 2 0 0 1 0 4H9",
                          },
                        ]),
                  ].map((item) => {
                    const active =
                      location.pathname === item.path.split("?")[0];
                    return (
                      <Link
                        key={item.path}
                        to={item.path ?? "#"}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-[13px] transition-colors duration-300 ${
                          active
                            ? "text-[var(--landing-fg)]"
                            : "text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)]"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[var(--landing-fg-faint)] shrink-0"
                        >
                          <path d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="pt-2 mt-2 border-t border-[var(--landing-line)]">
                    <button
                      onClick={() => {
                        logoutMutation.mutate();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-[13px] text-[var(--landing-fg-faint)] hover:text-danger transition-colors duration-300 cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-[13px] text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] transition-colors duration-300"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-[13px] text-[var(--landing-fg)] transition-colors duration-300"
                  >
                    Start interview
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
