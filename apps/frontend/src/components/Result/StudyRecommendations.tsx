interface Props {
  topics: string[];
}

export function StudyRecommendations({ topics }: Props) {
  if (!topics.length) return null;

  return (
    <div className="mb-12">
      <p
        className="text-[11px] tracking-[0.1em] uppercase mb-4 font-semibold"
        style={{ color: "var(--landing-fg-muted)" }}
      >
        Study Recommendations
      </p>
      <div className="flex flex-wrap gap-2">
        {topics.map((t, idx) => (
          <span
            key={`rt-${idx}`}
            className="text-[11px] font-[500] px-[12px] py-[4px] rounded-full border cursor-default tracking-[0.02em]"
            style={{
              borderColor: "var(--app-accent-border, rgba(184,168,138,0.25))",
              background: "var(--app-accent-bg, rgba(184,168,138,0.06))",
              color: "var(--app-accent, #b8a88a)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
