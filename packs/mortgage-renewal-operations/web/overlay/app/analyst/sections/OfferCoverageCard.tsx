import type { OfferCoverageRow } from '@/lib/mortgage-dashboard.server';
import { formatCount, formatCurrencyCompact } from './format';
import { MeterBar, Panel, StatusChip } from './Panel';

function toneForApproval(level: string): 'critical' | 'caution' | 'ready' | 'neutral' {
  const normalized = level.toLowerCase();
  if (normalized.includes('committee') || normalized.includes('executive')) return 'critical';
  if (normalized.includes('manager')) return 'caution';
  if (normalized.includes('advisor')) return 'ready';
  return 'neutral';
}

export function OfferCoverageCard({ rows }: { rows: OfferCoverageRow[] }) {
  const maxCount = Math.max(...rows.map((row) => row.renewalCount), 1);
  return (
    <Panel
      id="offer-coverage"
      eyebrow="Approval before action"
      title="Recommended offer coverage"
      meta="Recommendations are not approved offers"
    >
      <div className="divide-y divide-[var(--grid-line)]">
        {rows.map((row) => (
          <div key={row.offer} className="grid gap-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[var(--story-ink)]">{row.offer}</p>
                <p className="mt-1 text-xs text-[var(--grid-muted)]">
                  {formatCount(row.highRiskCount)} high-risk signals ·{' '}
                  {formatCurrencyCompact(row.balanceMaturingCad)} balance
                </p>
              </div>
              <StatusChip tone={toneForApproval(row.approvalLevel)}>
                {row.approvalLevel}
              </StatusChip>
            </div>
            <MeterBar
              percent={(row.renewalCount / maxCount) * 100}
              label={`${row.offer} renewal coverage`}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}
