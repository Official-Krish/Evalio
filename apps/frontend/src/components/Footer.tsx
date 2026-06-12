import { Link } from "react-router-dom"
import { OrbitalMark } from "./landing/svg/OrbitalMark"

const linkClass = "text-sm text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors duration-300"

export function Footer() {
  return (
    <footer className="border-t border-[var(--landing-line)]">
      <div className="landing-container py-16">
        {/* main grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-12">
          {/* brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-[var(--landing-fg-faint)]">
              <OrbitalMark size={28} />
              <span className="text-xs tracking-[0.14em] uppercase font-normal">AI Interview</span>
            </div>
            <p className="landing-serif text-2xl leading-[1.4] text-[var(--landing-fg-muted)] mb-4">
              Practice until the real one feels familiar.
            </p>
            <p className="text-sm text-[var(--landing-fg-faint)]/60 font-medium">
              Built with <span className="text-[var(--landing-accent)]">&#9829;</span> by Krish Anand
            </p>
          </div>

          {/* product */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className={linkClass}>Home</Link></li>
              <li><Link to="/signup" className={linkClass}>Get started</Link></li>
              <li><Link to="/login" className={linkClass}>Sign in</Link></li>
            </ul>
          </div>

          {/* company */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className={linkClass}>About</a></li>
              <li><a href="#" className={linkClass}>Blog</a></li>
              <li><a href="#" className={linkClass}>Careers</a></li>
            </ul>
          </div>

          {/* support */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className={linkClass}>Docs</a></li>
              <li><a href="#" className={linkClass}>Contact</a></li>
              <li><a href="#" className={linkClass}>FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 pt-8 border-t border-[var(--landing-line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-[var(--landing-fg-faint)]/50 font-medium">
            &copy; {new Date().getFullYear()} AI Interview. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[var(--landing-fg-faint)]/50 font-medium">
            <a href="#" className="hover:text-[var(--landing-fg-muted)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--landing-fg-muted)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--landing-fg-muted)] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
