import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { InterviewSystem } from "./InterviewSystem";
import { useSession } from "@/lib/auth";

const PILLARS = [
  "Remembers every answer you gave.",
  "Tracks how you've changed.",
  "Builds your interview identity.",
];

export function Opening() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  return (
    <section className="landing-hero relative flex flex-col justify-center overflow-hidden border-b">
      {/* Full-bleed ambient constellation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Horizontal scan ghost */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--landing-accent) 40%, transparent)",
          }}
          initial={{ top: "110%", opacity: 0 }}
          animate={{ top: ["110%", "-10%"], opacity: [0, 0.06, 0] }}
          transition={{
            duration: 7,
            delay: 1.5,
            repeat: Infinity,
            repeatDelay: 12,
            ease: "linear",
          }}
        />
      </div>

      <div className="landing-hero-grid py-8 lg:mt-26 md:mt-46 sm:mt-34 max-sm:mt-[72px]">
        {/* Copy — 65% */}
        <div className="relative z-10 landing-hero-copy">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 lg:mb-8"
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

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="landing-hero-headline pb-4"
          >
            <span className="landing-hero-lead block">The interviewer</span>
            <motion.span className="landing-hero-drama landing-serif italic block">
              that
              <br />
              remembers.
            </motion.span>
          </motion.h1>

          {/* Sub-statement */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-4 text-[15px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-[440px]"
          >
            Practice is temporary.{" "}
            <span className="text-[var(--landing-fg)]">
              Identity is persistent.
            </span>
          </motion.p>

          {/* Pillars */}
          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.48,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="landing-punch-lines mt-8 lg:mt-10"
          >
            {PILLARS.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55 + i * 0.1 }}
              >
                {line}
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="landing-cta-primary landing-cta-sharp group relative overflow-hidden"
            >
              <span className="relative z-10">
                {user ? "Go to dashboard" : "Start Interviewing"}
              </span>
              {/* Shimmer sweep */}
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
            <div className="flex flex-col gap-1">
              <span className="landing-early-access-note">
                No credit card required
              </span>
              <span className="landing-early-access-note">
                Free during early access · 3 sessions/week
              </span>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-8 flex items-center gap-3"
          >
            {/* Session counter dots */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3 + i * 0.12, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.08 }}
                />
              ))}
            </div>
            <span className="text-[12px] text-[var(--landing-fg-faint)]">
              AI calibrated to real interviewers at every stage
            </span>
          </motion.div>
        </div>

        {/* Interview system — 35% */}
        <div className="landing-hero-stage">
          <InterviewSystem />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--landing-fg-faint)]"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
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
