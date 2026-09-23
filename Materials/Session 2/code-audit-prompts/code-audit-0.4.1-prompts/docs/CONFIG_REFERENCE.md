# `code-audit-config.yml` reference

Drop a `code-audit-config.yml` (or its `.yaml` / `.json` variant) at
your repo root. The legacy `.github/audit-config.yml` location from
the original `gh-audit` era is still read as a fallback. **All keys
are optional**; defaults apply to anything you don't override.

## Schema

```yaml
genres:
  security:
    enabled: true                 # true | false | "auto"
    skip: []                       # template names (without .md) to skip
    force-include: []              # always include even if relevance-detect skips
  infrastructure:
    enabled: true
    skip: []
  team:
    enabled: auto                  # "auto" = enabled iff git history exists
    skip: []
    assessment-window: "2 months"  # for churn metrics
  hosting:
    enabled: auto                  # "auto" = enabled iff AWS or Azure IaC detected
    skip: []

scan:
  exclude-paths:                   # directories never visited
    - node_modules
    - vendor
    - dist
    - build
    - .git
    - __pycache__
  max-files-per-template: 30       # cap evidence sampling per template
  max-lines-per-file: 500          # truncate very long files in prompts

review:
  health-score-weights:            # must sum to ~100; redistributed when a genre is skipped
    security: 35
    infrastructure: 30
    team: 20
    hosting: 15

  rubric-thresholds:               # override the default 5-level rubric per genre (rare)
    # see docs/ARCHITECTURE.md for the full default rubric
    security: { ... }
    infrastructure: { ... }
    team: { ... }
    hosting: { ... }

output:
  directory: audits                # relative to repo root

llm:
  adapter: claude-cli              # stub | claude-cli | anthropic-api | openai-api
  model: claude-sonnet-4-6         # adapter-specific model name
  timeout_sec: 900                 # per-call timeout (raised in 0.2.1 for tool-use)
  max_retries: 2                   # adapter retries on transient errors
  per_call_budget_usd: 1.0         # hard ceiling per LLM call
  total_budget_usd: 50.0           # hard ceiling per audit run
```

## Field-by-field

### `genres.<genre>.enabled`

| Value | Meaning |
|---|---|
| `true` | Run unconditionally |
| `false` | Skip; recorded in `genres_skipped` with reason `disabled in config` |
| `"auto"` | Auto-detect (team: any git history; hosting: AWS/Azure IaC) |

### `genres.<genre>.skip`

List of template basenames (without `.md`). Templates in this list
are skipped even if their `relevance` block matches.

```yaml
genres:
  security:
    skip: [mobile, voice, ai]   # we have no mobile/voice/ai code
```

### `scan.exclude-paths`

Directory names (not globs) that the codebase walker will refuse to
descend into. Default list covers the most common vendored/build
output dirs.

### `scan.max-files-per-template`

Cap on how many in-scope files the LLM is shown per template. Keeps
prompt length and cost bounded.

### `review.health-score-weights`

Genre weights for the overall 0–100 health score. If a genre is
skipped, its weight is **redistributed proportionally** across the
genres that did run.

### `llm.adapter`

| Adapter | Notes |
|---|---|
| `stub` | Returns canned text; for plumbing tests only |
| `claude-cli` | Subprocesses `claude -p` — uses host Claude Code OAuth |
| `anthropic-api` | Uses `anthropic` SDK + `ANTHROPIC_API_KEY` |
| `openai-api` | Uses `openai` SDK + `OPENAI_API_KEY` |

### `llm.model`

Adapter-specific. Defaults:

| Adapter | Default |
|---|---|
| `claude-cli` | `claude-sonnet-4-6` |
| `anthropic-api` | `claude-sonnet-4-6` |
| `openai-api` | `gpt-4o` |

### `llm.total_budget_usd` and `llm.per_call_budget_usd`

Cost guardrails. When `total_budget_usd` is reached during a run,
remaining templates are skipped with `budget cap reached` recorded
in metadata. `per_call_budget_usd` is enforced per LLM call where
the adapter supports it (currently `claude-cli`).

## Override precedence

CLI flags > env vars > config file > defaults.

| Setting | CLI flag | Env var | Config field |
|---|---|---|---|
| Adapter | `--adapter` | `CODE_AUDIT_ADAPTER` | `llm.adapter` |
| Model | `--model` | `CODE_AUDIT_MODEL` | `llm.model` |
| Budget cap | `--max-budget-usd` | — | `llm.total_budget_usd` |
| Output dir | `--out` | — | `output.directory` |
| Genres filter | `--genres` | — | (per-genre `enabled`) |
| Skip templates | `--skip` | — | `genres.<g>.skip` |

## Examples

### Minimal: pin model + budget

```yaml
llm:
  model: claude-sonnet-4-6
  total_budget_usd: 25.0
```

### Skip mobile + voice templates

```yaml
genres:
  security:
    skip: [mobile, voice]
```

### Custom genre weights (security-heavy shop)

```yaml
review:
  health-score-weights:
    security: 60
    infrastructure: 25
    team: 10
    hosting: 5
```

### Use OpenAI gpt-4o instead of Claude

```yaml
llm:
  adapter: openai-api
  model: gpt-4o
```
