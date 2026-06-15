import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { RevealSection } from "@/components/motion/RevealSection"
import { usePageTitle } from "@/lib/usePageTitle"

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with AI-powered interview practice.",
    features: [
      "3 interviews per 7 days",
      "15 min per session",
      "Standard style & depth",
      "Basic evaluation & scores",
      "Email support",
    ],
    cta: { label: "Get started", to: "/signup" },
    accent: false,
  },
  {
    name: "Pro",
    price: "—",
    period: "early access",
    description: "For serious candidates who want to go deeper.",
    features: [
      "6 interviews per 7 days",
      "30 min per session",
      "All styles & depths",
      "Detailed evaluation & feedback",
      "Resume & GitHub analysis",
      "Priority support",
    ],
    cta: { label: "Contact for upgrade", to: "/contact?subject=Pro+upgrade" },
    accent: true,
  },
  {
    name: "Max",
    price: "—",
    period: "coming soon",
    description: "Everything unlocked. Unlimited practice, maximum depth.",
    features: [
      "Unlimited interviews",
      "60 min per session",
      "Bar Raiser + DSA rounds",
      "Full transcript exports",
      "AI skill-tracking dashboard",
      "Dedicated support",
    ],
    cta: { label: "Coming soon", to: "#" },
    accent: false,
    disabled: true,
  },
]

export function PricingPage() {
  usePageTitle("Pricing")
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Pricing"
        title={
          <>
            Free to{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">start.</span>
          </>
        }
        subtitle="No credit card needed. Pro is rolling out during early access — contact us for an upgrade."
      />

      <RevealSection>
        <section className="landing-container pb-28">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  padding: "28px 24px",
                  borderRadius: "14px",
                  border: tier.accent
                    ? "1px solid var(--landing-accent, #b8a88a)"
                    : "1px solid var(--color-border)",
                  background: tier.accent
                    ? "rgba(184,168,138,0.04)"
                    : "var(--color-bg-elevated)",
                  position: "relative",
                  opacity: tier.disabled ? 0.55 : 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {tier.accent && (
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "3px 14px",
                      borderRadius: "20px",
                      background: "var(--landing-accent, #b8a88a)",
                      color: "#080808",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Most popular
                  </span>
                )}
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "var(--color-text)",
                      margin: 0,
                    }}
                  >
                    {tier.name}
                  </h2>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {tier.price}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        marginLeft: 6,
                      }}
                    >
                      / {tier.period}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                      margin: "8px 0 0",
                    }}
                  >
                    {tier.description}
                  </p>
                </div>

                <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M2.5 6l2.5 2.5 4.5-5" stroke={tier.accent ? "var(--landing-accent, #b8a88a)" : "var(--color-text-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {!tier.disabled ? (
                  <Link
                    to={tier.cta.to}
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 24,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      border: "none",
                      background: tier.accent
                        ? "var(--landing-accent, #b8a88a)"
                        : "var(--color-text, #eceae6)",
                      color: tier.accent
                        ? "#080808"
                        : "var(--color-bg, #080808)",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {tier.cta.label}
                  </Link>
                ) : (
                  <button
                    disabled
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "center",
                      marginTop: 24,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "transparent",
                      color: "var(--color-text-muted)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "default",
                    }}
                  >
                    {tier.cta.label}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </RevealSection>
    </StaticPageLayout>
  )
}
