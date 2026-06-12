import { useState, type FormEvent } from "react"
import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { ComingSoonModal } from "@/components/static/ComingSoonModal"
import { RevealSection } from "@/components/motion/RevealSection"

export function ContactPage() {
  const [modalOpen, setModalOpen] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setModalOpen(true)
  }

  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Contact"
        title="Let's talk."
        subtitle="The fastest way to reach us today is GitHub. A proper inbox and message form are on the way."
      />

      <RevealSection>
        <section className="landing-container pb-28">
          <div className="max-w-3xl mx-auto grid md:grid-cols-5 gap-10">
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="static-label">Name</label>
                  <input id="name" name="name" type="text" className="static-input" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="static-label">Email</label>
                  <input id="email" name="email" type="email" className="static-input" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="static-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="static-input resize-none"
                  placeholder="What's on your mind?"
                />
              </div>
              <button type="submit" className="landing-cta-primary landing-cta-sharp text-[13px]">
                Send message
              </button>
              <p className="text-[12px] text-[var(--landing-fg-faint)]">
                Messaging isn't wired up yet — you'll see a confirmation when it is.
              </p>
            </form>

            <div className="md:col-span-2 space-y-4">
              <div className="static-card">
                <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)] mb-1">GitHub</p>
                <a
                  href="https://github.com/Official-Krish"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] text-[var(--landing-accent)] hover:underline"
                >
                  @Official-Krish
                </a>
              </div>
              <div className="static-card">
                <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)] mb-1">Built by</p>
                <p className="text-[14px] text-[var(--landing-fg-muted)]">Krish Anand</p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <ComingSoonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Messaging coming soon"
        description="We haven't connected the contact form yet. For now, open an issue or message on GitHub — we read everything there."
      />
    </StaticPageLayout>
  )
}
