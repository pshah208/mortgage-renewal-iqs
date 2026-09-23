---
description: Audit this repository's documentation quality and write a single Documentation Health scorecard to doc-audit/<TODAY>/executive-overview.md.
argument-hint: ""
---

You are now running a `doc-audit` against this repository.

## Your task

Audit the documentation of the codebase at the current working directory across
five dimensions (in-code, README/onboarding, architecture/design, API reference,
user/developer guides) and score each 1–5 with a **strict, freshness-gated**
rubric: presence is not credit, and **any stale or code-contradicting doc caps its
dimension at 3**. Produce a **single** report — a Documentation Health scorecard
with a heatmap and a mini-summary per dimension (no per-dimension files, no
improvement roadmap). Findings must cite real `file:line` references — **never
fabricate**, and verify documented paths/commands still exist before crediting them.

## How to run

Read and follow the entrypoint prompt verbatim. Find it in this order (stop at
the first hit; no internet needed for hits 1–2):

1. `prompts/entrypoint.md` at this repo's root.
2. `<BUNDLE>/prompts/entrypoint.md` if a `doc-audit-<VERSION>-prompts` bundle has
   been extracted — ask the user for the path if you don't see one, and make sure
   it's added to your accessible directories.
3. **Network-only, last resort** (only if the user confirms internet):
   `curl -fsSL https://raw.githubusercontent.com/Volaris-AI/doc-audit/main/prompts/entrypoint.md`

The entrypoint locates the templates and agent specs itself (same offline-first
order). Once loaded, follow it verbatim.

## When you finish

Print a one-line summary: dimensions run, dimensions skipped, the Documentation
Health Score, and the path to `doc-audit/<TODAY>/executive-overview.md`.
