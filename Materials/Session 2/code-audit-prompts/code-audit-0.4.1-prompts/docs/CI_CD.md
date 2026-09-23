# CI/CD pipeline — what runs when

Two pipelines live in `.github/workflows/`. They cover the project's
own development lifecycle. Consumer CI templates (in `ci/`) are a
separate concern — see [`ci/README.md`](../ci/README.md).

## Pipeline at a glance

```
Developer                                   GitHub                              Registry
─────────                                   ──────                              ────────

push to PR  ───────────────►  test.yml  ─►  smoke + matrix + dry-run + YAML
                              ┌─ Python 3.9 ┐
                              │ Python 3.10 │
                              │ Python 3.11 │
                              │ Python 3.12 │
                              └─────────────┘
                              ✓ pass → mergeable

merge to main ─────────────►  (no special pipeline — main is just protected)

tag v<VERSION>  ───────────────►  release.yml ─►  docker buildx ─►  ghcr.io/volaris-ai/code-audit:v<VERSION>
                                                              └─►  :latest
                              (multi-arch: linux/amd64 + linux/arm64)
```

## `test.yml` — runs on every PR + push to main

Three parallel jobs:

| Job | What it does | Why |
|---|---|---|
| **`smoke`** (matrix) | Install on Python 3.9 / 3.10 / 3.11 / 3.12, then run `code-audit smoke` + `code-audit run --dry-run` + assert output structure | Catches Python-compat breakage and any regression that the smoke test can detect |
| **`syntax`** | AST-parse every `.py` in `code_audit/` | Catches typos that don't trip the smoke test (e.g. unreachable code paths) |
| **`yaml-check`** | Parse every CI template in `ci/*` with the bundled `yaml_lite` parser | Catches malformed YAML in CI templates we ship to consumers |

All three are required for merge. No PR can land if any fail.

## `release.yml` — runs on tag push (`v*`)

Single job:

| Step | What it does |
|---|---|
| Checkout | Clone the tagged commit |
| QEMU + Buildx | Multi-arch build environment |
| GHCR login | Use `GITHUB_TOKEN` (no PAT needed) |
| Build + push | `linux/amd64` + `linux/arm64` images, tagged `:v<X.Y.Z>` and `:latest` |

Triggers:
- `push` of any tag matching `v*` (canonical path: `git tag v<VERSION> && git push --tags`)
- `workflow_dispatch` for manual re-runs

## What's NOT yet automated (gaps to close)

| Gap | Impact | Fix |
|---|---|---|
| **PyPI publishing** | `pip install code-audit` doesn't work — only the GHCR Docker image is published | Add a job to `release.yml` that runs `python -m build && twine upload` on tag push, gated by a `PYPI_API_TOKEN` secret |
| **No pre-merge Docker build** | A Dockerfile regression slips to `release.yml` and fails the tag push | Add a `docker-build` job to `test.yml` that runs `docker build .` (no push) on every PR |
| **No real-LLM integration test** | We test plumbing with `stub` adapter; never exercise `claude-cli` / `anthropic-api` end-to-end in CI | Add a manual `workflow_dispatch` job that runs `code-audit run --adapter anthropic-api` against a small fixture, gated by an `ANTHROPIC_API_KEY` secret. Manual trigger only because of cost. |
| **No version bump enforcement** | A PR can land code without bumping `__version__` in `__init__.py` and `pyproject.toml` | Add a check in `test.yml` that asserts `pyproject.toml`'s version matches `code_audit/__init__.py.__version__` |
| **No coverage reporting** | We have no test suite proper, just the smoke test | Add `pytest` + `coverage` once we have unit tests (out of scope for v0.1) |

## Proper full-lifecycle pipeline (target state)

```
PR opened ─► test.yml  ── smoke + syntax + yaml-check + version-match + docker-build
            │
            ▼
        review + approve
            │
            ▼
merge to main
            │
            ▼
        (no auto-deploy — explicit tag is the release gate)
            │
            ▼
git tag v0.X.Y && git push --tags
            │
            ▼
release.yml ── docker buildx + push to GHCR
            └─ pypi publish     ◄─── TODO
            └─ create GitHub Release with auto-generated notes  ◄─── TODO
```

## Recommended cadence

| Event | Frequency | Owner |
|---|---|---|
| PR check-in | per change | author + reviewer |
| Tag a patch (v0.1.x) | weekly during alpha, monthly after | maintainer |
| Tag a minor (v0.x.0) | new feature flagged complete | maintainer |
| Tag a major (vX.0.0) | breaking change to template/config schema | maintainer + release notes |

## Branch protection (recommend, not yet enabled)

When the project moves out of alpha:

- `main` requires PR + 1 approval + green `test.yml`
- No direct push to `main` even by admins
- Tags signed (`git tag -s`) for release provenance
