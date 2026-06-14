import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { StaticProse } from "@/components/static/StaticProse"

const sections = [
  {
    title: "1. What cookies are",
    content: "Small text files your browser stores. We use a minimal set to keep you signed in and remember preferences.",
  },
  {
    title: "2. Essential cookies",
    content: "Session and authentication tokens required to log in and use the app securely.",
  },
  {
    title: "3. Preference cookies",
    content: "Theme choice (light/dark) stored in local storage on your device.",
  },
  {
    title: "4. Analytics",
    content: "We don't run third-party advertising trackers on Evalio today. If analytics are added later, this page will be updated.",
  },
  {
    title: "5. Managing cookies",
    content: "You can clear cookies in browser settings. Disabling essential cookies will prevent login from working.",
  },
]

export function CookiesPage() {
  return (
    <StaticPageLayout>
      <StaticPageHero badge="Legal" title="Cookie Policy" subtitle="Last updated: June 2026." />
      <StaticProse sections={sections} />
    </StaticPageLayout>
  )
}
