# doc-audit — Design Spec

> **Status:** Draft for review
> **Date:** 2026-06-01
> **Author:** Cristian Chiorescu
> **Reference:** [`Volaris-AI/code-audit`](https://github.com/Volaris-AI/code-audit)

## 1. Purpose & Context

`doc-audit` is a portable, **offline-first documentation auditor** for a
software repository. It assesses the quality of a codebase's documentation
across several dimensions, scores each on a 1–5 maturity scale, and produces a
**Documentation Health scorecard + prioritized improvement roadmap**.

- **Primary audience / use case:** *Dev-team improvement.* The deliverable is a
  constructive, actionable report aimed at the target company's own engineers —
  not a pass/fail gate. It tells them what's missing, what's weak, and what to
  fix first, with concrete file references.
- **Distribution model:** A small **prompts-only zip** that can be handed to
  another company and run **fully offline**, by pointing any agent CLI (Claude
  Code, Cursor, Cline, etc.) at an entrypoint prompt. No install, no internet,
  no telemetry. This mirrors code-audit's "prompts-only zip" transport.
- **Design stance:** Deliberately the **lightweight slice** of the code-audit
  pattern. Same template/agent/entrypoint format, ~80% less machinery (no Python
  orchestrator, no LLM adapters, no Docker, one genre instead of four).

### What gets audited (scope)

All four kinds of documentation:

1. **In-code documentation** — docstrings/comments on public functions, classes,
   modules; comment quality (explains *why*, not *what*).
2. **Repo & project documentation** — README, onboarding, architecture/design
   docs, contributing guides, changelog.
3. **API reference documentation** — OpenAPI/Swagger, generated reference,
   endpoint/parameter/response docs.
4. **User & developer guides** — tutorials, how-tos, docs sites, troubleshooting.

## 2. How it borrows from code-audit

code-audit is a deterministic scaffold wrapped around non-deterministic LLM
prose. The reusable ideas:

| Idea (from code-audit) | Reused in doc-audit? |
|---|---|
| Templates = markdown + YAML frontmatter declaring **relevance** + sections to fill | ✅ |
| Agent specs (`*.agent.md`) — model-agnostic persona + workflow | ✅ |
| **Evidence-or-skip / never-fabricate** rule (cite real `file:line`) | ✅ |
| Offline-first **`entrypoint.md` Step-0 lookup** for templates/agents | ✅ |
| Reviewer agent → aggregated `executive-overview.md` | ✅ |
| **Weighted scoring** with proportional weight redistribution for skipped items | ✅ |
| Prompts-only zip + slash command + build script | ✅ |
| Maturity-dimension scoring (as used by code-audit's *infrastructure* genre) | ✅ (this is the model, not severity counts) |
| Python orchestrator / `agents.py` control flow | ❌ — the agent orchestrates by following the entrypoint |
| LLM adapters (`anthropic-api`, `openai-api`, `claude-cli`, `stub`) | ❌ |
| `score.py` deterministic math | ❌ for v1 — computed in-prompt by the reviewer (see §5) |
| Docker, wheel, full-bundle zip | ❌ — prompts-only zip only |
| Multi-genre fan-out (security/team/hosting), git-blame attribution | ❌ — one `documentation` genre |
| 60 templates | ❌ — 6 dimension templates |

## 3. Architecture

A single genre, `documentation`. An agent reads `prompts/entrypoint.md`, which
drives the whole run:

```
1. Locate templates + agent specs (offline Step-0 lookup, co-located in the zip)
2. Read config (doc-audit-config.yml) or use baked-in defaults
3. Walk the target repo (respect exclude paths)
4. Detect signals (languages present, API surface, docs tooling)
5. For each dimension template:
     a. Skip if not relevant (e.g. api-reference with no API surface)
     b. Investigate with read-only file/search tools — gather evidence
     c. Score the dimension 1–5 against its rubric
     d. Write the filled template to doc-audit/<TODAY>/documentation/<name>.md
6. Run the doc-reviewer agent:
     - read all filled templates
     - compute weighted 0–100 Documentation Health Score
     - write executive-overview.md (scorecard + improvement roadmap)
7. Write doc-audit-metadata.json
```

There is **no custom tool sandbox** — the agent CLI's own read/grep/glob tools
are used, plus best-effort read-only `git log`/`git show`/`git blame` as an
evidence source for change-history and freshness (always cited; skipped when no
git history exists — this is evidence-gathering, not the dropped team/blame genre).
The entrypoint instructs read-only behavior and confines writes to the output
directory.

### Determinism boundary

| Layer | Deterministic? |
|---|:-:|
| Template loading + relevance gating | ✅ |
| Repo walk + exclude paths | ✅ |
| Scoring rubric + weights + weighted-average formula | ✅ (defined; math is mechanical) |
| Output schema (paths, JSON keys) | ✅ |
| LLM-assigned dimension scores + prose | ❌ |

## 4. Repository layout (the tool itself)

```
doc-audit/                              # this project (its own git repo, ~/Documents/doc-audit)
├── README.md                           # incl. the "Future / upgrade path" section (§8)
├── prompts/
│   └── entrypoint.md                   # offline-first driver
├── commands/
│   └── doc-audit.md                    # /doc-audit Claude Code slash command
├── agents/
│   ├── doc-auditor.agent.md            # fills dimension templates
│   └── doc-reviewer.agent.md           # aggregates → scorecard + roadmap
├── audits/
│   └── documentation/                  # the dimension templates + exec summary
│       ├── in-code-documentation.md
│       ├── readme-onboarding.md
│       ├── architecture-design.md
│       ├── api-reference.md
│       ├── user-developer-guides.md
│       ├── contributing-changelog.md
│       └── executive-summary.md        # reviewer output template (always-include)
├── doc-audit-config.yml                # optional: weights, exclude paths, dimensions on/off
├── docs/
│   ├── ARCHITECTURE.md                 # internal design (mirrors §3, §8 upgrade path)
│   └── SCORING.md                      # the rubric + weights, documented
└── scripts/
    └── build-release-bundle.sh         # → dist/doc-audit-<VER>-prompts.zip
```

> The `audits/documentation/` nesting is kept (rather than a flat `templates/`)
> so the layout drops straight into code-audit as a genre later (see §8). A flat
> layout is an acceptable simplification if preferred.

## 5. Scoring model — maturity dimensions

- The **doc-auditor** scores each dimension **1–5** from gathered evidence,
  against a rubric embedded in that dimension's template frontmatter (anchors for
  what level 1, 3, and 5 look like).
- The **doc-reviewer** computes the overall **Documentation Health Score (0–100)**:

  ```
  health = Σ ( (dimension_score / 5) × 100 × weight ) / Σ weight
  ```

  Skipped dimensions are dropped from `Σ weight` (their weight redistributes
  proportionally — identical to code-audit's `overall_score`).

- **Default weights (sum = 100):**

  | Dimension | Weight |
  |---|---:|
  | in-code-documentation | 25 |
  | readme-onboarding | 20 |
  | api-reference | 20 |
  | architecture-design | 15 |
  | user-developer-guides | 12 |
  | contributing-changelog | 8 |

  All weights are overridable in `doc-audit-config.yml`.

- **Bands:** 90–100 Excellent · 75–89 Good · 55–74 Fair · 30–54 Poor · 0–29 Critical.

- **Determinism note:** the rubric and weights are fixed and the weighted average
  is mechanical; only the per-dimension score assignment and prose vary between
  runs. A future `score.py` (Phase 3) can lock the math entirely.

## 6. The six dimension templates

Each template has YAML frontmatter (`relevance` rules + the 1–5 rubric anchors)
and a body with: an assessment checklist, an **Evidence table** (`file:line`),
**Strengths**, **Gaps**, and **Actionable Recommendations** split into *quick
wins* vs *larger efforts*. Because the goal is dev-team improvement, output is
recommendation-heavy with concrete examples.

| Template | Covers (scope) | Relevance gating |
|---|---|---|
| `in-code-documentation` | In-code docstrings/comments, coverage & quality | always-include |
| `readme-onboarding` | README, install/build/run/test/configure, "new dev running in <30 min?" | always-include |
| `architecture-design` | ARCHITECTURE doc, ADRs, diagrams, module/data-flow docs | always-include |
| `api-reference` | OpenAPI/Swagger, generated reference, endpoint/param/response docs, examples | **gated** — include only if an API surface is detected (OpenAPI/Swagger files, REST/GraphQL/RPC routes); otherwise skip with reason |
| `user-developer-guides` | Tutorials, how-tos, docs site (mkdocs/docusaurus/sphinx), troubleshooting/FAQ | always-include |
| `contributing-changelog` | CONTRIBUTING/contribution workflow, LICENSE clarity, discoverable change history (CHANGELOG or git/releases) | always-include |

**Evidence & anti-fabrication:** the auditor cites real file paths/lines.
"Documentation absent" is itself a valid, evidence-backed finding (point at the
missing docstring location or missing file). Never invent documentation content.
Anything requiring human judgement is marked as such.
Freshness is assessed for every dimension — stale or contradicted docs are a Gap that lowers the score, with git last-modified vs code churn as an optional corroborating signal.

## 7. Outputs (land in the target repo)

```
doc-audit/<TODAY>/
├── documentation/
│   ├── in-code-documentation.md        # filled, evidence-backed
│   ├── readme-onboarding.md
│   ├── architecture-design.md
│   ├── api-reference.md                # only if API detected
│   ├── user-developer-guides.md
│   └── contributing-changelog.md
├── executive-overview.md               # the deliverable (below)
└── doc-audit-metadata.json             # dimensions run/skipped, files scanned, languages
```

`doc-audit` is added to default exclude paths so a re-run never scans its own
output.

### `executive-overview.md` (the deliverable)

Tuned for dev-team improvement:

1. **Documentation Health Score** (0–100) + band.
2. **Dimension heatmap** — table of each dimension's 1–5 score, weight, status (🟢/🟡/🔴).
3. **Top strengths** — what's already good (so it's not all negative).
4. **Top weaknesses** — the 3 most significant gaps at a glance (the *what's-most-wrong*, distinct from the roadmap's *what-to-do*).
5. **Improvement Roadmap** — the core. Grouped by horizon:
   - 🟢 **Quick wins (0–1 week)** — concrete, low-effort, high-leverage fixes.
   - 🟡 **Short-term (1–4 weeks)**.
   - 🟠 **Larger initiatives (1–3 months)**.
   Each item: what to do, where (`file:line`/path), impact, effort.
6. **Coverage snapshot** — files scanned, languages, which docs exist vs missing.

## 8. Future / upgrade path (must appear in README + ARCHITECTURE.md)

doc-audit is intentionally the lightweight, prompts-only slice of the code-audit
pattern. Because the template/agent/entrypoint format is identical, it can be
upgraded toward the full code-audit architecture later **without rework**:

- **Add a Python orchestrator + LLM adapters + CLI** (`run` / `review` / `init`)
  for deterministic, scriptable CI runs.
- **Lock the scoring math in `score.py`** instead of computing it in-prompt.
- **Add Docker + full-bundle/wheel distribution** alongside the prompts-only zip.
- **Or fold `documentation` in as a genre inside code-audit itself** — the
  `audits/documentation/` + `agents/doc-*.agent.md` layout drops straight in.

This note is a required deliverable, not optional flavour.

## 9. Distribution & offline operation

- `scripts/build-release-bundle.sh` produces `dist/doc-audit-<VER>-prompts.zip`
  containing `prompts/`, `commands/`, `agents/`, `audits/`, `docs/`, a
  `README.txt` quickstart, and `checksums.txt`.
- The recipient runs, fully offline:

  ```bash
  cd /path/to/their-repo
  claude "Read ~/Downloads/doc-audit-<VER>-prompts/prompts/entrypoint.md and follow it" \
    --add-dir ~/Downloads/doc-audit-<VER>-prompts
  ```

  Or copies `commands/doc-audit.md` into `.claude/commands/` and types `/doc-audit`.
- **Offline guarantee:** `entrypoint.md` Step-0 finds templates co-located in the
  extracted zip — no network. Outputs are local files. The only network call is
  the agent's own LLM request; if blocked, run on a connected host and copy the
  output folder back.

## 10. Configuration (`doc-audit-config.yml`, optional)

All keys optional; defaults baked into the entrypoint.

```yaml
dimensions:
  in-code:               { enabled: true }
  readme-onboarding:     { enabled: true }
  architecture-design:   { enabled: true }
  api-reference:         { enabled: auto }   # auto = include only if API surface detected
  user-developer-guides: { enabled: true }
  contributing-changelog:{ enabled: true }
scan:
  exclude-paths: [node_modules, vendor, dist, build, .git, __pycache__, doc-audit]
review:
  weights:
    in-code: 25
    readme-onboarding: 20
    api-reference: 20
    architecture-design: 15
    user-developer-guides: 12
    contributing-changelog: 8
output:
  directory: doc-audit
```

## 11. Phasing

1. **Phase 1 — substance:** the 6 dimension templates + `executive-summary.md`,
   the 2 agent specs, `entrypoint.md`, the `/doc-audit` slash command, baked-in
   config defaults.
2. **Phase 2 — package & prove:** `build-release-bundle.sh`, `README.md`
   (incl. §8 upgrade note), `docs/ARCHITECTURE.md`, `docs/SCORING.md`, and a
   real validation run against a sample repo to confirm output shape.
3. **Phase 3 — optional, later:** thin Python CLI + deterministic `score.py` +
   CI templates (the upgrade path in §8).

## 12. Out of scope (v1)

- Python CLI, LLM adapters, Docker, wheel/full-bundle zip.
- Multi-genre auditing (security/team/hosting) — that's code-audit's job.
- Git-blame attribution of documentation gaps.
- Cross-company aggregation / portfolio benchmarking dashboard.
- Auto-fixing / generating the missing documentation (audit only, not authoring).

## 13. Success criteria

- A single prompts-only zip runs end-to-end offline in Claude Code against an
  arbitrary repo and produces `doc-audit/<TODAY>/` with filled dimension reports,
  an `executive-overview.md` carrying a 0–100 score + a prioritized roadmap, and
  metadata.
- Every finding cites a real path/line; no fabricated documentation content.
- Irrelevant dimensions (e.g. `api-reference` on a non-API repo) are skipped with
  a recorded reason, and their weight is redistributed.
- A non-engineer can follow `README.txt` to hand the zip to a company and get a
  report back.
```
