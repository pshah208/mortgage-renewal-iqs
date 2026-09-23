# Install + run

Five ways to run `code-audit`. Each section below is **self-contained** —
pick the one that matches your environment and follow it top-to-bottom.

> **Note on versions.** Examples below use `<VERSION>` (e.g., `0.4.0`)
> for the release version and `v<VERSION>` (e.g., `v0.4.0`) for the
> Docker tag. Substitute whichever release you're using — see the
> [Releases page](https://github.com/Volaris-AI/code-audit/releases)
> for the latest, or run `code-audit --version` once installed.

| # | Option | Needs Python? | Needs internet? | Best for |
|---|---|:-:|:-:|---|
| 1 | [Pip](#1-pip) | yes | yes | Local dev, scripted runs, most CI |
| 2 | [Docker](#2-docker) | no¹ | yes | Hermetic CI, locked-down hosts |
| 3 | [Full bundle zip](#3-full-bundle-zip) | yes | no | Air-gapped — but you still want the CLI |
| 4 | [Prompts-only zip](#4-prompts-only-zip) | no | no | Air-gapped, no install possible — drive from an agent CLI |
| 5 | [Slash command](#5-slash-command-claude-code) | no | no² | Daily use in Claude Code, one-keystroke runs |

¹ Docker provides Python.
² Slash command needs the prompts-only or full bundle once for setup; after that, no internet.

All five produce the same `audits/<TODAY>/...` output.

---

## 1. Pip

```bash
pip install --user 'code-audit[anthropic]'==<VERSION>   # or [openai] / [all]
export ANTHROPIC_API_KEY=sk-ant-...                   # see "Credentials" below
cd /path/to/your-repo
code-audit init                                       # one-time: seeds templates + config
code-audit run --max-budget-usd 20                    # produces audits/<TODAY>/...
```

Default model: `claude-sonnet-4-6`. Override with `--model` or
`llm.model` in `code-audit-config.yml`.

If host `claude` CLI is installed and authenticated, you can use it
without an API key:

```bash
code-audit run --adapter claude-cli
```

---

## 2. Docker

```bash
docker run --rm \
  -v "$(pwd):/repo" \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/volaris-ai/code-audit:v<VERSION> run --max-budget-usd 20
```

Multi-arch (linux/amd64 + linux/arm64). Runs as non-root user `audit`
(uid 1000). Add `-u $(id -u):$(id -g)` if you need host-matching file
ownership in the produced `audits/` directory.

Air-gapped variant: pull on a connected host, save the tarball,
sneakernet:

```bash
# Connected host
docker pull ghcr.io/volaris-ai/code-audit:v<VERSION>
docker save ghcr.io/volaris-ai/code-audit:v<VERSION> | gzip > code-audit-image.tar.gz

# Target host
gunzip -c code-audit-image.tar.gz | docker load
```

---

## 3. Full bundle zip

For users without PyPI access who still want the CLI.

1. Download `code-audit-<VERSION>-bundle.zip` (~870 KB) from the
   [Releases page](https://github.com/Volaris-AI/code-audit/releases) —
   or receive it via Slack / shared drive.
2. Install:

   ```bash
   unzip code-audit-<VERSION>-bundle.zip
   cd code-audit-<VERSION>-bundle
   shasum -a 256 -c checksums.txt    # optional integrity check
   ./install.sh                        # Linux / macOS
   # install.bat on Windows
   ```

   The installer runs
   `pip install --user code_audit-<VERSION>-py3-none-any.whl` under the hood.
   No PyPI / GitHub access required.

3. Run:

   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   cd /path/to/your-repo
   code-audit init
   code-audit run --max-budget-usd 20
   ```

---

## 4. Prompts-only zip

For air-gapped consumers who **cannot install Python packages** but
have an agent CLI (Claude Code, Cursor, Cline, ChatGPT desktop, …).

1. Download `code-audit-<VERSION>-prompts.zip` (~290 KB) from the
   [Releases page](https://github.com/Volaris-AI/code-audit/releases) —
   or receive it via Slack / shared drive.

2. Extract anywhere:

   ```bash
   unzip code-audit-<VERSION>-prompts.zip -d ~/Downloads/
   ```

3. Run by pointing your agent at the entrypoint, with the bundle dir
   added to its tool access:

   ```bash
   cd /path/to/your-repo
   claude "Read ~/Downloads/code-audit-<VERSION>-prompts/prompts/entrypoint.md and follow it" \
     --add-dir ~/Downloads/code-audit-<VERSION>-prompts \
     --max-budget-usd 20
   ```

   For Cursor / ChatGPT desktop / Cline: open the file
   `prompts/entrypoint.md` and tell the agent to follow its
   instructions on the current repo.

No GitHub access required at any point. The prompt locates templates
relative to itself.

For the full prompt-driven workflow (CLI flags, agent compatibility
matrix, bundle layout): see
[`docs/PROMPT_ENTRYPOINTS.md`](docs/PROMPT_ENTRYPOINTS.md).

---

## 5. Slash command (Claude Code)

Wraps option 4 in a `/code-audit` command. After a one-time setup,
anyone in the repo types `/code-audit` and the audit runs.

1. Get the slash command into your repo:

   ```bash
   # if you have code-audit pip-installed:
   code-audit prompt --save             # writes prompts/ + .claude/commands/

   # OR from the prompts-only / full bundle:
   mkdir -p .claude/commands
   cp ~/Downloads/code-audit-<VERSION>-prompts/commands/code-audit.md .claude/commands/
   ```

2. Commit so teammates get it for free:

   ```bash
   git add .claude/commands/code-audit.md
   git commit -m "add /code-audit slash command"
   ```

3. Run from any teammate's Claude Code, inside the repo:

   ```
   /code-audit
   ```

   Claude Code will ask once to allow `--add-dir` for the bundle dir
   (only if templates aren't already in the repo). Approve and it
   runs.

---

## Credentials

```bash
export ANTHROPIC_API_KEY=sk-ant-...     # default; recommended
# OR
export OPENAI_API_KEY=sk-...            # if using --adapter openai-api
```

For the host `claude` CLI adapter (option `--adapter claude-cli`), no
API key is needed — `claude` uses its own OAuth.

In CI, add the key as a secret. See [`docs/CI_CD.md`](docs/CI_CD.md)
for vendor-specific wiring.

## Cost guardrails

```yaml
# code-audit-config.yml
llm:
  total_budget_usd: 50.0       # whole audit run
  per_call_budget_usd: 1.0     # one LLM call
```

Or per-run on the CLI:

```bash
code-audit run --max-budget-usd 20
```

When the cap is hit: remaining templates are skipped with reason
`budget cap reached` recorded in `audits/<TODAY>/audit-metadata.json`.
Rough budgets by repo size:

| Repo size | Per run |
|---|---:|
| Small (~100 files) | \$1–\$5 |
| Medium (~1k files) | \$10–\$30 |
| Large (~10k files) | \$50–\$150 |

## Verify your install

```bash
code-audit smoke
```

Builds a synthetic fixture, runs the full pipeline with the stub
adapter, asserts output shape. **No LLM cost.** Exits 0 with
`smoke OK — all assertions passed`.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `smoke FAILED` | Python < 3.9 or `git` not on PATH | Install Python 3.9+ and git |
| `ANTHROPIC_API_KEY not set` | Env var missing | `export ANTHROPIC_API_KEY=...` |
| `claude -p exited 1` | Claude CLI not authenticated | `claude login` once on the host |
| `BUDGET CAP REACHED` mid-run | Budget too low for repo size | Bump cap or scope with `--genres` |
| Filled templates contain refusals | Model is censoring or off-task | Try a stronger model (`opus-4-7`, `gpt-4o`) |
| `team` genre skipped | Repo cloned with `--depth 1` | Set `fetch-depth: 0` in CI |
| Slash command can't find templates | No `--add-dir` for the bundle | Approve the bundle path when prompted, or extract it inside the repo |

## Uninstall

```bash
pip uninstall code-audit                              # option 1, 3
docker rmi ghcr.io/volaris-ai/code-audit:v<VERSION>   # option 2
rm -rf .claude/commands/code-audit.md prompts/        # option 5
```

`code-audit` writes only to `<repo>/audits/`. No global state.
