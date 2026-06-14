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
              <span className="text-xs tracking-[0.14em] uppercase font-normal">Evalio</span>
            </div>
            <p className="landing-serif text-2xl leading-[1.4] text-[var(--landing-fg-muted)] mb-4">
              Practice until the real one feels familiar.
            </p>
            <a href="https://github.com/Official-Krish" className="text-sm text-[var(--landing-fg-faint)]/60 font-medium">
              Built with <span className="text-[var(--landing-accent)]">&#9829;</span> by <span className="hover:underline">Krish Anand</span>
            </a>
          </div>

          {/* product */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className={linkClass}>Home</Link></li>
              <li><Link to="/pricing" className={linkClass}>Pricing</Link></li>
            </ul>
          </div>

          {/* company */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className={linkClass}>About</Link></li>
              <li><Link to="/blog" className={linkClass}>Blog</Link></li>
              <li><Link to="/careers" className={linkClass}>Careers</Link></li>
            </ul>
          </div>

          {/* support */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/docs" className={linkClass}>Docs</Link></li>
              <li><Link to="/contact" className={linkClass}>Contact</Link></li>
              <li><Link to="/faq" className={linkClass}>FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 pt-8 border-t border-[var(--landing-line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-[var(--landing-fg-faint)]/50 font-medium">
            &copy; {new Date().getFullYear()} Evalio. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[var(--landing-fg-faint)]/50 font-medium">
            <Link to="/privacy" className="hover:text-[var(--landing-fg-muted)] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[var(--landing-fg-muted)] transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-[var(--landing-fg-muted)] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
