import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { StaticProse } from "@/components/static/StaticProse"

const sections = [
  {
    title: "1. What we collect",
    content:
      "Account information (name, email, password hash), résumé files you upload, interview audio and transcripts, evaluation scores, and basic usage data needed to run the service.",
  },
  {
    title: "2. How we use your data",
    content:
      "To conduct interviews, generate evaluations, show your history on the dashboard, and improve the product. We do not sell personal data.",
  },
  {
    title: "3. Third-party services",
    content:
      "Interviews and evaluations use Google's Gemini API. Files may be stored using our cloud storage provider. These processors handle data only to operate Interview Lab.",
  },
  {
    title: "4. Retention & deletion",
    content:
      "Data is kept while your account is active. Self-serve account deletion isn't available yet — contact us to request permanent removal of your account and sessions.",
  },
  {
    title: "5. Your rights",
    content:
      "You can ask what we store, request correction, or request deletion. Reach out via GitHub until a dedicated support inbox is live.",
  },
  {
    title: "6. Changes",
    content:
      "We may update this policy as the product matures. Material changes will be noted on this page with an updated date.",
  },
]

export function PrivacyPage() {
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Legal"
        title="Privacy Policy"
        subtitle="Last updated: June 2026. This reflects what Interview Lab does today — not aspirational marketing copy."
      />
      <StaticProse sections={sections} />
    </StaticPageLayout>
  )
}
