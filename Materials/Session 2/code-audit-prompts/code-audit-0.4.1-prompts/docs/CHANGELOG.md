# Changelog

## [0.4.1] — 2026-05-06

Cleanup release. Removes every `llm-audit`-name compatibility shim
introduced in 0.4.0:

- Config loader no longer reads `llm-audit-config.yml` /
  `llm-audit-config.yaml` / `llm-audit-config.json`. Only the
  `code-audit-config.*` names are accepted (plus the unrelated
  `.github/audit-config.yml` gh-audit-era fallback).
- `code-audit init` no longer special-cases an existing
  `llm-audit-config.yml`; if no `code-audit-config.yml` is present,
  one is written.
- `code-audit prompt` no longer inlines `llm-audit-config.yml`
  contents into the rendered entrypoint.
- Docs scrubbed of "still honoured" / "previously published as"
  language. CHANGELOG keeps history, but no live code path or doc
  promises continued support for the old name.

If you upgraded from `llm-audit`, rename your config file:

```bash
git mv llm-audit-config.yml code-audit-config.yml
```

## [0.4.0] — 2026-05-06

**Project rename.** `llm-audit` is now `code-audit`. The pip name,
the CLI binary, the Python package, the Docker image, the slash
command, and the GitHub repository all change in lockstep.

| Surface | Old | New |
|---|---|---|
| Pip name | `llm-audit` | `code-audit` |
| CLI binary | `llm-audit` | `code-audit` |
| Python package | `llm_audit` | `code_audit` |
| Docker image | `ghcr.io/volaris-ai/llm-audit` | `ghcr.io/volaris-ai/code-audit` |
| GitHub repo | `Volaris-AI/llm-audit` | `Volaris-AI/code-audit` (old URL still redirects) |
| Slash command | `/llm-audit` | `/code-audit` |
| Default config | `llm-audit-config.yml` | `code-audit-config.yml` |

To upgrade an existing consumer repo, swap CI references from
`llm-audit` to `code-audit` and re-seed the slash command via
`code-audit prompt --save --force`.

No behavioural changes; templates, scoring math, and adapters are
identical to 0.3.2.

## [0.3.2] — 2026-05-06

**Licence change.** First release published under the **CSI Internal
Use Licence v1.0** (replaces MIT). Use is restricted to entities
owned by Constellation Software Inc., for internal business purposes
only. See [`LICENCE.md`](LICENCE.md). All prior releases (v0.1.0
through v0.3.1) and their Docker images have been deleted to prevent
distribution of MIT-licensed artefacts.

No code or schema changes from 0.3.1.

## [0.3.1] — 2026-04-30

Patch release — docs and release-process improvements only.
No code or schema changes from 0.3.0.

- **Docs restructured to per-option flow.** `INSTALL.md` is now
  organized as one self-contained section per install option
  (pip / Docker / full bundle / prompts-only / slash command). Each
  section covers install + run linearly. `README.md` slimmed to a
  front-door overview pointing into the right INSTALL.md section.
  `docs/PROMPT_ENTRYPOINTS.md` rewritten as a deep dive without
  duplicating install commands. Net –231 lines across 7 files.
- **Stale content fixed.** `CONFIG_REFERENCE.md` `timeout_sec`
  default updated 300 → 900 (matches 0.2.1). `ARCHITECTURE.md`
  template count 56 → 60, package layout refreshed, transports
  table now lists all five (was three). `MIGRATION.md` "what's new"
  lists the five install paths and air-gap support.
- **Bundles now ship the full `docs/` directory** for offline
  reading. Air-gapped consumers no longer need GitHub access to read
  INSTALL.md / PROMPT_ENTRYPOINTS.md / CONFIG_REFERENCE.md.
- **Release workflow now uploads `*-prompts.zip`** to the GitHub
  Release alongside `*-bundle.zip`. Previously it shipped only the
  full bundle; the prompts-only bundle (added in 0.3.0) was built
  by CI but not attached to the Release. The Release body has been
  refreshed with a per-asset comparison table.

## [0.3.0] — 2026-04-30

**Breaking CLI changes** — sub-command renames for clarity.

- `kickoff` → `prompt` (the verb describes the output, not the workflow phase).
- `list-adapters` → `adapters` (terser, matches `git remote`, `docker images`).
- `init --target X` → `init [TARGET]` (positional, optional, defaults to cwd).
- Module rename: `llm_audit/kickoff.py` → `llm_audit/prompt.py`; `render_kickoff_prompt()` → `render_prompt()`.

**New: three offline-first prompt entrypoints.**

- `prompts/entrypoint.md` rewritten to be self-contained — locates
  templates next to the prompt file, in the audited repo, in
  site-packages, or (last resort) by cloning upstream. No GitHub
  access required for normal use.
- New `/llm-audit` Claude Code slash command shipped at
  `llm_audit/commands/llm-audit.md`. `llm-audit init` now seeds it
  into the consumer repo's `.claude/commands/`.
- `llm-audit prompt` gains `--slash` and `--save` flags:
  - `--slash` prints the slash-command body
  - `--save` writes `prompts/entrypoint.md` + `.claude/commands/llm-audit.md` into the repo
- Release bundle (`llm-audit-<VERSION>-bundle.zip`) now includes
  `prompts/`, `commands/`, `agents/`, `audits/` as extracted dirs —
  air-gapped consumers can run the audit without `pip install`,
  pointing their agent at `<extracted>/prompts/entrypoint.md`.
- **New `llm-audit-<VERSION>-prompts.zip`** — the minimum bundle
  (~290 KB vs. ~870 KB for the full bundle). Contains only prompts,
  commands, agents, audit templates, and a focused `README.txt`. No
  Python wheel, no installers. For portfolio companies that only
  need the prompt-only path.
- New doc: `docs/PROMPT_ENTRYPOINTS.md`.

## [0.2.2] — 2026-04-29

- Added `llm-audit review <dir>` to re-run only the executive-overview phase against an existing audit directory.
- Added `--resume` flag to `run` to skip templates whose output file already exists.
- `_strip_markdown_fence` now strips any preamble before the first `---` marker.

## [0.2.1] — 2026-04-29

- Bumped default `timeout_sec` 300 → 900 to accommodate tool-using calls on large repos.
- Added `tool_calls` counter to `AdapterResult`.

## [0.2.0] — 2026-04-28

- **Tool-use protocol** across all adapters — `read_file`, `search_code`, `list_directory`, `git_blame`.
  - `claude-cli` adapter: passes `--allowedTools Read Grep Glob --add-dir <repo_root>`.
  - `anthropic-api` adapter: multi-turn `tool_use` loop (25-turn cap).
  - `openai-api` adapter: function-calling loop (25-turn cap).
- Sandboxed `ToolHandler` with path-traversal guard.
- Updated prompt template to encourage tool use for evidence gathering.

## [0.1.0] — 2026-05-04

Initial release.

- **Python package** `llm_audit/` — stdlib-only default install.
- **Pluggable LLM adapter** pattern: `stub`, `claude-cli`, `anthropic-api`, `openai-api`.
- **CLI** `llm-audit run | review | prompt | init | smoke | adapters`.
- **From-prompt mode** (`llm-audit prompt`) — paste into any LLM with file-system tools.
- **CI templates** for GitHub Actions, Azure Pipelines, GitLab CI, BitBucket Pipelines, Jenkins.
- **Hermetic Docker image** at `ghcr.io/volaris-ai/llm-audit:latest` (multi-arch: linux/amd64 + linux/arm64).
- **Smoke test** with synthetic fixture + scoring-math assertions.
- **Cost guardrails** — per-call and per-run budget caps.
- **Default LLM** `claude-sonnet-4-6` — override via `--model` or `llm-audit-config.yml`.
