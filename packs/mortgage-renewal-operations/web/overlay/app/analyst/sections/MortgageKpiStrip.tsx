import type { MortgageKpis } from '@/lib/mortgage-dashboard.server';
import { formatCount, formatCurrencyCompact, formatPercent } from './format';

export function MortgageKpiStrip({ kpis }: { kpis: MortgageKpis }) {
  const items = [
    {
      label: 'Renewals in 180 days',
      value: formatCount(kpis.renewalsInWindow),
      detail: 'Aggregated workload',
    },
    {
      label: 'Balance maturing',
      value: formatCurrencyCompact(kpis.balanceMaturingCad),
      detail: 'Principal exposure',
    },
    {
      label: 'Value at risk',
      value: formatCurrencyCompact(kpis.valueAtRiskCad),
      detail: 'Derived signal, not a decision',
    },
    {
      label: 'High-risk signals',
      value: formatCount(kpis.highRiskRenewals),
      detail: 'Prioritization only',
    },
    {
      label: 'Avg. renewal likelihood',
      value: formatPercent(kpis.averageRenewalLikelihood),
      detail: 'Model-derived estimate',
    },
  ];

  return (
    <section
      aria-label="Mortgage renewal aggregate KPIs"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
    >
      {items.map((item) => (
        <div key={item.label} className="border border-[var(--grid-line)] bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--grid-muted)]">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-[var(--story-ink)]">
            {item.value}
          </p>
          <p className="mt-1 text-xs text-[var(--grid-muted)]">{item.detail}</p>
        </div>
      ))}
    </section>
  );
}
