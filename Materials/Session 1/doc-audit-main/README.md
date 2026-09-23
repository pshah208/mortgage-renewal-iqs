# 📚 doc-audit

> Portable, offline, LLM-driven **documentation** auditor. Point any agent CLI at
> a repository and get a Documentation Health scorecard (0–100) with a strict,
> freshness-gated assessment of each dimension — no install, no internet.

`doc-audit` is the lightweight, prompts-only sibling of
[`Volaris-AI/code-audit`](https://github.com/Volaris-AI/code-audit). It assesses
documentation across five dimensions with a **deliberately strict, freshness-gated**
rubric: presence is not credit, and stale docs are penalised harder than honest gaps.

## What gets assessed

| Dimension | What it covers | Weight |
|---|---|---:|
| In-Code Documentation | Docstrings/comments on public APIs; intent over restatement | 27% |
| README & Onboarding | Can a new dev clone and run it in <30 min? | 22% |
| API Reference | OpenAPI/Swagger/GraphQL/endpoint docs (only if an API exists) | 22% |
| Architecture & Design | Overview, module responsibilities, ADRs, diagrams | 16% |
| User & Developer Guides | Tutorials, how-tos, docs site, troubleshooting | 13% |

Each dimension is scored **1–5** against a strict rubric, then combined into a
weighted **Documentation Health Score (0–100)**. Scoring is harsh on purpose:
shallow or partial docs land at 2–3, and **any stale or code-contradicting doc
caps its dimension at 3**. See [`docs/SCORING.md`](docs/SCORING.md).

## Run it (offline)

```bash
cd /path/to/your-repo
claude "Read /path/to/doc-audit/prompts/entrypoint.md and follow it" \
  --add-dir /path/to/doc-audit
```

Or copy `commands/doc-audit.md` into `.claude/commands/` and type `/doc-audit`.

Output lands in `<your-repo>/doc-audit/<TODAY>/` — a **single report**, no
per-dimension files and no improvement roadmap:
```
doc-audit/<TODAY>/
├── executive-overview.md      # score + heatmap + a mini-summary per dimension
└── doc-audit-metadata.json
```

## Package & hand off

```bash
./scripts/build-release-bundle.sh v0.1.0   # → dist/doc-audit-0.1.0-prompts.zip
```

Hand the zip to any team; they extract it and run the command above. Fully
offline — the only network call is the agent's own LLM request.

## Future / upgrade path

doc-audit is intentionally the **lightweight, prompts-only slice** of the
code-audit pattern. Because the template/agent/entrypoint format is identical, it
can be upgraded toward the full [code-audit](https://github.com/Volaris-AI/code-audit)
architecture later **without rework**:

- **Add a Python orchestrator + LLM adapters + CLI** (`run` / `review` / `init`)
  for deterministic, scriptable CI runs.
- **Lock the scoring math in `score.py`** instead of computing it in-prompt.
- **Add Docker + a full-bundle/wheel distribution** alongside the prompts-only zip.
- **Or fold `documentation` in as a genre inside code-audit itself** — the
  `audits/documentation/` + `agents/doc-*.agent.md` layout drops straight in.

## Repo layout

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
