export function Panel({
  eyebrow,
  title,
  meta,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="overflow-hidden border border-[var(--grid-line)] bg-white shadow-[0_10px_30px_-30px_rgba(15,38,76,0.9)]"
    >
      <header className="border-b border-[var(--grid-line)] border-l-4 border-l-[var(--story-accent)] bg-[var(--story-surface)] px-5 py-3">
        {eyebrow ? (
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--story-accent)]">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h2
            id={`${id}-title`}
            className="text-[13px] font-black uppercase tracking-[0.06em] text-[var(--story-ink)]"
          >
            {title}
          </h2>
          {meta ? (
            <span className="text-[11px] text-[var(--grid-muted)]">· {meta}</span>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function StatusChip({
  tone,
  children,
}: {
  tone: 'critical' | 'caution' | 'ready' | 'neutral';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'critical'
      ? 'border-rose-700/40 bg-rose-50 text-rose-800'
      : tone === 'caution'
        ? 'border-amber-600/40 bg-amber-50 text-amber-800'
        : tone === 'ready'
          ? 'border-emerald-700/40 bg-emerald-50 text-emerald-800'
          : 'border-[var(--grid-line-strong)] bg-[var(--story-surface)] text-[var(--grid-muted)]';
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function MeterBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="h-1.5 w-full overflow-hidden bg-[var(--grid-track)]"
    >
      <div
        className="h-full bg-[var(--story-accent)]"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
