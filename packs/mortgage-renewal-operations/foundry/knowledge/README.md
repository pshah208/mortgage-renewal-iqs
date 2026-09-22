# Mortgage Renewal Operations knowledge

This directory contains domain-owned, static knowledge for the Mortgage Renewal
Operations IQ pack. It is organized for retrieval by intent rather than by
legacy deployment surface:

- `pages/` - stable domain concepts, measures, source authorities, and model
  interpretation.
- `playbooks/` - operational ways to prioritize, prepare, and escalate work.
- `policies/` - the ten fictional renewal policies, one document per policy.
- `procedures/` - repeatable procedures for evidence, cutoff, escalation, and
  disclosure.
- `reference/` - terminology, approval roles, and source/citation conventions.
- `scenarios/` - narrative test prompts that require joining sources without
  embedding their answers in seed data.

The source corpus is synthetic and has a default cutoff of **2026-08-03**.
Policy IDs, effective dates, and owner roles are preserved from the approved
fictional policy corpus. No tenant identifiers, secrets, deployment commands,
customer records, or personal identity mappings belong in this knowledge base.

## Retrieval guidance

Retrieve the smallest set of documents that answers the question. Use policy
documents for permission and authority, pages for definitions and measures,
playbooks for operational sequencing, and procedures for evidence or escalation
steps. Always distinguish observed facts, derived signals, and recommendations.

## Privacy and disclosure policy

This pack is a decision-support aid, not a customer-record system. File-level
outputs must be limited to an authorized operational audience and only the
minimum fields necessary for the task. Do not publish customer names, household
balances, account relationships, credit information, or free-text circumstances
in reusable examples or summaries. Use aggregated, de-identified results for
management reporting.

Renewal communications must explain the payment change, available terms, the
consequence of inaction, and any material conditions in plain language.
English and French content must be equivalent and current. Advisors must not
advise a customer to sell property; they must use approved language and refer
the customer to advice-qualified staff. Compliance reviews scripts, handouts,
and automated communications before deployment or scale-up.
