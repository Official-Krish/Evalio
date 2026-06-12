export function ResultsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-[var(--color-border)]" />
          <div className="h-4 w-32 rounded bg-[var(--color-border)]" />
        </div>
        <div className="h-8 w-24 rounded-[var(--radius-md)] bg-[var(--color-border)]" />
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="h-5 w-16 rounded bg-[var(--color-border)] mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="size-20 rounded-full bg-[var(--color-border)]" />
              <div className="h-3 w-20 rounded bg-[var(--color-border)]" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="h-5 w-20 rounded bg-[var(--color-border)] mb-4" />
        <div className="h-4 w-full rounded bg-[var(--color-border)] mb-2" />
        <div className="h-4 w-3/4 rounded bg-[var(--color-border)] mb-6" />
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-[var(--color-border)] mb-3" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-full rounded bg-[var(--color-border)]" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-[var(--color-border)] mb-3" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-full rounded bg-[var(--color-border)]" />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <div className="h-5 w-36 rounded bg-[var(--color-border)] mb-4" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-3"
          >
            <div className="h-4 w-3/4 rounded bg-[var(--color-border)] mb-2" />
            <div className="h-3 w-full rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
