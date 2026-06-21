import { useEffect } from "react";
import { usePageTitle } from "@/lib/usePageTitle";
import { Ambient } from "@/components/landing/Ambient";
import { AppBar } from "@/components/layout/AppBar";
import { Opening } from "@/components/landing/Opening";
import { Manifesto } from "@/components/landing/Manifesto";
import { Presence } from "@/components/landing/Presence";
import { LandingCompanies } from "@/components/landing/LandingCompanies";
import { LandingStyles } from "@/components/landing/LandingStyles";
import { LandingEvaluation } from "@/components/landing/LandingEvaluation";
import { IdentityEmergence } from "@/components/landing/IdentityEmergence";
import { MemoryTimeline } from "@/components/landing/MemoryTimeline";
import { DSACoding } from "@/components/landing/DSACoding";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { Threshold } from "@/components/landing/Threshold";
import { Footer } from "@/components/Footer";
import { FilmStrip } from "@/components/landing/HorizontalStrip";

export function LandingPage() {
  usePageTitle("AI-Powered Interview Practice");
  useEffect(() => {
    document.documentElement.classList.add("landing-active");
    return () => {
      document.documentElement.classList.remove("landing-active");
    };
  }, []);

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-fg)] selection:bg-[var(--landing-accent-soft)] selection:text-[var(--landing-fg)]">
      <Ambient />
      <AppBar />
      <main>
        <Opening />
        <Manifesto />
        <Presence />
        <DSACoding />
        <IdentityEmergence />
        <MemoryTimeline />
        <LandingCompanies />
        <LandingStyles />
        <LandingEvaluation />
        <FilmStrip />
        <LandingPricing />
        <Threshold />
      </main>
      <Footer />
    </div>
  );
}
