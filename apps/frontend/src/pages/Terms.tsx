import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { StaticProse } from "@/components/static/StaticProse"
import { usePageTitle } from "@/lib/usePageTitle"

const sections = [
  {
    title: "1. Acceptance",
    content: "By using Evalio you agree to these terms. If you disagree, don't use the service.",
  },
  {
    title: "2. Your account",
    content: "You're responsible for your credentials and activity under your account. Keep your password secure.",
  },
  {
    title: "3. Acceptable use",
    content:
      "Don't abuse the platform — including attempts to bypass evaluations, automate sessions in bad faith, or upload unlawful content.",
  },
  {
    title: "4. Your content",
    content:
      "You own your interview sessions and evaluations. Evalio owns the platform software, design, and branding.",
  },
  {
    title: "5. Availability",
    content:
      "We're in active development. Features may change, break briefly, or be removed as we iterate. There is no SLA during early access.",
  },
  {
    title: "6. Disclaimer",
    content:
      "Evalio is provided as-is. Practice results don't guarantee hiring outcomes. We're not liable for decisions you make based on AI feedback.",
  },
  {
    title: "7. Contact",
    content: "Questions? Reach out via GitHub until formal support channels are listed on the contact page.",
  },
]

export function TermsPage() {
  usePageTitle("Terms of Service")
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Legal"
        title="Terms of Service"
        subtitle="Last updated: June 2026."
      />
      <StaticProse sections={sections} />
    </StaticPageLayout>
  )
}
