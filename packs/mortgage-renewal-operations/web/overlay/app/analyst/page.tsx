import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  mortgageDashboard,
  type MortgageDashboardData,
} from '@/lib/mortgage-dashboard.server';
import { ApprovalGuardrailCard } from './sections/ApprovalGuardrailCard';
import { BranchCapacityCard } from './sections/BranchCapacityCard';
import { MortgageKpiStrip } from './sections/MortgageKpiStrip';
import { OfferCoverageCard } from './sections/OfferCoverageCard';
import { RiskSignalsCard } from './sections/RiskSignalsCard';
import { formatCutoff } from './sections/format';
import { AnalystShell } from './AnalystShell';

export const dynamic = 'force-dynamic';

export default async function MortgageAnalystPage() {
  if (!process.env.AUTH_MICROSOFT_ENTRA_ID_ID) {
    throw new Error('Microsoft Entra authentication is not configured');
  }
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  let data: MortgageDashboardData | null = null;
  let error: string | null = null;
  try {
    data = await mortgageDashboard();
  } catch (loadError) {
    error = (loadError as Error).message;
  }

  return (
    <AnalystShell>
      <MortgageAnalystDashboard data={data} error={error} />
    </AnalystShell>
  );
}

function MortgageAnalystDashboard({
  data,
  error,
}: {
  data: MortgageDashboardData | null;
  error: string | null;
}) {
  return (
    <main
      aria-label="Mortgage renewal operations dashboard"
      className="min-h-[calc(100vh-56px)] bg-[var(--story-surface)] text-[var(--story-ink)]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 lg:px-8 2xl:px-10">
        <header className="mb-5 border border-[var(--grid-line)] bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--story-accent)]">
            Retail banking staff workspace
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black uppercase leading-none tracking-[-0.05em] text-[var(--story-ink)] sm:text-4xl">
            Mortgage renewal operations control tower
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--grid-muted)]">
            Aggregated renewal workload, derived attrition signals, branch
            capacity, and offer-approval coverage. Customer names, account
            numbers, and row-level customer records are intentionally absent from
            this default view.
          </p>
          {data ? (
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--grid-soft)]">
              Governed cutoff · {formatCutoff(data.cutoff)} · Model {data.modelVersion}
            </p>
          ) : null}
        </header>

        {error ? <DashboardError message={error} /> : null}
        {data ? (
          <div className="grid gap-5">
            <MortgageKpiStrip kpis={data.kpis} />
            <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
              <RiskSignalsCard rows={data.riskSummary} />
              <OfferCoverageCard rows={data.offerCoverage} />
              <BranchCapacityCard rows={data.branchPerformance} />
              <ApprovalGuardrailCard guardrails={data.approvalGuardrails} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function DashboardError({ message }: { message: string }) {
  return (
    <section
      role="alert"
      aria-labelledby="dashboard-error-title"
      className="mb-5 border-2 border-rose-700 bg-white p-6"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-800">
        Semantic model unavailable
      </p>
      <h2
        id="dashboard-error-title"
        className="mt-2 text-xl font-black uppercase tracking-[-0.02em] text-[var(--story-ink)]"
      >
        Live mortgage renewal measures could not be read
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--grid-muted)]">
        {message}
      </p>
    </section>
  );
}
