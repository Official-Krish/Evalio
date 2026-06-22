import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";
import { RevealSection } from "@/components/motion/RevealSection";
import { SEO } from "@/components/SEO";

const tiers = [
  {
    id: "free",
    num: "01",
    name: "Free",
    whisper: "Start without friction",
    price: "$0",
    period: "forever",
    description:
      "Three sessions a week. Fifteen minutes each. Enough to find the cracks before the real room does.",
    features: [
      "3 interviews / 7 days",
      "15 min per session",
      "Standard style & depth",
      "Basic evaluation & scores",
      "Email support",
    ],
    missingFeatures: [
      "Resume & GitHub analysis",
      "30–60 min sessions",
      "Detailed evaluation",
      "Bar Raiser rounds",
      "Transcript exports",
    ],
    cta: { label: "Start free — no card needed", to: "/dashboard" },
    accent: false,
  },
  {
    id: "pro",
    num: "02",
    name: "Pro",
    whisper: "For serious candidates",
    price: "Early access",
    period: "",
    description:
      "More time, deeper feedback, every style unlocked. The version for candidates who don't leave the room without knowing exactly where they stood.",
    features: [
      "6 interviews / 7 days",
      "30 min per session",
      "All styles & depths",
      "Detailed evaluation & feedback",
      "Resume & GitHub analysis",
      "Priority support",
    ],
    missingFeatures: [
      "Unlimited interviews",
      "60 min sessions",
      "Bar Raiser + DSA rounds",
      "Transcript exports",
      "Skill-tracking dashboard",
    ],
    cta: {
      label: "Contact for Pro upgrade",
      to: "/contact?subject=Pro+upgrade",
    },
    accent: true,
  },
  {
    id: "max",
    num: "03",
    name: "Max",
    whisper: "Everything, unlocked",
    price: "Coming soon",
    period: "",
    description:
      "Unlimited sessions. Bar Raiser rounds. Transcript exports. The complete system for those who refuse to leave anything on the table.",
    features: [
      "Unlimited interviews",
      "60 min per session",
      "Bar Raiser + DSA rounds",
      "Full transcript exports",
      "AI skill-tracking dashboard",
      "Dedicated support",
    ],
    missingFeatures: [],
    cta: {
      label: "Notify me when available",
      to: "/contact?subject=Max+waitlist",
    },
    accent: false,
    disabled: true,
  },
];

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free tier is genuinely free, forever. You can start practicing immediately after signup with no payment details required.",
  },
  {
    q: "What does 'Early access' mean for Pro?",
    a: "Evalio is currently in active development. The Pro tier is available by request — contact us directly and we'll upgrade your account manually.",
  },
  {
    q: "How do the interview styles differ?",
    a: "Evalio offers four temperaments: Supportive, Professional, Challenging, and Bar Raiser. Free users get standard depth. Pro unlocks all four plus adjustable depth settings.",
  },
  {
    q: "What is resume & GitHub analysis?",
    a: "Pro users can upload their resume and optionally link their GitHub. The AI uses these to ask targeted questions about your specific experience and projects.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Once paid tiers launch publicly, switching will be instant. During early access, upgrades are handled manually — just reach out.",
  },
  {
    q: "Is my data private?",
    a: "Interview transcripts are stored securely and only accessible to you. We never share individual session data. See our privacy policy for full details.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left py-5 border-b border-[var(--landing-line)] group"
    >
      <div className="flex items-start justify-between gap-6">
        <span
          className="text-[14px] font-medium leading-[1.5] transition-colors duration-300"
          style={{
            color: open ? "var(--landing-fg)" : "var(--landing-fg-muted)",
          }}
        >
          {q}
        </span>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: open ? 135 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "var(--landing-fg-faint)" }}
        >
          <path d="M7 2v10M2 7h10" />
        </motion.svg>
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[13px] leading-[1.8] overflow-hidden pt-3"
            style={{ color: "var(--landing-fg-faint)" }}
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  );
}

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<string>("free");

  const activeTier = tiers.find((t) => t.id === activeTab) ?? tiers[0]!;

  return (
    <StaticPageLayout>
      <SEO
        title="Pricing"
        description="Transparent pricing for interview practice. Free tier included."
      />
      {/* ── Hero ── */}
      <RevealSection>
        <header className="landing-container pt-18 pb-10">
          <div className="max-w-3xl">
            <p className="static-badge">Pricing</p>
            <h1 className="static-title mt-5">
              Free to{" "}
              <span className="landing-serif italic text-[var(--landing-fg-muted)]">
                start.
              </span>
            </h1>
            <p className="static-subtitle mt-4">
              No credit card needed. Pro is rolling out during early access —
              contact us for an upgrade. Max is coming soon.
            </p>
          </div>
        </header>
      </RevealSection>

      {/* ── Tier Selector (mobile-first tabs) ── */}
      <RevealSection>
        <section className="landing-container pb-10">
          {/* Tab navigation */}
          <div className="flex items-center gap-0 border border-[var(--landing-line)] rounded-sm overflow-hidden w-full max-w-sm mb-10">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTab(tier.id)}
                className="flex-1 py-2.5 text-[11px] font-medium tracking-[0.06em] uppercase transition-all duration-250 cursor-pointer"
                style={{
                  background:
                    activeTab === tier.id ? "var(--landing-fg)" : "transparent",
                  color:
                    activeTab === tier.id
                      ? "var(--landing-bg)"
                      : "var(--landing-fg-faint)",
                }}
              >
                {tier.name}
              </button>
            ))}
          </div>

          {/* Active tier detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 gap-10 md:gap-20 lg:gap-32 items-start"
            >
              {/* Left — copy */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="landing-display font-light text-[2rem] tabular-nums"
                    style={{ color: "var(--landing-fg-faint)", opacity: 0.4 }}
                  >
                    {activeTier.num}
                  </span>
                  {activeTier.accent && (
                    <span
                      className="text-[9px] tracking-[0.12em] uppercase font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: "var(--landing-accent)",
                        color: "#080808",
                      }}
                    >
                      Most popular
                    </span>
                  )}
                  {activeTier.disabled && (
                    <span
                      className="text-[9px] tracking-[0.12em] uppercase font-medium px-3 py-1 rounded-full border border-[var(--landing-line)]"
                      style={{ color: "var(--landing-fg-faint)" }}
                    >
                      Coming soon
                    </span>
                  )}
                </div>

                <h2
                  className="landing-display text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.08] tracking-[-0.03em] mb-1"
                  style={{ color: "var(--landing-fg)" }}
                >
                  {activeTier.name}
                </h2>
                <p
                  className="landing-serif italic text-[14px] mb-5"
                  style={{ color: "var(--landing-accent)" }}
                >
                  {activeTier.whisper}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span
                    className="landing-display font-medium tracking-tight"
                    style={{
                      fontSize: "clamp(2rem, 4vw, 2.75rem)",
                      color: "var(--landing-fg)",
                    }}
                  >
                    {activeTier.price}
                  </span>
                  {activeTier.period && (
                    <span
                      className="text-[12px] tracking-[0.06em]"
                      style={{ color: "var(--landing-fg-faint)" }}
                    >
                      / {activeTier.period}
                    </span>
                  )}
                </div>

                <p
                  className="text-[14px] leading-[1.8] mb-8"
                  style={{ color: "var(--landing-fg-muted)" }}
                >
                  {activeTier.description}
                </p>

                {/* CTA */}
                {!activeTier.disabled ? (
                  <Link
                    to={activeTier.cta.to}
                    className="landing-cta-primary landing-cta-sharp inline-flex items-center gap-2"
                    style={
                      activeTier.accent
                        ? {
                            background: "var(--landing-accent)",
                            color: "#080808",
                          }
                        : {}
                    }
                  >
                    {activeTier.cta.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7h8M8 4l3 3-3 3" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    to={activeTier.cta.to}
                    className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-3 rounded-md border border-[var(--landing-line)] transition-colors duration-200 hover:border-[var(--landing-fg-faint)]"
                    style={{ color: "var(--landing-fg-muted)" }}
                  >
                    {activeTier.cta.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7h8M8 4l3 3-3 3" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Right — features */}
              <div>
                {/* Included */}
                <p
                  className="text-[10px] tracking-[0.18em] uppercase mb-4"
                  style={{ color: "var(--landing-fg-faint)" }}
                >
                  What&rsquo;s included
                </p>
                <ul className="space-y-3 mb-8">
                  {activeTier.features.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.04, duration: 0.3 }}
                      className="flex items-center gap-3 text-[13px]"
                      style={{ color: "var(--landing-fg-muted)" }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          d="M2.5 6l2.5 2.5 4.5-5"
                          stroke={
                            activeTier.accent
                              ? "var(--landing-accent)"
                              : "var(--landing-fg-faint)"
                          }
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </motion.li>
                  ))}
                </ul>

                {/* Not included */}
                {activeTier.missingFeatures.length > 0 && (
                  <>
                    <p
                      className="text-[10px] tracking-[0.18em] uppercase mb-4"
                      style={{ color: "var(--landing-fg-faint)", opacity: 0.5 }}
                    >
                      Not included
                    </p>
                    <ul className="space-y-3">
                      {activeTier.missingFeatures.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 text-[13px]"
                          style={{
                            color: "var(--landing-fg-faint)",
                            opacity: 0.35,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            style={{ flexShrink: 0 }}
                          >
                            <path
                              d="M3 9l6-6M9 9L3 3"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </RevealSection>

      {/* ── Comparison Table (desktop) ── */}
      <RevealSection>
        <section className="landing-container pb-24">
          <div className="border-t border-[var(--landing-line)] pt-16">
            <p
              className="text-[10px] tracking-[0.18em] uppercase mb-10"
              style={{ color: "var(--landing-fg-faint)" }}
            >
              Compare plans
            </p>

            <div className="overflow-x-auto">
              <table
                className="w-full"
                style={{ borderCollapse: "separate", borderSpacing: 0 }}
              >
                <thead>
                  <tr>
                    <th className="pb-6 text-left w-1/2">
                      <span
                        className="text-[11px] tracking-[0.08em] uppercase"
                        style={{ color: "var(--landing-fg-faint)" }}
                      >
                        Feature
                      </span>
                    </th>
                    {tiers.map((t) => (
                      <th key={t.id} className="pb-6 text-center w-1/6">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="text-[13px] font-medium"
                            style={{
                              color: t.accent
                                ? "var(--landing-accent)"
                                : "var(--landing-fg-muted)",
                            }}
                          >
                            {t.name}
                          </span>
                          <span
                            className="text-[11px]"
                            style={{ color: "var(--landing-fg-faint)" }}
                          >
                            {t.price}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Interviews / 7 days", values: ["3", "6", "∞"] },
                    {
                      label: "Session length",
                      values: ["15 min", "30 min", "60 min"],
                    },
                    {
                      label: "Interview styles",
                      values: ["Standard", "All 4", "All 4"],
                    },
                    {
                      label: "Evaluation depth",
                      values: ["Basic", "Detailed", "Detailed"],
                    },
                    { label: "Resume analysis", values: [false, true, true] },
                    { label: "GitHub analysis", values: [false, true, true] },
                    {
                      label: "Bar Raiser rounds",
                      values: [false, false, true],
                    },
                    { label: "DSA rounds", values: [false, false, true] },
                    {
                      label: "Transcript exports",
                      values: [false, false, true],
                    },
                    {
                      label: "Skill-tracking dashboard",
                      values: [false, false, true],
                    },
                    { label: "Priority support", values: [false, true, true] },
                  ].map((row) => (
                    <tr
                      key={row.label}
                      style={{ borderTop: "1px solid var(--landing-line)" }}
                    >
                      <td
                        className="py-3.5 text-[13px]"
                        style={{ color: "var(--landing-fg-muted)" }}
                      >
                        {row.label}
                      </td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className="py-3.5 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                className="mx-auto"
                              >
                                <path
                                  d="M3 7l3 3 5-6"
                                  stroke={
                                    tiers[vi]?.accent
                                      ? "var(--landing-accent)"
                                      : "var(--landing-fg-muted)"
                                  }
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <span
                                className="text-[10px] inline-block w-3 h-px"
                                style={{
                                  background: "var(--landing-line)",
                                  verticalAlign: "middle",
                                }}
                              />
                            )
                          ) : (
                            <span
                              className="text-[12px]"
                              style={{
                                color: tiers[vi]?.accent
                                  ? "var(--landing-accent)"
                                  : "var(--landing-fg-faint)",
                              }}
                            >
                              {val}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── FAQ ── */}
      <RevealSection>
        <section className="landing-container pb-32">
          <div className="max-w-2xl mx-auto">
            <p className="static-badge mb-6">Common questions</p>
            <div>
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-[var(--landing-line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p
                className="text-[13px]"
                style={{ color: "var(--landing-fg-muted)" }}
              >
                Still have questions?
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors duration-200"
                style={{ color: "var(--landing-fg-muted)" }}
              >
                Reach us directly
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h8M8 4l3 3-3 3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>
    </StaticPageLayout>
  );
}
