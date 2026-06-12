import { RevealSection } from "@/components/motion/RevealSection"

export function StaticProse({
  sections,
}: {
  sections: { title: string; content: string }[]
}) {
  return (
    <div className="landing-container pb-28">
      <div className="max-w-2xl mx-auto space-y-10">
        {sections.map((section) => (
          <RevealSection key={section.title}>
            <section className="static-prose-section">
              <h2 className="text-[15px] font-medium text-[var(--landing-fg)] mb-2">{section.title}</h2>
              <p className="text-[14px] leading-[1.75] text-[var(--landing-fg-muted)]">{section.content}</p>
            </section>
          </RevealSection>
        ))}
      </div>
    </div>
  )
}
