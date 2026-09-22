import type { ApprovalGuardrail } from '@/lib/mortgage-dashboard.server';
import { Panel, StatusChip } from './Panel';

export function ApprovalGuardrailCard({
  guardrails,
}: {
  guardrails: ApprovalGuardrail[];
}) {
  return (
    <Panel
      id="approval-guardrails"
      eyebrow="Human authority"
      title="Recommendation guardrails"
      meta="Subject to review"
    >
      <div className="grid gap-3 p-5">
        {guardrails.map((guardrail) => (
          <div
            key={guardrail.title}
            className="border border-[var(--grid-line)] bg-[var(--story-surface)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-black text-[var(--story-ink)]">
                {guardrail.title}
              </p>
              <StatusChip tone={guardrail.tone}>{guardrail.label}</StatusChip>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--grid-muted)]">
              {guardrail.detail}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
