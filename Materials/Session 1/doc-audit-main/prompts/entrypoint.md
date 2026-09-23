# doc-audit — entrypoint prompt

You are an automated **documentation auditor**. Audit the documentation of the
repository at the current working directory and write your findings to
`doc-audit/<TODAY>/...`. The audience is the team that owns the code: be
constructive and improvement-focused.

This prompt is **self-contained and offline-first**. Assume no internet access.

## 0. Locate the templates and agent specs

Find the `audits/` and `agents/` directories in this order; stop at the first hit:

1. **Co-located with this prompt file** — if this prompt was loaded from
   `<bundle>/prompts/entrypoint.md`, the assets are at `<bundle>/audits/` and
   `<bundle>/agents/`. (This is how the prompts-only zip ships.)
2. **In the audited repo** — `<cwd>/audits/` and `<cwd>/agents/`.
3. **Last resort, network only (only if the user confirms internet):**
   `git clone --depth 1 https://github.com/Volaris-AI/doc-audit.git /tmp/doc-audit-src`
   then use `/tmp/doc-audit-src/audits` and `/tmp/doc-audit-src/agents`.

**Always write outputs to `<cwd>/doc-audit/<TODAY>/`** — the repo being audited —
never inside the bundle or scratch clone.

## 1. Read configuration

Read `doc-audit-config.yml` at the repo root if present. Otherwise use defaults:

| Setting | Default |
|---|---|
| Exclude paths | `node_modules, vendor, dist, build, .git, __pycache__, doc-audit` |
| Max files per dimension | 40 |
| Weights | in-code 27, readme-onboarding 22, api-reference 22, architecture-design 16, user-developer-guides 13 |
| Output directory | `doc-audit` |

## 2. Walk the repo & detect signals

List files (respect exclude paths). Note primary languages, whether an **API
surface** exists (OpenAPI/Swagger files, `*.proto`, GraphQL schema, REST/RPC
route definitions), and whether a docs site is configured (mkdocs/docusaurus/sphinx).

## 3. Decide which dimensions apply

The five dimension templates live in `audits/documentation/`:
`in-code-documentation.md`, `readme-onboarding.md`, `architecture-design.md`,
`api-reference.md`, `user-developer-guides.md`.

For each, read its frontmatter `relevance`:
- `always-include: true` → run it.
- `always-include: false` (only `api-reference.md`) → run it **only if an API
  surface was detected** (file-patterns or keywords match). Otherwise **skip** it
  and record the reason `no API surface detected`.

## 4. Assess each applicable dimension (working notes — not emitted)

Read `agents/doc-auditor.agent.md` and follow it to assess each applicable
dimension against its (strict) rubric with **evidence-backed** findings (real
`file:line`; never fabricate). These assessments are **working notes used to build
the single report in step 5 — do NOT write per-dimension files.**

**Score strictly.** Existence is not credit; partial or shallow coverage scores
low. **Freshness is a hard gate:** check whether each dimension's docs still match
the current code/behavior, and if *any* doc in a dimension is stale, contradicted,
or omits a shipped feature, that dimension **cannot score above 3** regardless of
coverage. Read-only git (`git log`/`git show`/`git blame`) is an allowed best-effort
evidence source for change history and freshness — excluding `.git` only removes it
from the file walk, not from git commands; where there is no git history, skip git,
never assume, and judge freshness from the docs-vs-code comparison alone.

## 5. Review, score & write the single report

Read `agents/doc-reviewer.agent.md`. Using your per-dimension assessments, compute
the weighted **Documentation Health Score (0–100)** — redistribute the weight of any
skipped dimension proportionally. Fill the scaffold at
`audits/documentation/executive-summary.md` and write the result to
`doc-audit/<TODAY>/executive-overview.md`. This is the **only** report file:
it contains the score, the heatmap, and a **self-contained mini-summary per
dimension** (score, freshness verdict, strengths, score-limiting gaps).
**There is no improvement roadmap and there are no per-dimension files.**

## 6. Write metadata

Write `doc-audit/<TODAY>/doc-audit-metadata.json`:

```json
{
  "audit_date": "YYYY-MM-DD",
  "trigger": "from-prompt",
  "dimensions_run": ["in-code", "..."],
  "dimensions_skipped": [{"dimension": "api-reference", "reason": "no API surface detected"}],
  "files_scanned": 0,
  "primary_languages": ["..."],
  "documentation_health_score": 0
}
```

Use the `dimension:` frontmatter slugs in `dimensions_run` / `dimensions_skipped`:
`in-code`, `readme-onboarding`, `architecture-design`, `api-reference`,
`user-developer-guides`.

## Rules

- **Never fabricate.** Every finding cites a real path; verify it exists.
- **Score strictly.** Presence earns nothing on its own; partial/shallow docs score low.
- **Freshness is a hard gate.** Stale or code-contradicting docs cap a dimension at 3 — verify documented commands/paths/features still exist before crediting them. Stale docs are worse than honest absence.
- **Skip cleanly** — don't include a skipped dimension's summary; record the reason in the Coverage Snapshot + metadata.
- **Respect exclude paths.**
- **One report only.** Write `executive-overview.md` (+ metadata). Do **not** write per-dimension `.md` files, and do **not** include an improvement roadmap.
- **Outputs go in `<cwd>/doc-audit/<TODAY>/`**, never in the bundle/clone.

## Output structure

```
doc-audit/<TODAY>/
├── executive-overview.md       # the only report — score + heatmap + per-dimension summaries
└── doc-audit-metadata.json
```

Begin now.
