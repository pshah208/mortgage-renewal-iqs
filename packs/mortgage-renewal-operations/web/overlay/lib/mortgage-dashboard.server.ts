import 'server-only';

import { unstable_cache } from 'next/cache';
import { executeSemanticModelQuery } from '@/lib/fabric-semantic-model.server';
import {
  readPowerBiNumber,
  readPowerBiString,
  type PowerBiRow,
} from '@/lib/powerbi-query';

export type MortgageKpis = {
  renewalsInWindow: number;
  balanceMaturingCad: number;
  annualRevenueExposureCad: number;
  valueAtRiskCad: number;
  highRiskRenewals: number;
  averageRenewalLikelihood: number;
};

export type RiskSummaryRow = {
  riskBand: string;
  maturityBucket: string;
  renewalCount: number;
  balanceMaturingCad: number;
  revenueExposureCad: number;
  riskSignalNote: string;
};

export type OfferCoverageRow = {
  offer: string;
  approvalLevel: string;
  renewalCount: number;
  balanceMaturingCad: number;
  highRiskCount: number;
};

export type BranchPerformanceRow = {
  branchSegment: string;
  province: string;
  renewalsNext180Days: number;
  balanceMaturingCad: number;
  highRiskCount: number;
  retentionRateLastQuarter: number;
};

export type ApprovalGuardrail = {
  title: string;
  label: string;
  detail: string;
  tone: 'critical' | 'caution' | 'ready' | 'neutral';
};

export type MortgageDashboardData = {
  cutoff: string;
  modelVersion: string;
  kpis: MortgageKpis;
  riskSummary: RiskSummaryRow[];
  offerCoverage: OfferCoverageRow[];
  branchPerformance: BranchPerformanceRow[];
  approvalGuardrails: ApprovalGuardrail[];
};

const KPI_QUERY = `
EVALUATE
ROW (
  "Mortgage Cutoff", CALCULATE ( MAX ( 'Renewal Portfolio'[Source As Of Date] ), ALL ( 'Renewal Portfolio' ) ),
  "Model Version", CALCULATE ( MAX ( 'Renewal Portfolio'[Model Version] ), ALL ( 'Renewal Portfolio' ) ),
  "Renewals in 180 Days", [Renewals in 180 Days],
  "Balance Maturing", [Balance Maturing],
  "Annual Revenue Exposure", [Annual Revenue Exposure],
  "Value at Risk", [Value at Risk],
  "High Risk Renewals", [High Risk Renewals],
  "Average Renewal Likelihood", [Average Renewal Likelihood]
)
`;

const RISK_SUMMARY_QUERY = `
EVALUATE
SUMMARIZECOLUMNS (
  'Risk Summary'[Risk Band],
  'Risk Summary'[Maturity Bucket],
  "Renewal Count", SUM ( 'Risk Summary'[Renewal Count] ),
  "Balance Maturing CAD", SUM ( 'Risk Summary'[Balance Maturing CAD] ),
  "Revenue Exposure CAD", SUM ( 'Risk Summary'[Revenue Exposure CAD] ),
  "Risk Signal Note", MAX ( 'Risk Summary'[Risk Signal Note] )
)
ORDER BY [Revenue Exposure CAD] DESC
`;

const OFFER_COVERAGE_QUERY = `
EVALUATE
SUMMARIZECOLUMNS (
  'Offer Coverage'[Offer],
  'Offer Coverage'[Approval Level],
  "Renewal Count", SUM ( 'Offer Coverage'[Renewal Count] ),
  "Balance Maturing CAD", SUM ( 'Offer Coverage'[Balance Maturing CAD] ),
  "High Risk Count", SUM ( 'Offer Coverage'[High Risk Count] )
)
ORDER BY [High Risk Count] DESC, [Balance Maturing CAD] DESC
`;

// Branch identifiers are deliberately not selected. The staff dashboard starts
// with aggregate workload segments; a row-level handoff belongs in a governed
// workflow with permission checks and approval capture.
const BRANCH_PERFORMANCE_QUERY = `
EVALUATE
TOPN (
  6,
  SUMMARIZECOLUMNS (
    'Branch Performance'[Province],
    "Branch Segment", 'Branch Performance'[Province] & " renewal desk",
    "Renewals Next 180 Days", SUM ( 'Branch Performance'[Renewals Next 180 Days] ),
    "Balance Maturing CAD", SUM ( 'Branch Performance'[Balance Maturing CAD] ),
    "High Risk Count", SUM ( 'Branch Performance'[High Risk Count] ),
    "Retention Rate Last Quarter Pct", AVERAGE ( 'Branch Performance'[Retention Rate Last Quarter Pct] )
  ),
  [Renewals Next 180 Days], DESC
)
`;

const FIXTURE: MortgageDashboardData = {
  cutoff: '2026-08-03',
  modelVersion: 'renewal-risk-demo-v1',
  kpis: {
    renewalsInWindow: 50,
    balanceMaturingCad: 29_480_000,
    annualRevenueExposureCad: 1_126_000,
    valueAtRiskCad: 384_000,
    highRiskRenewals: 14,
    averageRenewalLikelihood: 0.72,
  },
  riskSummary: [
    {
      riskBand: 'High',
      maturityBucket: '0-60 days',
      renewalCount: 9,
      balanceMaturingCad: 5_920_000,
      revenueExposureCad: 238_000,
      riskSignalNote:
        'Payment shock, competitor gap, and shopping activity are elevated together.',
    },
    {
      riskBand: 'High',
      maturityBucket: '61-120 days',
      renewalCount: 5,
      balanceMaturingCad: 3_140_000,
      revenueExposureCad: 126_000,
      riskSignalNote:
        'Derived attrition signals suggest early outreach sequencing, not approval.',
    },
    {
      riskBand: 'Medium',
      maturityBucket: '121-180 days',
      renewalCount: 18,
      balanceMaturingCad: 10_760_000,
      revenueExposureCad: 408_000,
      riskSignalNote:
        'Relationship depth offsets part of the payment-shock signal.',
    },
    {
      riskBand: 'Low',
      maturityBucket: '0-180 days',
      renewalCount: 18,
      balanceMaturingCad: 9_660_000,
      revenueExposureCad: 354_000,
      riskSignalNote:
        'Stable engagement and lower competitor gaps indicate routine renewal handling.',
    },
  ],
  offerCoverage: [
    {
      offer: 'Rate-match review path',
      approvalLevel: 'Pricing committee review',
      renewalCount: 11,
      balanceMaturingCad: 7_880_000,
      highRiskCount: 8,
    },
    {
      offer: 'Relationship bundle review',
      approvalLevel: 'Branch manager approval',
      renewalCount: 15,
      balanceMaturingCad: 8_340_000,
      highRiskCount: 4,
    },
    {
      offer: 'Standard renewal outreach',
      approvalLevel: 'Frontline prepared, manager monitored',
      renewalCount: 24,
      balanceMaturingCad: 13_260_000,
      highRiskCount: 2,
    },
  ],
  branchPerformance: [
    {
      branchSegment: 'Ontario renewal desk',
      province: 'ON',
      renewalsNext180Days: 19,
      balanceMaturingCad: 10_940_000,
      highRiskCount: 7,
      retentionRateLastQuarter: 0.74,
    },
    {
      branchSegment: 'British Columbia renewal desk',
      province: 'BC',
      renewalsNext180Days: 13,
      balanceMaturingCad: 8_120_000,
      highRiskCount: 4,
      retentionRateLastQuarter: 0.77,
    },
    {
      branchSegment: 'Prairie renewal desk',
      province: 'AB',
      renewalsNext180Days: 10,
      balanceMaturingCad: 5_880_000,
      highRiskCount: 2,
      retentionRateLastQuarter: 0.81,
    },
    {
      branchSegment: 'Atlantic renewal desk',
      province: 'NS',
      renewalsNext180Days: 8,
      balanceMaturingCad: 4_540_000,
      highRiskCount: 1,
      retentionRateLastQuarter: 0.83,
    },
  ],
  approvalGuardrails: [
    {
      title: 'Risk score boundary',
      label: 'Derived signal',
      detail:
        'Attrition risk is a model output for prioritization. It is not factual evidence of intent, affordability, eligibility, or suitability.',
      tone: 'caution',
    },
    {
      title: 'Offer boundary',
      label: 'Approval required',
      detail:
        'A recommended retention path remains a recommendation until an authorized human approves price, exception, communication, and workflow capture.',
      tone: 'critical',
    },
    {
      title: 'Privacy boundary',
      label: 'Aggregate default',
      detail:
        'The default dashboard uses portfolio, branch-segment, maturity-window, and offer-coverage totals. It does not display personal customer fields.',
      tone: 'ready',
    },
  ],
};

export function mortgageDashboardFixture(): MortgageDashboardData {
  return structuredClone(FIXTURE);
}

async function loadDashboard(): Promise<MortgageDashboardData> {
  try {
    return await fetchDashboardFromSemanticModel();
  } catch (error) {
    if (isMissingSemanticModelConfig(error)) return mortgageDashboardFixture();
    throw error;
  }
}

async function fetchDashboardFromSemanticModel(): Promise<MortgageDashboardData> {
  const [kpiRows, riskRows, offerRows, branchRows] = await Promise.all([
    executeSemanticModelQuery(KPI_QUERY),
    executeSemanticModelQuery(RISK_SUMMARY_QUERY),
    executeSemanticModelQuery(OFFER_COVERAGE_QUERY),
    executeSemanticModelQuery(BRANCH_PERFORMANCE_QUERY),
  ]);
  const headline = kpiRows[0];
  if (!headline) return mortgageDashboardFixture();
  return {
    cutoff: readPowerBiString(headline, '[Mortgage Cutoff]', FIXTURE.cutoff),
    modelVersion: readPowerBiString(headline, '[Model Version]', FIXTURE.modelVersion),
    kpis: readKpis(headline),
    riskSummary: riskRows.map(readRiskSummary),
    offerCoverage: offerRows.map(readOfferCoverage),
    branchPerformance: branchRows.map(readBranchPerformance),
    approvalGuardrails: FIXTURE.approvalGuardrails,
  };
}

export const mortgageDashboard = unstable_cache(
  loadDashboard,
  ['mortgage-renewal-operations-dashboard'],
  { revalidate: 300 },
);

function isMissingSemanticModelConfig(error: unknown): boolean {
  return error instanceof Error && error.message.includes('IQ_FABRIC_WORKSPACE_ID');
}

function readKpis(row: PowerBiRow): MortgageKpis {
  return {
    renewalsInWindow: readPowerBiNumber(row, '[Renewals in 180 Days]'),
    balanceMaturingCad: readPowerBiNumber(row, '[Balance Maturing]'),
    annualRevenueExposureCad: readPowerBiNumber(row, '[Annual Revenue Exposure]'),
    valueAtRiskCad: readPowerBiNumber(row, '[Value at Risk]'),
    highRiskRenewals: readPowerBiNumber(row, '[High Risk Renewals]'),
    averageRenewalLikelihood: readPowerBiNumber(row, '[Average Renewal Likelihood]'),
  };
}

function readRiskSummary(row: PowerBiRow): RiskSummaryRow {
  return {
    riskBand: readPowerBiString(row, 'Risk Summary[Risk Band]'),
    maturityBucket: readPowerBiString(row, 'Risk Summary[Maturity Bucket]'),
    renewalCount: readPowerBiNumber(row, '[Renewal Count]'),
    balanceMaturingCad: readPowerBiNumber(row, '[Balance Maturing CAD]'),
    revenueExposureCad: readPowerBiNumber(row, '[Revenue Exposure CAD]'),
    riskSignalNote: readPowerBiString(row, '[Risk Signal Note]'),
  };
}

function readOfferCoverage(row: PowerBiRow): OfferCoverageRow {
  return {
    offer: readPowerBiString(row, 'Offer Coverage[Offer]'),
    approvalLevel: readPowerBiString(row, 'Offer Coverage[Approval Level]'),
    renewalCount: readPowerBiNumber(row, '[Renewal Count]'),
    balanceMaturingCad: readPowerBiNumber(row, '[Balance Maturing CAD]'),
    highRiskCount: readPowerBiNumber(row, '[High Risk Count]'),
  };
}

function readBranchPerformance(row: PowerBiRow): BranchPerformanceRow {
  return {
    branchSegment: readPowerBiString(row, '[Branch Segment]'),
    province: readPowerBiString(row, 'Branch Performance[Province]'),
    renewalsNext180Days: readPowerBiNumber(row, '[Renewals Next 180 Days]'),
    balanceMaturingCad: readPowerBiNumber(row, '[Balance Maturing CAD]'),
    highRiskCount: readPowerBiNumber(row, '[High Risk Count]'),
    retentionRateLastQuarter: readPowerBiNumber(row, '[Retention Rate Last Quarter Pct]'),
  };
}
