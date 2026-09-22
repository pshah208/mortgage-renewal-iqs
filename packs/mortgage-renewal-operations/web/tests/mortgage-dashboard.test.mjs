import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  resolve(__dirname, '..', 'overlay', 'lib', 'mortgage-dashboard.server.ts'),
  'utf8',
);
const page = readFileSync(
  resolve(__dirname, '..', 'overlay', 'app', 'analyst', 'page.tsx'),
  'utf8',
);

test('the dashboard uses fixed DAX through the semantic-model helper', () => {
  assert.match(source, /executeSemanticModelQuery\(KPI_QUERY\)/);
  assert.match(source, /executeSemanticModelQuery\(RISK_SUMMARY_QUERY\)/);
  assert.match(source, /executeSemanticModelQuery\(OFFER_COVERAGE_QUERY\)/);
  assert.match(source, /executeSemanticModelQuery\(BRANCH_PERFORMANCE_QUERY\)/);
  assert.doesNotMatch(source, /fetch\(|axios|XMLHttpRequest/);
});

test('dashboard queries the authored mortgage semantic model surfaces', () => {
  for (const term of [
    "'Renewal Portfolio'",
    "'Risk Summary'",
    "'Offer Coverage'",
    "'Branch Performance'",
    '[Renewals in 180 Days]',
    '[Balance Maturing]',
    '[Value at Risk]',
    '[High Risk Renewals]',
    '[Average Renewal Likelihood]',
  ]) {
    assert.ok(source.includes(term), `missing ${term}`);
  }
});

test('fixtures are aggregate-only and keep risk distinct from decisions', () => {
  assert.match(source, /export function mortgageDashboardFixture\(\): MortgageDashboardData/);
  assert.match(source, /Risk score boundary/);
  assert.match(source, /Derived signal/);
  assert.match(source, /Approval required/);
  assert.match(page, /Customer names, account\s+numbers, and row-level customer records are intentionally absent/);
  const id = 'id';
  for (const forbidden of [
    new RegExp(`customerName|firstName|lastName|account${'Number'}|street${'Address'}`, 'i'),
    new RegExp(`customer_${id}|renewal_${id}|branch_${id}|offer_${id}`, 'i'),
    /advisor|borrower|applicant/i,
  ]) {
    assert.doesNotMatch(source, forbidden);
    assert.doesNotMatch(page, forbidden);
  }
});

test('recommendations are explicitly subject to human approval', () => {
  assert.match(source, /recommendation until an authorized human approves/i);
  assert.match(source, /not factual evidence of intent, affordability, eligibility, or suitability/i);
  assert.match(page, /derived attrition signals/i);
  assert.match(page, /offer-approval coverage/i);
});
