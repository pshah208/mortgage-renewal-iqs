# Mortgage Renewal Operations

Reference organization: Canadian Financial Corporation (fictional). Primary locale:
en-CA.

This pack models a Canadian retail-bank mortgage renewal portfolio. Its operating
question is not simply which mortgages are maturing, but which renewing relationships
need timely, permitted, evidence-based retention action.

The data model joins relationship context, the dated renewal workflow, approved
retention offers, and explicitly derived attrition signals. A branch or advisor can
prioritize outreach and explain a recommendation, but a named authorized human remains
responsible for pricing, exceptions, and customer advice.

## Scope

- Five source relations across governed reference, operational workflow, and derived
  signals authorities.
- A dated renewal spine: one row per renewal as of its recorded assessment date.
- Deterministic legacy seed assets currently covering a 50-customer demonstration
  portfolio, with no real customer data asserted by this pack.
- Foundry, Fabric, and overlay assets are added in staged checkpoints.

## Explicit standalone limitations

This repository is a migration workspace, not the IQ Accelerator monorepo. It has no
shared `src/iq_accelerator` typed contracts, lazy pack registry, deployment CLI, or
shared Puck runtime. The typed Python adapter and registry registration are therefore
deferred to the upstream contribution rather than duplicated locally.

The existing `infra/`, root `deploy.ps1`, `set_tool_allowlist.py`, and `app/infra/`
remain intact as a working bespoke deployment path. They are deliberately outside this
pack because the Accelerator contract reserves cloud infrastructure and deployment
lifecycle ownership to its shared platform.

## Related documents

- [Dataset guide](DATASET.md)
- [Deployment guide](DEPLOYMENT.md)
