import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { ComingSoonBlock } from "@/components/static/ComingSoonBlock"

export function BlogPage() {
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Blog"
        title="Thoughts on interviewing."
        subtitle="Essays on practice, feedback, and building Interview Lab — publishing soon."
      />
      <ComingSoonBlock
        title="No posts yet"
        description="We're writing behind the scenes. The blog will cover interview science, product updates, and engineering notes — without filler."
      />
    </StaticPageLayout>
  )
}
