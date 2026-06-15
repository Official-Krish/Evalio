import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useInViewOnce } from "./hooks";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 interviews / 7 days",
      "15 min sessions",
      "Standard evaluation",
    ],
    action: { label: "Start free", to: "/signup" },
  },
  {
    name: "Pro",
    price: "Early access",
    period: "",
    features: [
      "6 interviews / 7 days",
      "30 min sessions",
      "Detailed feedback",
      "Priority support",
    ],
    action: { label: "Buy — contact dev", to: "/contact?subject=Pro+upgrade" },
  },
  {
    name: "Max",
    price: "Coming soon",
    period: "",
    features: [
      "Unlimited interviews",
      "60 min sessions",
      "DSA rounds",
      "Everything unlocked",
    ],
    action: { label: "Coming soon", to: "#" },
    disabled: true,
  },
];

export function LandingPricing() {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.15);
  const [buyModal, setBuyModal] = useState<{ tier: string } | null>(null);

  return (
    <>
      <section ref={ref} className="landing-container relative py-[12vh]">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-[0.22em] uppercase text-[var(--landing-fg-faint)] text-center mb-2"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="landing-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] text-[var(--landing-fg)] text-center"
          >
            Free to{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">
              start.
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                style={{
                  padding: "24px 20px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-elevated)",
                  opacity: tier.disabled ? 0.5 : 1,
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {tier.name}
                </h3>
                <div style={{ marginTop: 6, marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--landing-fg)",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        marginLeft: 4,
                      }}
                    >
                      /{tier.period}
                    </span>
                  )}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
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
                          stroke="var(--landing-accent, #b8a88a)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {!tier.disabled ? (
                  <button
                    onClick={() => {
                      if (tier.name === "Pro") {
                        setBuyModal({ tier: "Pro" });
                      } else {
                        window.location.href = tier.action.to;
                      }
                    }}
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: "var(--landing-accent, #b8a88a)",
                      color: "#080808",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {tier.action.label}
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      background: "transparent",
                      color: "var(--color-text-muted)",
                      fontSize: 12,
                      cursor: "default",
                    }}
                  >
                    {tier.action.label}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {buyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBuyModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 400,
                width: "100%",
                padding: "32px 28px",
                borderRadius: "14px",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>🚧</p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {buyModal.tier} tier isn't live yet
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                  margin: "8px 0 20px",
                }}
              >
                Evalio is currently in development. The <strong>Free</strong>{" "}
                tier is active for everyone. Contact us to request a Pro
                upgrade.
              </p>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "center" }}
              >
                <button
                  onClick={() => setBuyModal(null)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    color: "var(--color-text-secondary)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <Link
                  to="/contact?subject=Pro+upgrade"
                  onClick={() => setBuyModal(null)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--landing-accent, #b8a88a)",
                    color: "#080808",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Contact for Pro
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
