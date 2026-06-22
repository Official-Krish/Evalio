import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth";

const ease = [0.22, 1, 0.36, 1] as const;

export function Opening() {
  const { data: session } = useSession();
  const user = session?.user ?? null;

  return (
    <section className="opening-hero">
      {/* Background orb — sits behind everything */}
      <div className="opening-orb" aria-hidden>
        <div className="landing-orb-inner">
          <img
            src="https://cdn.krishlabs.tech/evalio/public/hero-orb.png"
            alt=""
            aria-hidden
            className="landing-orb-img"
          />
        </div>
      </div>

      {/* Concentric rings — radiating from center, gives depth beyond the orb */}
      <div className="opening-rings" aria-hidden>
        <div className="opening-ring opening-ring-1" />
        <div className="opening-ring opening-ring-2" />
        <div className="opening-ring opening-ring-3" />
      </div>

      {/* Ambient dot grid — subtle texture across the full viewport */}
      <div className="opening-dot-grid" aria-hidden />

      {/* Dual aurora glows — warm gold top-left, cool violet bottom-right */}
      <div className="opening-aurora" aria-hidden />

      {/* Radial vignette to soften edges */}
      <div className="opening-vignette" aria-hidden />

      {/* Scrim for text readability */}
      <div className="opening-scrim" aria-hidden />

      {/* Corner ticks — editorial framing */}
      <div className="opening-corners" aria-hidden>
        <span className="opening-corner opening-corner-tl" />
        <span className="opening-corner opening-corner-tr" />
        <span className="opening-corner opening-corner-bl" />
        <span className="opening-corner opening-corner-br" />
      </div>

      {/* Horizon line — thin accent across center */}
      <div className="opening-horizon" aria-hidden />

      {/* Content */}
      <div className="opening-content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="opening-badge-wrap"
        >
          <span className="opening-badge">
            <span className="opening-badge-dot" />
            <span className="opening-badge-label">Early Access</span>
            <span className="opening-badge-sep" />
            <span className="opening-badge-meta">Limited spots open</span>
          </span>
          <div className="opening-badge-connector" aria-hidden />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="opening-eyebrow"
        >
          ADAPTIVE AI INTERVIEWER • INTERVIEW IDENTITY
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
          className="opening-headline"
        >
          <span className="opening-headline-line">Every interview</span>
          <span className="opening-headline-line opening-headline-italic">
            leaves a <span className="opening-headline-dot">fingerprint.</span>
          </span>
        </motion.h1>

        {/* Description — editorial pull-quote style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease }}
          className="opening-description"
        >
          <div className="opening-desc-rule" aria-hidden />
          <p className="opening-desc-lead">
            Practice realistic AI interviews. Every session updates a living
            profile of how you think, communicate, and make decisions under
            pressure
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease }}
          className="opening-cta-area"
        >
          <Link to={user ? "/dashboard" : "/signup"} className="opening-cta">
            <span className="opening-cta-label">
              {user ? "Go to dashboard" : "Start a session"}
            </span>
            <span className="opening-cta-arrow" aria-hidden>
              →
            </span>
          </Link>

          <div className="opening-assurance">
            <span>No credit card</span>
            <span className="opening-assurance-dot" />
            <span>Free during early access</span>
            <span className="opening-assurance-dot" />
            <span>3 sessions / week</span>
          </div>
        </motion.div>

        {/* Metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease }}
          className="opening-metrics"
        >
          <div className="opening-metric">
            <span className="opening-metric-num">01</span>
            <div className="opening-metric-body">
              <span className="opening-metric-title">How you think</span>
              <span className="opening-metric-desc">
                Structuring ambiguity under pressure
              </span>
            </div>
          </div>
          <div className="opening-metric">
            <span className="opening-metric-num">02</span>
            <div className="opening-metric-body">
              <span className="opening-metric-title">How you communicate</span>
              <span className="opening-metric-desc">
                Clarity, confidence, signal strength
              </span>
            </div>
          </div>
          <div className="opening-metric">
            <span className="opening-metric-num">03</span>
            <div className="opening-metric-body">
              <span className="opening-metric-title">How you decide</span>
              <span className="opening-metric-desc">
                Trade-offs, adaptability, ownership
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
