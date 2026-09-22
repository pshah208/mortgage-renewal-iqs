# Mortgage Renewal Operations dataset

Primary locale: en-CA. Reference organization: Canadian Financial Corporation
(fictional).

The current seed assets are a small demonstration dataset. They establish a
contract-first pack model and must not be represented as production banking records,
market pricing, customer advice, or an authorized lending decision.

## 1. Domain thesis

A mortgage renewal is a time-bounded relationship decision, not a standalone rate
quote. The customer experiences the renewal through payment change, maturity timing,
service quality, and competing offers; the bank experiences it as retained balance,
relationship value, margin discipline, and an accountable exception process.

The pack therefore puts one `renewal_id` at the center of the model. Customer and
branch context explain who is affected; dated renewal facts describe the actual
workflow; risk scores surface model-derived signals; and the offer catalogue defines
the boundaries of a possible retention response. These layers must remain distinct:
a risk score is not a decision and an offer recommendation is not an approved price.

| Thesis decision | Value |
|---|---|
| Segment | Canadian retail-bank residential mortgage renewals |
| Unit of account | Customer relationship -> mortgage renewal -> permitted retention offer |
| Customer | Individual mortgage customer, served by an assigned advisor and branch |
| Objective | Retain suitable mortgage relationships while keeping pricing and approval authority human |
| Jurisdiction | Canada, en-CA demonstration model |
| Time grain | Renewal snapshot and risk-score assessment date; maturity and origination dates |
| Planning horizon | Maturity window, normally the next 180 days |
| Primary variability | Payment shock, competitor rate gap, rate-shopping signal, tenure, digital engagement, service history, relationship depth, and branch capacity |
| Human authority | Advice, suitability, discretionary pricing, exceptions, and final offer approval |

## 2. Source authorities and logical domains

Each relation is assigned to exactly one logical authority. The assignment mirrors the
Accelerator's established separation of governed reference data, operational systems
of record, and derived signal stores; it does not claim the legacy CSVs originate from
those products today.

### Snowflake - `MORTGAGE_REFERENCE`

Governed reference and relationship context that changes more slowly than the renewal
workflow.

| Relation | Grain | Purpose |
|---|---|---|
| `customers` | One row per customer | Relationship profile, branch/advisor assignment, segment, product depth, channel, engagement, satisfaction, and preferred language |
| `branch_performance` | One row per branch as of date | Aggregated branch portfolio, capacity, retained-rate, exposure, and discount context |
| `retention_offers` | One row per offer | Approved offer parameters, segment eligibility, maximum discount, required approval level, and notes |

### PostgreSQL - `mortgage_operations`

The dated renewal workflow system of record.

| Relation | Grain | Purpose |
|---|---|---|
| `mortgage_renewals` | One row per renewal as of `as_of_date` | Mortgage terms, balance and collateral context, maturity timing, payment shock, offered renewal rate, and renewal stage |

Future upstream integration may add offer-decision events to this authority when the
shared platform supplies the appropriate governed write path. The current demo only
contains the approved offer catalogue and a recommended offer identifier in the signal
record, so it does not fabricate an operational approval event.

### Databricks - `mortgage_signals`

Derived analytic output and behavioral signals. It is intentionally separate from
operational truth because it may be recomputed.

| Relation | Grain | Purpose |
|---|---|---|
| `renewal_risk_scores` | One row per renewal scored on date | Attrition likelihood and band, drivers, competitor-rate gap, shopping/service signals, revenue exposure, lifetime value, recommended offer, and model version |

## 3. Causal model

All outcomes must be calculated from dated domain facts; no scenario answer or narrative
label belongs in a source row.

1. A maturity date within the planning horizon creates a renewal workload.
2. Current rate, offered rate, payment frequency, remaining amortization, and balance
   determine the modeled payment shock.
3. Payment shock, rate-shopping behavior, competitor rate gap, tenure, engagement,
   complaint history, and relationship depth influence the model-derived attrition
   likelihood.
4. Attrition likelihood multiplied by balance and relationship value identifies
   exposure for advisor prioritization; it does not authorize an offer.
5. Segment eligibility and the published maximum discount constrain which retention
   offers can be proposed.
6. Offer parameters and exception thresholds determine the required approving role.
7. Advisor capacity and branch-level maturity concentration affect outreach sequencing
   but never change suitability or price authority.
8. A human reviews evidence, customer circumstances, and applicable policy before
   making any advice, pricing, or exception decision. That decision must be captured
   in the operational system when the upstream platform adds the workflow contract.

## 4. Temporal cutoff

The seed data's current known cutoff is **2026-08-03**, visible in the renewal,
branch-performance, and score `as_of_date` / `scored_on` fields. Gold products must:

- treat facts dated after the selected cutoff as unavailable;
- reconstruct the current renewal state from dated operational records;
- label any projected maturity-window or attrition result as forward-looking;
- refuse a cutoff before the available history needed for a requested calculation.

Risk scores are point-in-time derived outputs. They may be used only at or after their
`scored_on` date and must retain their `model_version`.

## 5. Scale

The supplied deterministic demonstration contains 50 customer and renewal rows, eight
retention offers, and three branch-performance snapshots. It is fit for functional
testing, demonstrations, and schema validation only.

Upstream scale profiles must preserve the following invariants rather than promise row
counts:

- every renewal joins one customer and one current risk-score snapshot;
- every referenced offer exists and eligibility is explainable;
- all branch metrics reconcile to the active renewal population for the same as-of
  date;
- risk bands are derived from scores, never randomly assigned;
- a zero-high-risk branch remains in portfolio denominators.

The legacy `generate_fabric_data.py` generator is the starting point for deterministic
pack generation. Its generation controls and reproducibility checks will be moved into
the pack's `generation/` and Fabric assets in the next data checkpoint.

## 6. Safety and privacy boundaries

The seed uses fictional people and opaque `CUST-` / `RNW-` identifiers, but it contains
customer-style personal data such as names, province, language preference, advisor
assignment, relationship tenure, engagement, satisfaction, mortgage balances, property
value, and risk signals. Treat all similarly shaped production data as confidential
personal and financial information.

The pack must not generate or expose government identifiers, exact street addresses,
account numbers, credit bureau records, transaction histories, protected-class data,
or unbounded free-text advice notes.

The agent may summarize, rank, and explain available evidence. It must not:

- approve, deny, or bind a mortgage renewal, offer, exception, or interest rate;
- provide individualized financial or legal advice;
- determine affordability, creditworthiness, or eligibility;
- make or communicate an offer without a named human's review through the authorized
  banking workflow;
- treat a model score, shopping signal, or engagement score as factual evidence of
  customer intent.

Outputs must name the score date/version and evidence used, distinguish fact from
prediction, minimize customer details for the audience, and route exceptions to the
role specified by the approved offer rather than inventing authority.

## 7. Evidence and confidence

| Evidence | What it establishes | Confidence |
|---|---|---|
| `data/fabric-iq/*.csv` | Seed columns, grains, sample cardinality, and 2026-08-03 operational cutoff | High |
| `data/fabric-iq/generate_fabric_data.py` | Legacy deterministic-generation logic and derived score relationships | High |
| `data/foundry-iq/renewal_policies.json` | Existing fictional policy and pricing-guardrail content | High |
| `agent/agent_instructions*.md` | Existing interaction, connection, and decision-boundary behavior | High |
| Existing `infra/` and application deployment scripts | A functioning bespoke deployment path exists, but it is not pack-conformant ownership | High |
| Public banking regulation and policy | Not yet researched or represented as authoritative production policy | Unknown; do not infer requirements |

## 8. Pattern-selection rationale

This pack adopts the Accelerator's three-authority and cutoff-safe Gold patterns because
the domain genuinely distinguishes slow-changing governed relationship/offer reference,
operational renewal state, and recomputable predictive signals.

It deliberately does not copy business structure from the reference packs. There is no
claims model, asset topology, or retail product catalog analogue. The mortgage-domain
equivalent is customer relationship -> renewal workflow -> approved offer guardrail ->
human decision.

## 9. Related documents

- [Pack overview](README.md)
- [Deployment guide](DEPLOYMENT.md)
