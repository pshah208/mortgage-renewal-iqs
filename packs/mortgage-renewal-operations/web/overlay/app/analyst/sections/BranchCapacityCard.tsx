import type { BranchPerformanceRow } from '@/lib/mortgage-dashboard.server';
import { formatCount, formatCurrencyCompact, formatPercent } from './format';
import { MeterBar, Panel, StatusChip } from './Panel';

export function BranchCapacityCard({ rows }: { rows: BranchPerformanceRow[] }) {
  const maxWorkload = Math.max(...rows.map((row) => row.renewalsNext180Days), 1);
  return (
    <Panel
      id="branch-capacity"
      eyebrow="Sequencing"
      title="Branch workload and capacity signals"
      meta="Aggregated branch view"
    >
      <div className="divide-y divide-[var(--grid-line)]">
        {rows.map((row) => (
          <div key={row.branchSegment} className="grid gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-[var(--story-ink)]">
                  {row.branchSegment}
                </p>
                <p className="mt-1 text-xs text-[var(--grid-muted)]">
                  {formatCurrencyCompact(row.balanceMaturingCad)} maturing · retention{' '}
                  {formatPercent(row.retentionRateLastQuarter)}
                </p>
              </div>
              <StatusChip tone={row.highRiskCount > 10 ? 'caution' : 'neutral'}>
                {formatCount(row.highRiskCount)} high-risk
              </StatusChip>
            </div>
            <MeterBar
              percent={(row.renewalsNext180Days / maxWorkload) * 100}
              label={`${row.branchSegment} renewal workload`}
            />
            <p className="text-xs font-bold text-[var(--grid-muted)]">
              {formatCount(row.renewalsNext180Days)} renewals in the planning window
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
