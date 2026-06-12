export function SonarRings({ className = "" }: { className?: string }) {
  return (
    <div className={`landing-sonar ${className}`} aria-hidden>
      <span className="landing-sonar-ring landing-sonar-ring-1" />
      <span className="landing-sonar-ring landing-sonar-ring-2" />
      <span className="landing-sonar-ring landing-sonar-ring-3" />
      <span className="landing-sonar-core" />
    </div>
  )
}
