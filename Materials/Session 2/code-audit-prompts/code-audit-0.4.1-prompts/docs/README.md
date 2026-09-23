# 🔬 code-audit

> Portable LLM-driven codebase auditor. Run a comprehensive audit
> (security · infrastructure · team · hosting) using any LLM, on any
> CI, on any host.

`code-audit` is a Python wrapper that turns a folder of audit
templates + a folder of agent specs + a chosen LLM into a folder of
filled markdown reports with a 0–100 health score.

## Pick your install option

| You have… | Use option | Setup time |
|---|---|---|
| Python + internet | **[Pip](INSTALL.md#1-pip)** | 1 min |
| Docker | **[Docker](INSTALL.md#2-docker)** | 1 min |
| No PyPI access, want CLI | **[Full bundle zip](INSTALL.md#3-full-bundle-zip)** | 2 min |
| No Python, just an agent CLI | **[Prompts-only zip](INSTALL.md#4-prompts-only-zip)** | 1 min |
| Claude Code daily use | **[Slash command](INSTALL.md#5-slash-command-claude-code)** | 1 min once |

All five produce identical output. Full guide:
[`INSTALL.md`](INSTALL.md).

## What gets audited

| Genre | Method | Default weight |
|---|---|---:|
| 🔒 **Security** | Vulnerabilities, auth, crypto, secrets, dependencies | 35% |
| 🏗️ **Infrastructure** | Architecture, build, testing, error handling, observability | 30% |
| 👥 **Team** | Git churn, vulnerability attribution, ownership stability | 20% |
| ☁️ **Hosting** | Terraform / CloudFormation / Bicep / ARM | 15% |

Security and Infrastructure always run. Team runs if git history
exists. Hosting runs if AWS or Azure IaC is detected.

## LLM adapters

| Adapter | Auth | When to use |
|---|---|---|
| `claude-cli` | host Claude Code OAuth | local-dev, no API key handling |
| `anthropic-api` ⭐ | `ANTHROPIC_API_KEY` | CI, scripted runs |
| `openai-api` | `OPENAI_API_KEY` | OpenAI shop / o1 / gpt-4o |
| `stub` | none | plumbing tests, no LLM cost |

⭐ = recommended default. Default model: `claude-sonnet-4-6`.

## Output

```
audits/<TODAY>/
├── security/<template>.md
├── infrastructure/<template>.md
├── team/<template>.md               # if git history exists
├── hosting/aws/<template>.md        # if AWS detected
├── hosting/azure/<template>.md      # if Azure detected
├── executive-overview.md            # cross-genre 0–100 score
└── audit-metadata.json              # genres run, templates filled, cost
```

Findings cite real `file:line` references with git-blame attribution.
See [`examples/executive-overview-sample.md`](examples/executive-overview-sample.md).

## Cost

Sonnet 4.6 default. Rough budgets per run:

| Repo size | Cost |
|---|---:|
| Small (~100 files) | \$1–\$5 |
| Medium (~1k files) | \$10–\$30 |
| Large (~10k files) | \$50–\$150 |

Hard caps via `llm.total_budget_usd` or `--max-budget-usd`. See
[`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md).

## Where it fits

| Tool | Job | Cadence |
|---|---|---|
| **[polysec](https://github.com/Volaris-AI/polysec)** | Deterministic regex/SAST + SBOM | every commit |
| **code-audit** | LLM narrative + executive overview | quarterly |
| **[codeaudit](https://github.com/Volaris-AI/codeaudit)** | Per-file LLM deep-dive on hotspots | on-demand |

Three-way reference:
[`Volaris-AI/polysec/docs/COMPARISON.md`](https://github.com/Volaris-AI/polysec/blob/main/docs/COMPARISON.md).

## Documentation

| File | For |
|---|---|
| [`INSTALL.md`](INSTALL.md) | Install + run, one section per option |
| [`docs/PROMPT_ENTRYPOINTS.md`](docs/PROMPT_ENTRYPOINTS.md) | Prompt-driven options (zip, slash command) — deep dive |
| [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md) | Full `code-audit-config.yml` schema |
| [`docs/CI_CD.md`](docs/CI_CD.md) | CI templates + project pipeline |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Internal design + dispatch contract |
| [`docs/MIGRATION.md`](docs/MIGRATION.md) | Migrating from the older `gh-audit` tool |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history |

## License

CSI Internal Use Licence v1.0 — see [`LICENCE.md`](LICENCE.md).
Use is limited to entities owned by Constellation Software Inc.
