import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { RevealSection } from "@/components/motion/RevealSection"

const values = [
  {
    title: "Radical honesty",
    desc: "Feedback should reflect what you actually sounded like — not what flatters you into staying.",
  },
  {
    title: "Practice over theory",
    desc: "Watching interview tips doesn't build muscle memory. Speaking under pressure does.",
  },
  {
    title: "Privacy by design",
    desc: "Your sessions are yours. We don't sell interview data or use it to train third-party models.",
  },
]

const facts = [
  { label: "Interviewers", value: "6 role-specific personas" },
  { label: "Format", value: "Live voice in the browser" },
  { label: "Evaluation", value: "Communication, technical, problem-solving scores" },
  { label: "Stack", value: "Gemini for conversation & evaluation" },
]

export function AboutPage() {
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="About"
        title={
          <>
            The best interview is one{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">you've already done.</span>
          </>
        }
        subtitle="Evalio is a voice practice environment that reads your résumé, runs a real conversation, and scores how you performed — so the actual interview feels familiar."
      />

      <RevealSection>
        <section className="landing-container pb-16">
          <div className="max-w-3xl grid sm:grid-cols-2 gap-px bg-[var(--landing-line)] border border-[var(--landing-line)]">
            {facts.map((f) => (
              <div key={f.label} className="bg-[var(--landing-bg)] p-5">
                <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)]">{f.label}</p>
                <p className="mt-1.5 text-[14px] text-[var(--landing-fg)]">{f.value}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="landing-container pb-16">
          <div className="max-w-3xl">
            <h2 className="static-title text-[1.75rem] mb-8">What we stand for</h2>
            <div className="space-y-px border border-[var(--landing-line)]">
              {values.map((v) => (
                <div key={v.title} className="static-card !border-0 !border-b border-[var(--landing-line)] last:border-b-0">
                  <h3 className="static-card-title">{v.title}</h3>
                  <p className="static-card-body">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="landing-container pb-28">
          <div className="max-w-3xl static-card">
            <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)] mb-3">Built by</p>
            <p className="landing-serif text-[22px] text-[var(--landing-fg)]">Krish Anand</p>
            <p className="mt-3 text-[14px] leading-[1.75] text-[var(--landing-fg-muted)]">
              Evalio started as a prototype to fix a simple gap: most prep tools don't feel like being interviewed.
              It's still early — features ship weekly, and feedback from real sessions shapes the roadmap.
            </p>
            <a
              href="https://github.com/Official-Krish"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-5 text-[13px] text-[var(--landing-accent)] underline underline-offset-2 hover:no-underline"
            >
              github.com/Official-Krish
            </a>
          </div>
        </section>
      </RevealSection>
    </StaticPageLayout>
  )
}
