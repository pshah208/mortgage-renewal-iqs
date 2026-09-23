# Architecture

A reference for engineers extending the project. Skim level: 5–10
minutes. For a non-engineer overview, the README's "How it works" is
sufficient.

## In one sentence

> `code-audit` is a Python wrapper that turns a folder of audit
> markdown templates + a folder of agent prompts + a chosen LLM into
> a folder of filled markdown reports with a health score.

## Five transports, one core

| Transport | Use case | Entry point |
|---|---|---|
| Native CLI | Developer laptop, scripted runs | `pip install code-audit && code-audit run` |
| Docker image | CI / hermetic | `docker run -v $(pwd):/repo ghcr.io/volaris-ai/code-audit run` |
| Full bundle zip | No PyPI access, want CLI | unzip + `./install.sh` then `code-audit run` |
| Prompts-only zip | No Python at all, agent CLI only | unzip + `claude "Read .../prompts/entrypoint.md and follow it"` |
| Slash command | Claude Code daily use | `/code-audit` after a one-time setup |

All five call the same audit logic and produce output that is
**structurally identical** (genre dirs, template names,
metadata.json fields). Only the prose inside each filled template
varies with the LLM. Install details:
[`INSTALL.md`](../INSTALL.md). Prompt-driven deep dive:
[`PROMPT_ENTRYPOINTS.md`](PROMPT_ENTRYPOINTS.md).

## Project layout

```
code-audit/
├── README.md
├── INSTALL.md
├── CHANGELOG.md
├── LICENSE · pyproject.toml · Dockerfile · .dockerignore · .gitignore
│
├── code_audit/                   # Python package (~1,400 LOC)
│   ├── cli.py                    # argparse: run / review / prompt / init / smoke / adapters
│   ├── config.py                 # code-audit-config.yml loader
│   ├── templates.py              # walk audits/, parse YAML frontmatter
│   ├── agents.py                 # orchestrator + dispatch primitive + tool-use loop
│   ├── scan.py                   # repo walk + relevance detection + LOC
│   ├── output.py                 # atomic writes to audits/<TODAY>/
│   ├── score.py                  # 5-level rubric + weighted overall
│   ├── prompt.py                 # render entrypoint / slash command, --save into repo
│   ├── init.py                   # bootstrap a consumer repo
│   ├── tools.py                  # sandboxed read/grep/ls/blame for the LLM tool-use loop
│   ├── smoke_test.py             # synthetic-fixture E2E
│   ├── common.py · yaml_lite.py  # utilities + stdlib YAML parser
│   ├── prompts/entrypoint.md     # offline-first entrypoint prompt (package data)
│   ├── commands/code-audit.md    # /code-audit Claude Code slash command (package data)
│   ├── audits/                   # 60 audit templates (package data)
│   │   ├── security/        (17)
│   │   ├── infrastructure/  (17)
│   │   ├── team/             (3)
│   │   └── hosting/{aws,azure}/  (10 + 9)
│   ├── agents/                   # 6 agent specs (package data)
│   └── adapters/                 # LLM backends
│       ├── base.py               # BaseAdapter ABC + AdapterResult
│       ├── stub.py · claude_cli.py · anthropic_api.py · openai_api.py
│       └── __init__.py           # registry: register_adapter / get_adapter
│
├── ci/{github,azure,gitlab,bitbucket,jenkins}/  # 5 vendor templates
├── scripts/build-release-bundle.sh    # builds -bundle.zip + -prompts.zip
├── examples/                     # sample executive-overview.md + IMPROVEMENTS doc
├── tests/fixtures/sample-repo/   # smoke-test scaffolding
└── docs/{ARCHITECTURE,CI_CD,CONFIG_REFERENCE,MIGRATION,PROMPT_ENTRYPOINTS}.md
```

## What runs during `code-audit run`

`run_orchestrator()` in `agents.py` is the top-level driver:

```
1. Load config         (code-audit-config.yml or built-in defaults)
2. Walk the repo       (skip exclude_paths)
3. Detect AWS / Azure  (look for *.tf, *.bicep, AWSTemplateFormatVersion)
4. Decide which        (security + infra always; team if git history;
   genres to run        hosting if AWS/Azure detected)
5. Set up output dir   (audits/<TODAY>/<genre>/)
6. For each genre:
     For each template:
       a. Skip if not relevant (file-patterns / keywords / config-keys)
       b. Bail if budget cap reached
       c. Render the prompt: agent body + template + scan context
       d. Call the LLM adapter
       e. Retry once if the response is malformed
       f. Write the filled template to disk
7. Run the reviewer agent — reads all filled templates,
   writes executive-overview.md
8. Write audit-metadata.json (genres run, templates filled, cost,
   wall time)
```

## Sub-agent dispatch contract

Each `agents/*.agent.md` spec declares a `tools:` list. In legacy
implementations these were Copilot SWE Agent capabilities. In
code-audit they map to **Python equivalents**:

| Tool name | Python equivalent | Notes |
|---|---|---|
| `read` | `Path.read_text()` (sandboxed under repo root) | Path-traversal guard required |
| `search` | `subprocess.run(["rg", ...])` with grep fallback | Pattern-match semantics close to ripgrep |
| `edit` | `Path.write_text()` (sandboxed under output dir) | Atomic write via tmpfile + rename |
| `execute` | `subprocess.run(...)` with allowlist (git only) | Used by team-auditor for `git log`/`git blame` |
| `agent` | `agents.dispatch(name, context)` | Renders prompt + calls LLM adapter + parses output |

The `dispatch()` function is the migration's load-bearing primitive:

1. Loads `agents/<name>.agent.md` (frontmatter + body) — falls back to `.github/agents/` for legacy consumers.
2. Renders the agent prompt with the orchestrator's context.
3. Calls `adapter.analyze(prompt, context)`.
4. Validates the response shape (markdown, not a chat-style refusal).
5. Retries once with a stricter instruction if malformed.
6. Returns the filled template content.

## LLM adapter interface

```python
class BaseAdapter(ABC):
    name: str
    def __init__(self, *, model, timeout_sec, max_retries, per_call_budget_usd): ...
    @abstractmethod
    def analyze(self, prompt: str, context: dict | None = None) -> AdapterResult: ...

@dataclass
class AdapterResult:
    text: str
    cost_usd: float = 0.0
    duration_sec: float = 0.0
    model: str = ""
    raw: dict | None = None
```

Four built-in adapters (`stub`, `claude-cli`, `anthropic-api`,
`openai-api`). Add a fifth by subclassing `BaseAdapter` and calling
`register_adapter("my-name", MyAdapter)`.

## Config compatibility

Reads any of these (first found wins):

```
code-audit-config.yml     ← preferred
code-audit-config.yaml
code-audit-config.json
.github/audit-config.yml  ← gh-audit-era legacy fallback
.github/audit-config.yaml
```

Same for templates and agents — `audits/` and `agents/` first, fall
back to `.github/audits/` and `.github/agents/` for repos that
haven't moved their assets.

## Determinism boundary

| Layer | Deterministic? |
|---|:-:|
| Template loading + relevance detection | ✅ |
| Codebase walk + exclude paths | ✅ |
| Health-score math (rubric) | ✅ |
| Output schema (file paths, JSON keys) | ✅ |
| LLM-generated prose inside filled templates | ❌ |
| LLM-derived severity assignments | ❌ |

A re-run on the same commit produces the same set of files and the
same score *math*, but different prose + slightly different finding
enumeration. That's the LLM-driven nature of the tool, made
explicit.

## Tooling decisions

| Decision | Choice | Reason |
|---|---|---|
| Language | Python 3.9+ | Volaris stack standard; matches polysec / codeaudit |
| Default deps | stdlib only | `[anthropic]` / `[openai]` SDKs lazy-imported when their adapter is selected |
| YAML parser | `yaml_lite` (stdlib subset) | Avoid `pyyaml` dependency for the common case |
| Default LLM | `claude-sonnet-4-6` | Best price/quality from the codeaudit-via-Claude trial |
| Concurrency | Sequential | Predictable cost; opt-in `--parallel` is roadmap |

## Risk register

| Risk | Mitigation |
|---|---|
| LLM returns malformed multi-template response | Strict output format in prompt; retry on parse failure; fall back to per-template prompts |
| Costs spiral on a large repo | Per-call + per-run budget caps; default `max-files-per-template: 30`; hard exit at budget |
| LLM hallucinates findings (file paths that don't exist) | Post-process: verify file refs exist in the scanned set; drop or flag invalid |
| Rate-limit / 429 from API providers | Exponential backoff in adapter; clear error if exhausted |
| `git blame` slow on huge repos (team-auditor) | Time-cap the blame loop; skip files with > N lines |

## Out of scope (by design)

- Cross-LLM determinism — different models give different findings.
- A central portfolio aggregator — separate project.
- Container image scanning — pair with Trivy / Grype.
- DAST — pair with OWASP ZAP / Burp.
- Real CVE feed — pair with [polysec](https://github.com/Volaris-AI/polysec) + OSV-Scanner.

## Where it fits

- **[polysec](https://github.com/Volaris-AI/polysec)** is the per-PR deterministic floor (regex/SAST + SBOM, free, no LLM).
- **code-audit** is the periodic strategic narrative (LLM, paid, every quarter).
- **[codeaudit](https://github.com/Volaris-AI/codeaudit)** is the on-demand semantic scalpel (LLM per-file, on hotspots).

Three-way reference: [`Volaris-AI/polysec/docs/COMPARISON.md`](https://github.com/Volaris-AI/polysec/blob/main/docs/COMPARISON.md).
