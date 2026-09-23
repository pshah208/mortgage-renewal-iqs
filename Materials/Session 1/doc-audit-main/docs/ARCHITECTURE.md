# Architecture

`doc-audit` is a deterministic scaffold (templates + agent specs + an entrypoint)
wrapped around a non-deterministic LLM. The agent CLI does the orchestration by
following `prompts/entrypoint.md`; there is no Python runtime for consumers.

## What runs during an audit

1. The agent reads `prompts/entrypoint.md`.
2. It locates `audits/` + `agents/` (offline Step-0 lookup — co-located in the zip).
3. Reads `doc-audit-config.yml` (or baked-in defaults).
4. Walks the repo, detects languages / API surface / docs tooling.
5. For each relevant dimension template, follows `agents/doc-auditor.agent.md`
   to gather evidence, judge freshness, and assign a **strict, freshness-gated**
   1–5 score. These are working notes — **no per-dimension file is written.**
6. Follows `agents/doc-reviewer.agent.md` to compute the weighted 0–100 score and
   write the **single** report, `executive-overview.md` (score + heatmap +
   per-dimension mini-summaries; no improvement roadmap).
7. Writes `doc-audit-metadata.json`.

> Evidence comes from the agent CLI's read-only file/search tools, plus best-effort
> read-only `git log`/`git show`/`git blame` where git history is present (used for
> change-history and freshness signals, and always cited). Excluding `.git` removes it
> from the file walk only, not from git commands.

## Determinism boundary

| Layer | Deterministic? |
|---|:-:|
| Template loading + relevance gating | ✅ |
| Repo walk + exclude paths | ✅ |
| Rubric (strict + freshness cap) + weights + weighted-average formula | ✅ |
| Output schema (single `executive-overview.md` + metadata) | ✅ |
| LLM-assigned scores + freshness judgement + prose | ❌ |

## Dev tooling

`scripts/validate.py` (stdlib only) enforces structural invariants on the assets
(frontmatter keys, rubric levels, required body headers, weight sum = 100, and
cross-file wiring). It is a dev-time tool and is **not** shipped in the zip.

## Future / upgrade path

doc-audit is the lightweight, prompts-only slice of the code-audit pattern; the
asset format is identical, so it can be grown into the full code-audit
architecture without rework:

- Add a Python orchestrator + LLM adapters + CLI for deterministic CI runs.
- Lock the scoring math in a `score.py` instead of computing it in-prompt.
- Add Docker + full-bundle/wheel distribution alongside the prompts-only zip.
- Or fold `documentation` in as a genre inside code-audit itself.
