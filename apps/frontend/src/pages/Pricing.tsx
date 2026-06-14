import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { ComingSoonBlock } from "@/components/static/ComingSoonBlock"
import { usePageTitle } from "@/lib/usePageTitle"

export function PricingPage() {
  usePageTitle("Pricing")
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Pricing"
        title={
          <>
            Free during{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">early access.</span>
          </>
        }
        subtitle="Paid plans aren't live yet. Every feature available today is free — no credit card, no trial countdown."
      />
      <ComingSoonBlock
        title="Plans are coming soon"
        description="We're focused on making interviews feel real before we add billing. When pricing launches, early users will hear first."
        hint="For now, create an account and run as many sessions as you need."
      />
    </StaticPageLayout>
  )
}
