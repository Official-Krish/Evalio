import { StaticPageLayout } from "@/components/layout/StaticPageLayout";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { RevealSection } from "@/components/motion/RevealSection";
import { SEO } from "@/components/SEO";

const sections = [
  {
    title: "Getting started",
    items: [
      {
        label: "Create an account",
        desc: "Sign up with email. No credit card required.",
      },
      {
        label: "Choose an interviewer",
        desc: "Pick one of six role-specific personas on the new interview flow.",
      },
      {
        label: "Upload your résumé",
        desc: "Optional PDF or DOCX so questions match your background.",
      },
      {
        label: "Start the session",
        desc: "Grant microphone access and speak naturally — the AI will follow up in real time.",
      },
      {
        label: "Review results",
        desc: "After the session ends, open your report for scores, summary, and per-answer feedback.",
      },
    ],
  },
  {
    title: "During the interview",
    items: [
      {
        label: "Use a quiet room",
        desc: "Background noise affects transcription quality.",
      },
      {
        label: "Think out loud",
        desc: "The evaluation considers how you approach problems, not just final answers.",
      },
      {
        label: "Finish the session",
        desc: "End the interview from the UI when you're done so evaluation can run.",
      },
    ],
  },
  {
    title: "Scores & dashboard",
    items: [
      {
        label: "Dimension scores",
        desc: "Communication, technical, and problem-solving — plus an overall score.",
      },
      {
        label: "Session history",
        desc: "Past interviews appear on your dashboard with dates and roles.",
      },
      {
        label: "Streaks",
        desc: "Consecutive practice days are tracked on your dashboard and profile.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        desc: "Update your name and view practice history from the profile page.",
      },
      {
        label: "Data deletion",
        desc: "Account deletion isn't self-serve yet — contact us to request removal.",
      },
    ],
  },
];

export function DocsPage() {
  return (
    <StaticPageLayout>
      <SEO
        title="Docs"
        description="Documentation for Evalio interview practice platform."
      />
      <StaticPageHero
        badge="Docs"
        title="How Evalio works."
        subtitle="A practical guide to what's shipped today — not a roadmap wishlist."
      />

      <div className="landing-container pb-28">
        <div className="max-w-3xl mx-auto space-y-14">
          {sections.map((section, i) => (
            <RevealSection key={section.title}>
              <div>
                <h2 className="flex items-center gap-3 text-[15px] font-medium text-[var(--landing-fg)] mb-5">
                  <span className="text-[10px] tabular-nums text-[var(--landing-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-px border border-[var(--landing-line)]">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="static-card !border-0 !border-b border-[var(--landing-line)] last:border-b-0"
                    >
                      <h3 className="static-card-title">{item.label}</h3>
                      <p className="static-card-body">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </StaticPageLayout>
  );
}
