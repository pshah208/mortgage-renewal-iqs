# Migration guide

> The only place this project's original name (`gh-audit`) is
> mentioned. If you don't know what `gh-audit` is, you don't need
> this doc.

## Why migrate

`code-audit` is the portable replacement for the older `gh-audit`.
Same templates, same scoring rubric, but no longer requires GitHub
Copilot Business / Enterprise or GitHub Actions specifically. Runs on
any LLM (Claude / OpenAI / local) on any CI (GitHub / Azure / GitLab
/ BitBucket / Jenkins).

## Three steps

### 1. Replace the trigger workflow

Old (`.github/workflows/run-audit.yml` — Copilot trigger):

```yaml
# Issue → assign to Copilot SWE Agent → draft PR
```

New — pick the template for your CI vendor from
[`ci/`](../ci/) and drop it into the conventional location:

| Vendor | Old | New |
|---|---|---|
| GitHub Actions | `.github/workflows/run-audit.yml` | [`ci/github/audit.yml`](../ci/github/audit.yml) → `.github/workflows/audit.yml` |
| Anywhere else | (not supported) | pick from `ci/{azure,gitlab,bitbucket,jenkins}/` |

### 2. Replace the secret

| Old secret | New secret |
|---|---|
| `AUDIT_PAT` (PAT for Copilot Coding Agent) | `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) |

Drop the `AUDIT_PAT` secret. Add `ANTHROPIC_API_KEY` (recommended) or
`OPENAI_API_KEY` instead.

### 3. (optional) Move audit assets out of `.github/`

Templates and agent specs are no longer GitHub-specific. The runner
reads them from either path, so this step is optional:

```bash
git mv .github/audits audits
git mv .github/agents agents
```

If you keep them under `.github/`, code-audit falls back to that
location automatically — no breakage. The fallback is permanent
support; move when convenient.

## What carries over unchanged

- All audit templates in `audits/**/*.md` (or `.github/audits/`)
- All agent specs in `agents/*.agent.md` (or `.github/agents/`)
- Scoring rubric, severity scale, output structure, config schema

## What's gone

| Removed | Why |
|---|---|
| GitHub Copilot Business / Enterprise prerequisite | The tool is now LLM-agnostic |
| Coding Agent setup step | No longer used |
| `AUDIT_PAT` secret | Replaced by `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` |
| Issue → Copilot assignment → draft PR delivery | Replaced by `code-audit run` writing to disk |

## What's new

- `code-audit init` — bootstrap a fresh repo with reference templates + starter config + slash command
- `code-audit run --adapter <stub|claude-cli|anthropic-api|openai-api>` — pick your LLM
- 5 CI vendor templates (was 1)
- Cost guardrails (`total_budget_usd`, `per_call_budget_usd`)
- Multi-arch Docker image at `ghcr.io/volaris-ai/code-audit`
- **Five install paths** with full feature parity — see [`INSTALL.md`](../INSTALL.md):
  pip · Docker · full bundle zip · prompts-only zip · `/code-audit` slash command
- **Air-gapped support** — the prompts-only zip (~290 KB) lets any
  agent CLI run a full audit with zero internet access, zero install

## Verifying the migration

After step 1 + step 2:

```bash
code-audit smoke   # synthetic-fixture E2E, no LLM cost — exits 0 on success
```

Then trigger the new CI workflow manually and confirm the produced
`audits/<TODAY>/` directory has the same shape as your previous runs.
Prose in filled templates will differ (LLM variance) — structure
will not.
