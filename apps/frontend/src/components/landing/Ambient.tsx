export function Ambient() {
  return (
    <div
      className="landing-ambient pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="landing-grain absolute inset-0" />
      <div
        className="hidden md:block absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 50% at 20% 30%, var(--landing-accent), transparent)",
            "radial-gradient(ellipse 50% 40% at 80% 70%, var(--landing-accent), transparent)",
          ].join(", "),
          opacity: 0.06,
        }}
      />
    </div>
  );
}
