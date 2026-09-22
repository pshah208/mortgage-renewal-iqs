# Mortgage Renewal Operations deployment

This document records choices specific to the Mortgage Renewal Operations pack. In the
upstream IQ Accelerator, the shared platform owns deployment lifecycle, subscription
safety, credentials, Fabric and Foundry provisioning, web hosting, receipts, and
destruction. This standalone repository cannot reproduce that ownership model.

## Current migration status

This repository contains a bespoke Azure deployment implementation:

- root `deploy.ps1` and `set_tool_allowlist.py`;
- `infra/` Bicep templates and parameters;
- `app/deploy.ps1` and `app/infra/` templates/scripts;
- legacy Fabric and Foundry deployment helpers under `data/` and `agent/`.

These artifacts are preserved and remain usable as a legacy demonstration path. They
are **not pack concerns** under `iq-accelerator-main/docs/industry-packs.md` and are
not moved into `packs/mortgage-renewal-operations/`. In particular, the pack must not
own arbitrary Azure creation, Entra credential generation, Container Apps wiring,
ACR mechanics, subscription safety, or deployment recovery.

## Required upstream integration

When contributing the pack to `mcaps-microsoft/iq-accelerator`:

1. implement the typed adapter under `src/iq_accelerator/packs/`;
2. add its lazy registry entry in `src/iq_accelerator/packs/registry.py`;
3. bind this pack's source, Fabric, Foundry, expected-outcome, and overlay paths to
   the shared typed contracts;
4. add an SDK deployment example under the repository's shared deployment
   configuration conventions;
5. validate the pack, generate twice and compare manifests, then exercise the
   authorized shared lifecycle.

Do not create a local imitation of that SDK in this repository: it would create an
incompatible second platform and would not supply the shared lifecycle it is intended
to use.

## Source authorities

| Authority | Namespace | Current seed relations | Pack behavior |
|---|---|---|---|
| Snowflake | `MORTGAGE_REFERENCE` | `customers`, `branch_performance`, `retention_offers` | Governed reference mirror or generated fallback |
| PostgreSQL | `mortgage_operations` | `mortgage_renewals` | Operational renewal workflow mirror or generated fallback |
| Databricks | `mortgage_signals` | `renewal_risk_scores` | Derived-signal mirror or generated fallback |

The CSV assets are demonstration inputs, not connection configuration. Credentials,
endpoints, subscription IDs, tenant IDs, and connection strings must be supplied only
by the upstream shared deployment configuration and never committed to pack files.

## Pack features and operational limits

This version declares no optional pack-owned MCP component. The existing bespoke app
and agent integrations are retained outside the pack pending a shared-platform
assessment; they must not be treated as a license to add arbitrary pack deployment
scripts.

Any production deployment must preserve the safety boundaries in `DATASET.md`: scores
remain derived evidence, while lending, pricing, exception, offer, and advice decisions
remain authorized human actions recorded through the bank's approved systems.

## Verification after upstream integration

- Validate all selected source contracts and nonzero generated/mirrored rows.
- Verify cutoff-safe Gold renewal and branch products reconcile to their source as-of
  dates.
- Confirm the semantic smoke query returns a maturity-window view without exposing
  unneeded customer details.
- Validate Foundry responses include source date/model version and decline to make
  lending or pricing decisions.
- Build and type-check the selected shared web overlay once its runtime is available.

## Related documents

- [Pack overview](README.md)
- [Dataset guide](DATASET.md)
