import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useInViewOnce } from "./hooks";
import { useSession } from "@/lib/auth";

const tiers = [
  {
    id: "free",
    num: "01",
    name: "Free",
    whisper: "Start without friction",
    price: "$0",
    period: "forever",
    story:
      "Three sessions a week. Fifteen minutes each. Enough to find the cracks before the real room does.",
    features: [
      "3 interviews / 7 days",
      "15 min per session",
      "Standard evaluation",
      "Basic scores & feedback",
    ],
    action: { label: "Start free", to: "/signup" },
    accent: false,
    disabled: false,
  },
  {
    id: "pro",
    num: "02",
    name: "Pro",
    whisper: "For serious candidates",
    price: "Early access",
    period: "",
    story:
      "More time, deeper feedback, and every style unlocked. The version that prepares you for the room that doesn't go easy.",
    features: [
      "6 interviews / 7 days",
      "30 min per session",
      "All styles & depths",
      "Detailed evaluation",
      "Resume & GitHub analysis",
      "Priority support",
    ],
    action: {
      label: "Contact for upgrade",
      to: "/contact?subject=Pro+upgrade",
    },
    accent: true,
    disabled: false,
  },
  {
    id: "max",
    num: "03",
    name: "Max",
    whisper: "Everything unlocked",
    price: "Coming soon",
    period: "",
    story:
      "Unlimited sessions. Bar Raiser rounds. Full transcript exports. The complete system for those who refuse to leave anything on the table.",
    features: [
      "Unlimited interviews",
      "60 min per session",
      "Bar Raiser + DSA rounds",
      "Full transcript exports",
      "AI skill-tracking dashboard",
      "Dedicated support",
    ],
    action: { label: "Coming soon", to: "#" },
    accent: false,
    disabled: true,
  },
];

export function LandingPricing() {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.12);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { data: session } = useSession();
  const user = session?.user ?? null;

  return (
    <section
      ref={ref}
      className="landing-container relative py-[16vh] border-b overflow-hidden"
    >
      {/* Ambient glow behind active tier */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            key={activeIndex}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[50%] rounded-full"
              style={{
                background: `radial-gradient(ellipse, rgba(184,168,138,${tiers[activeIndex]?.accent ? 0.1 : 0.05}) 0%, transparent 70%)`,
                filter: "blur(100px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg mb-16"
      >
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)] mb-8">
          <span className="w-8 h-px bg-[var(--landing-line)]" aria-hidden />
          Chapter V · The investment
        </span>
        <h2 className="landing-display text-[clamp(1.85rem,3.8vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)]">
          Free to{" "}
          <span className="landing-serif italic text-[var(--landing-fg-muted)]">
            start.
          </span>
        </h2>
        <p className="mt-5 text-[14px] leading-[1.8] text-[var(--landing-fg-muted)]">
          No credit card needed. Pro is rolling out during early access —
          contact us to unlock more.
        </p>
      </motion.div>

      {/* Tier cards — editorial, horizontal on desktop */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-0">
        {tiers.map((tier, i) => {
          const isActive = activeIndex === i;
          const isDimmed = activeIndex !== null && !isActive;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.1 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              className="group relative cursor-default"
              style={{
                opacity: tier.disabled
                  ? isDimmed
                    ? 0.2
                    : 0.45
                  : isDimmed
                    ? 0.3
                    : 1,
              }}
            >
              {/* Left border separator */}
              {i > 0 && (
                <div className="absolute left-0 top-4 bottom-4 w-px bg-[var(--landing-line)] hidden sm:block" />
              )}

              {/* Pro badge */}
              {tier.accent && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={visible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="absolute top-0 right-6 sm:right-auto sm:left-6 -translate-y-1/2 text-[9px] tracking-[0.12em] uppercase font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: "var(--landing-accent)",
                    color: "#080808",
                  }}
                >
                  Most popular
                </motion.span>
              )}

              <div className="py-8 sm:px-6 lg:px-10">
                {/* Number */}
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="text-[clamp(1.5rem,2.5vw,2rem)] landing-display font-light tabular-nums transition-colors duration-400"
                    style={{
                      color: isActive
                        ? "var(--landing-accent)"
                        : "var(--landing-fg-faint)",
                      opacity: isActive ? 1 : 0.4,
                    }}
                  >
                    {tier.num}
                  </span>
                  {tier.accent && (
                    <div
                      className="flex-1 h-[2px] rounded-full overflow-hidden"
                      style={{ background: "var(--landing-line)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "var(--landing-accent)" }}
                        initial={{ width: 0 }}
                        animate={{ width: isActive ? "100%" : "40%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3
                  className="landing-display text-[clamp(1.1rem,1.8vw,1.3rem)] tracking-tight text-[var(--landing-fg)] mb-1 transition-transform duration-400"
                  style={{
                    transform: isActive ? "translateX(4px)" : "translateX(0)",
                  }}
                >
                  {tier.name}
                </h3>

                {/* Whisper */}
                <p
                  className="landing-serif italic text-[13px] mb-4 transition-opacity duration-400"
                  style={{
                    color: "var(--landing-accent)",
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  {tier.whisper}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span
                    className="landing-display font-medium tracking-tight"
                    style={{
                      fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
                      color: "var(--landing-fg)",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className="ml-2 text-[11px] tracking-[0.08em]"
                      style={{ color: "var(--landing-fg-faint)" }}
                    >
                      / {tier.period}
                    </span>
                  )}
                </div>

                {/* Story — reveals on hover */}
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[13px] leading-[1.75] text-[var(--landing-fg-muted)] overflow-hidden mb-6"
                    >
                      {tier.story}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Features */}
                <ul className="space-y-2 mb-8">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-[12px] transition-colors duration-300"
                      style={{
                        color: isActive
                          ? "var(--landing-fg-muted)"
                          : "var(--landing-fg-faint)",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          d="M2.5 6l2.5 2.5 4.5-5"
                          stroke={
                            tier.accent
                              ? "var(--landing-accent)"
                              : "var(--landing-fg-faint)"
                          }
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {!tier.disabled && !user && tier.id === "free" ? (
                  <Link
                    to={tier.action.to}
                    className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.03em] transition-all duration-300"
                    style={{
                      color: tier.accent
                        ? "var(--landing-accent)"
                        : "var(--landing-fg-muted)",
                      borderBottom: `1px solid ${tier.accent ? "rgba(184,168,138,0.4)" : "var(--landing-line)"}`,
                      paddingBottom: "2px",
                    }}
                  >
                    {tier.action.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7h8M8 4l3 3-3 3" />
                    </svg>
                  </Link>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 text-[12px] tracking-[0.03em]"
                    style={{ color: "var(--landing-fg-faint)", opacity: 1 }}
                  >
                    {(tier.id === "pro" || tier.id === "max") &&
                      tier.action.label}{" "}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <p className="text-[12px] text-[var(--landing-fg-faint)]">
          No credit card required to start. Pro upgrade via direct contact only
          during early access.
        </p>
        <Link
          to="/pricing"
          className="text-[12px] text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg-muted)] transition-colors border-b border-[var(--landing-line)] hover:border-[var(--landing-fg-faint)] pb-px"
        >
          Compare all plans →
        </Link>
      </motion.div>
    </section>
  );
}
