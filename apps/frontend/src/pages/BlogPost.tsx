import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { ComingSoonBlock } from "@/components/static/ComingSoonBlock"
import { StaticPageHero } from "@/components/static/StaticPageHero"

export function BlogPostPage() {
  return (
    <StaticPageLayout>
      <StaticPageHero badge="Blog" title="This post isn't published yet." />
      <ComingSoonBlock
        title="Coming soon"
        description="We're still drafting. Check the blog index for updates when articles go live."
      />
    </StaticPageLayout>
  )
}
