import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Sidebar } from "../components/Dashboard/Sidebar";
import { useAnalysisData } from "../components/Analysis/hooks";
import { KeyIndicators } from "../components/Analysis/KeyIndicators";
import { DimensionHub } from "../components/Analysis/DimensionHub";
import { StrengthsWeaknesses } from "../components/Analysis/StrengthsWeaknesses";
import { IdentityTraitsSection } from "../components/Analysis/IdentityTraitsSection";
import { SessionHistory } from "../components/Analysis/SessionHistory";
import { FailurePatterns } from "../components/Analysis/FailurePatterns";
import { IconPlus } from "@tabler/icons-react";

export function AnalysisPage() {
  const {
    sessions,
    completedCount,
    identityTraits,
    failurePatterns,
    mostImproved,
    commVals,
    techVals,
    probVals,
    overallVals,
    avgScore,
    latestSummary,
    isLoading,
    isError,
  } = useAnalysisData();

  const latestStrengths = latestSummary?.strengths ?? [];
  const latestWeaknesses = latestSummary?.weaknesses ?? [];
  const latestNarrative = latestSummary?.summary ?? null;

  if (isLoading) {
    return (
      <div className="db-container">
        <div className="db-layout">
          <Sidebar completedCount={completedCount} />
          <main className="db-main">
            <div className="flex items-center justify-center py-32">
              <div
                className="animate-spin size-6 rounded-full border-2"
                style={{
                  borderColor: "var(--app-accent, #b8a88a)",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="db-container">
        <div className="db-layout">
          <Sidebar completedCount={completedCount} />
          <main className="db-main">
            <div className="text-center py-32">
              <p className="text-[var(--color-text-secondary)]">
                Failed to load analysis metrics
              </p>
              <Link
                to="/dashboard"
                className="text-accent text-sm hover:underline mt-2 inline-block"
              >
                Back to Dashboard
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="db-container">
      <SEO title="Performance Analysis" noindex />

      <div className="db-layout">
        <Sidebar completedCount={completedCount} />

        <main className="db-main">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="db-section-label">Evaluation Workspace</span>
              <h1
                className="text-[clamp(32px,5vw,46px)] font-[400] tracking-[-0.03em] leading-[1.05] mt-1 mb-2"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "Instrument Serif, Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                Performance Insights
              </h1>
              <p className="text-[12.5px] mt-0.5 max-w-xl leading-relaxed text-[var(--color-text-secondary)]">
                Telemetry and deep diagnostics extracted from your mock
                technical and behavioral sessions.
              </p>
            </div>
          </div>

          {completedCount === 0 ? (
            <section
              className="relative overflow-hidden rounded-2xl p-12 text-center border border-white/[0.04]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.03) 100%), var(--color-bg-card, rgba(18,18,18,0.6))",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none filter blur-[60px] opacity-10"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-accent, #b8a88a) 0%, transparent 70%)",
                }}
              />
              <p className="text-[14px] max-w-md mx-auto leading-relaxed text-[var(--color-text-secondary)]">
                You haven't completed any mock interviews yet. Run your first
                simulation to generate multi-dimensional scores and failure
                trends.
              </p>
              <Link
                to="/interview/new"
                className="inline-flex items-center gap-1.5 mt-6 text-[12px] px-6 py-[10px] rounded-full no-underline font-medium transition-all hover:opacity-85"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-text), var(--color-text-secondary))",
                  color: "var(--color-bg)",
                }}
              >
                <IconPlus size={12} />
                Start Your First Session
              </Link>
            </section>
          ) : (
            <div className="flex flex-col gap-6">
              <KeyIndicators
                avgScore={avgScore}
                completedCount={completedCount}
                mostImproved={mostImproved}
                failurePatternsCount={failurePatterns.length}
              />

              <DimensionHub
                overallVals={overallVals}
                techVals={techVals}
                commVals={commVals}
                probVals={probVals}
                sessions={sessions}
              />

              {latestNarrative && (
                <section
                  className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.04] bg-white/[0.01] backdrop-blur-md"
                  style={{
                    borderLeft: "3px solid var(--color-accent, #b8a88a)",
                  }}
                >
                  <span className="db-section-label mb-2 block">
                    Latest Session Narrative
                  </span>
                  <p className="text-[13.5px] leading-relaxed m-0 italic font-normal text-[var(--color-text-secondary)]">
                    &quot;{latestNarrative}&quot;
                  </p>
                </section>
              )}

              <StrengthsWeaknesses
                strengths={latestStrengths}
                weaknesses={latestWeaknesses}
              />

              <IdentityTraitsSection traits={identityTraits} />

              {failurePatterns.length > 0 && (
                <div>
                  <FailurePatterns patterns={failurePatterns} />
                </div>
              )}

              <SessionHistory sessions={sessions} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
