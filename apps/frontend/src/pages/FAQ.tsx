import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { FAQ } from "@/components/landing/FAQ"
import { RevealSection } from "@/components/motion/RevealSection"
import { Link } from "react-router-dom"
import { usePageTitle } from "@/lib/usePageTitle"

const items = [
  {
    q: "How does a session work?",
    a: "Sign up, pick an interviewer role, upload your résumé, and start a live voice conversation in the browser. The AI asks follow-up questions based on your background. When you're done, you get scores and written feedback.",
  },
  {
    q: "Which interviewer roles are available?",
    a: "Six today: Software Engineer, Frontend Engineer, Backend Engineer, Data Scientist, Product Manager, and DevOps Engineer. Each focuses on different question types for that role.",
  },
  {
    q: "How am I scored?",
    a: "Sessions are evaluated on overall performance plus communication, technical accuracy, and problem-solving — each scored and summarised with strengths, gaps, and per-answer feedback.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Everything runs in the browser. Allow microphone access when prompted. Chrome, Firefox, Safari, and Edge are supported.",
  },
  {
    q: "Can I upload my résumé?",
    a: "Yes. PDF or DOCX. The interviewer uses it to tailor questions to your experience.",
  },
  {
    q: "Is it free?",
    a: "Yes — during early access there is no paid tier. Create an account and practice without a credit card.",
  },
  {
    q: "Is my data private?",
    a: "Session audio and transcripts are stored for your account so you can review results. We use Google's Gemini API for interviews and evaluation. See our Privacy Policy for retention and deletion.",
  },
  {
    q: "What languages are supported?",
    a: "English only for now.",
  },
]

export function FAQPage() {
  usePageTitle("FAQ")
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Support"
        title="Questions, answered."
        subtitle={
          <>
            Straight answers about what Evalio does today. Still stuck?{" "}
            <Link to="/contact">Get in touch</Link>.
          </>
        }
      />
      <RevealSection>
        <section className="landing-container pb-28">
          <div className="max-w-2xl mx-auto">
            <FAQ items={items} />
          </div>
        </section>
      </RevealSection>
    </StaticPageLayout>
  )
}
