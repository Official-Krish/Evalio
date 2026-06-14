import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { ComingSoonBlock } from "@/components/static/ComingSoonBlock"
import { usePageTitle } from "@/lib/usePageTitle"

export function CareersPage() {
  usePageTitle("Careers")
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Careers"
        title={
          <>
            Small team.{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">Big craft.</span>
          </>
        }
        subtitle="Evalio is early. We're not hiring on a job board yet — but we're always open to exceptional people."
      />
      <ComingSoonBlock
        title="Open roles coming soon"
        description="When we're ready to grow the team, roles will be listed here. Until then, reach out via GitHub if you want to build with us."
        hint={
          <>
            <a
              href="https://github.com/Official-Krish"
              className="text-[var(--landing-accent)] underline underline-offset-2 hover:no-underline"
              target="_blank"
              rel="noreferrer"
            >
              github.com/Official-Krish
            </a>
          </>
        }
      />
    </StaticPageLayout>
  )
}
