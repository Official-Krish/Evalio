import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth";
import { IconHistory } from "./svg/IconHistory";
import { IconTrendingUp } from "./svg/IconTrendingUp";
import { IconFingerprint } from "./svg/IconFingerprint";

const FEATURES = [
  {
    icon: IconHistory,
    text: "How you think",
    desc: "See how you structure ambiguity and reason under pressure",
  },
  {
    icon: IconTrendingUp,
    text: "How you communicate",
    desc: "Understand your clarity, confidence, and signal strength",
  },
  {
    icon: IconFingerprint,
    text: "How you decide",
    desc: "Reveal how you adapt, make trade-offs, and take ownership",
  },
];

export function Opening() {
  const { data: session } = useSession();
  const user = session?.user ?? null;

  return (
    <section className="landing-hero relative flex min-h-svh flex-col items-center overflow-hidden border-b">
      <div className="landing-orb-container pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="landing-orb-inner">
          <img
            src="https://cdn.krishlabs.tech/evalio/public/hero-orb.png"
            alt=""
            aria-hidden
            className="landing-orb-img"
          />
        </div>
      </div>

      {/* Vignette — pulls the glow back in well before the viewport edge */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, transparent 0%, transparent 18%, var(--landing-bg) 54%)",
        }}
      />

      {/* Text scrim — ensures readability over the orb's bright core */}
      <div className="hero-text-scrim pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[70vh] w-[90vw] max-w-[840px] -translate-x-1/2 -translate-y-1/2" />

      {/* Content */}
      <div className="landing-hero-content relative z-10 flex w-full flex-col items-center px-5 text-center sm:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="landing-early-access-badge">
            <span className="landing-early-access-dot" />
            <span className="landing-early-access-label">Early Access</span>
            <span className="landing-early-access-divider" />
            <span className="landing-early-access-slots">
              Limited spots open
            </span>
          </span>
        </motion.div>

        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-eyebrow"
        >
          Interview identity
        </motion.p>

        {/* Hero statement */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-drama landing-serif"
        >
          The profile you can&apos;t fake.
        </motion.h1>

        {/* Subhead — concrete mechanism, below the blob's brightest zone */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-subhead"
        >
          <span>Scripts fall apart under follow-up.</span>
          <span>
            Evalio learns how you really think and the profile only gets sharper
            with time.
          </span>
        </motion.p>

        {/* Feature row — 3 columns with icons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-features"
        >
          {FEATURES.map(({ icon: Icon, text, desc }, i) => (
            <div
              key={text}
              className="landing-hero-feature"
              data-last={i === FEATURES.length - 1 ? "true" : undefined}
            >
              <span className="landing-hero-feature-icon" aria-hidden="true">
                <Icon size={19} strokeWidth={1.4} />
              </span>
              <p className="landing-hero-feature-title">{text}</p>
              <p className="landing-hero-feature-description">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-action"
        >
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="landing-cta-primary landing-cta-sharp landing-hero-cta group relative overflow-hidden"
          >
            <span className="relative z-10">
              {user ? "Go to dashboard" : "Start Interviewing"}
            </span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.6 }}
              aria-hidden
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 7h8M8 4l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <p className="landing-hero-assurance">
            No credit card <span aria-hidden="true">·</span> Free during early
            access <span aria-hidden="true">·</span> 3 sessions/week
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="landing-hero-scroll"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden>
          <rect
            x="4.5"
            y="2"
            width="3"
            height="6"
            rx="1.5"
            fill="currentColor"
            opacity="0.4"
          >
            <animate
              attributeName="y"
              values="2;6;2"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.8;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="1"
            y="1"
            width="10"
            height="18"
            rx="5"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.25"
          />
        </svg>
      </motion.div>
    </section>
  );
}
