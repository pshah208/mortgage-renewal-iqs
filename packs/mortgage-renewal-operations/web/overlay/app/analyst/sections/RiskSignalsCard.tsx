import type { RiskSummaryRow } from '@/lib/mortgage-dashboard.server';
import { formatCount, formatCurrencyCompact } from './format';
import { MeterBar, Panel, StatusChip } from './Panel';

function toneForRisk(band: string): 'critical' | 'caution' | 'ready' | 'neutral' {
  const normalized = band.toLowerCase();
  if (normalized.includes('high')) return 'critical';
  if (normalized.includes('medium')) return 'caution';
  if (normalized.includes('low')) return 'ready';
  return 'neutral';
}

export function RiskSignalsCard({ rows }: { rows: RiskSummaryRow[] }) {
  const maxBalance = Math.max(...rows.map((row) => row.balanceMaturingCad), 1);
  return (
    <Panel
      id="risk-signals"
      eyebrow="Derived signal boundary"
      title="Attrition risk by maturity window"
      meta="No row-level customer data"
    >
      <div className="divide-y divide-[var(--grid-line)]">
        {rows.map((row) => (
          <div key={`${row.riskBand}-${row.maturityBucket}`} className="grid gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-[var(--story-ink)]">
                  {row.riskBand} · {row.maturityBucket}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--grid-muted)]">
                  {row.riskSignalNote}
                </p>
              </div>
              <StatusChip tone={toneForRisk(row.riskBand)}>
                {formatCount(row.renewalCount)} renewals
              </StatusChip>
            </div>
            <MeterBar
              percent={(row.balanceMaturingCad / maxBalance) * 100}
              label={`${row.riskBand} ${row.maturityBucket} balance share`}
            />
            <p className="text-xs font-bold text-[var(--grid-muted)]">
              {formatCurrencyCompact(row.balanceMaturingCad)} balance ·{' '}
              {formatCurrencyCompact(row.revenueExposureCad)} annual revenue exposure
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
