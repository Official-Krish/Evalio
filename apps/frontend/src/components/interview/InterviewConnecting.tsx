import { SonarRings } from "@/components/landing/svg/SonarRings"

export function InterviewConnecting() {
  return (
    <div className="interview-room interview-room-connecting">
      <div className="landing-grain absolute inset-0 pointer-events-none" aria-hidden />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] gap-8 px-6">
        <SonarRings className="opacity-80" />
        <div className="text-center">
          <p className="text-[10px] tracking-[0.22em] uppercase text-[var(--landing-fg-faint)] mb-3">
            Session initializing
          </p>
          <h1 className="landing-serif text-[clamp(1.5rem,4vw,2rem)] text-[var(--landing-fg)]">
            Entering the room
          </h1>
          <p className="mt-3 text-[13px] text-[var(--landing-fg-muted)]">
            Connecting to your interviewer…
          </p>
        </div>
      </div>
    </div>
  )
}
