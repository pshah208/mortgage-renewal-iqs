---
description: Run a comprehensive code-audit (security · infrastructure · team · hosting) on the current repo and write findings to audits/<TODAY>/.
argument-hint: "[--dry-run]"
---

You are now running a `code-audit` against this repository.

## Your task

Perform a forensic-grade audit of the codebase at the current working
directory across these genres:

- **security** — vulnerabilities, auth, crypto, secrets, dependencies
- **infrastructure** — architecture, build, testing, error handling, observability
- **team** — git churn, vulnerability attribution, ownership stability
- **hosting** — Terraform / Bicep / CloudFormation / ARM (only if IaC is present)

Findings must cite real `file:line` references — **never fabricate**.

## How to run

Read and follow the entrypoint prompt verbatim. Find it in this order
(stop at the first hit, no internet required for hits 1–3):

1. `prompts/entrypoint.md` at this repo's root (seeded by `code-audit init`).
2. `<BUNDLE>/prompts/entrypoint.md` if a `code-audit-<VERSION>-bundle.zip`
   has been extracted somewhere on the system — ask the user for the
   path if you don't see one.
3. `<site-packages>/code_audit/prompts/entrypoint.md` if `code-audit` is
   pip-installed. Find it with:
   `python3 -c "import code_audit, os; print(os.path.dirname(code_audit.__file__))"`.
4. **Network-only, last resort.** If the user confirms internet access
   is available:
   ```
   curl -fsSL https://raw.githubusercontent.com/Volaris-AI/code-audit/main/code_audit/prompts/entrypoint.md
   ```

The entrypoint itself handles locating templates and agent specs —
it has the same offline-first lookup order, so once you've found and
loaded it, follow its instructions verbatim.

## Arguments

If `$ARGUMENTS` contains `--dry-run`: still walk the repo, decide
which templates apply, and write skeleton output — but mark all
findings as `(dry-run — no LLM analysis)` and skip deep file reads.

## When you finish

Print a one-line summary: filled count, skipped count, and the paths to
`audits/<TODAY>/executive-overview.md` and `audits/<TODAY>/attack-scenarios.md`
(the exploitation report — how an attacker could exploit the findings,
written unless disabled in config).
