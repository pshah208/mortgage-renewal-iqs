---
genre: documentation
kind: summary
title: Documentation Health — Executive Overview
relevance:
  always-include: true
---

# Documentation Health — Executive Overview

> **Generated:** 2026-09-14 21:40  **Repository:** mortgage-renewal - IQs
> **Audience:** Engineering team

This is the **only** report doc-audit produces. It carries the overall score, a
heatmap, and a self-contained mini-summary per dimension. There is no separate
per-dimension file and no improvement roadmap — each summary states the score,
freshness, strengths, and the gaps that held the score back.

## Documentation Health Score

**Score: 62 / 100** — _Fair_

Bands: 90–100 Excellent · 75–89 Good · 55–74 Fair · 30–54 Poor · 0–29 Critical.

## Dimension Heatmap

| Dimension | Score (1–5) | Weight | Weighted Contribution | Status |
|-----------|:-----------:|:------:|:---------------------:|:------:|
| In-Code Documentation | 2 | 27 | 10.8 | 🔴 |
| README & Onboarding | 3 | 22 | 13.2 | 🟡 |
| API Reference | 2 | 22 | 8.8 | 🔴 |
| Architecture & Design | 3 | 16 | 9.6 | 🟡 |
| User & Developer Guides | 4 | 13 | 10.4 | 🟢 |
| **Overall** | — | **100** | **62.4/100 → 62** | — |

_Status: 🟢 4–5 · 🟡 3 · 🔴 1–2. **For any dimension that was skipped, delete its
row** (or mark it `— skipped: <reason>`). The **Overall** weight cell shows the sum
of the weights of the dimensions that ran; the Health Score is always out of 100,
with skipped weight redistributed proportionally. Remember the **freshness gate**:
any dimension with stale or code-contradicting docs is capped at 3._

## Dimension Summaries

### In-Code Documentation — 2/5 · 🔴 · weight 27

- **Freshness:** current — the code sampled matches its own comments; no
  contradictions found. The cap here is coverage, not staleness.
- **Strengths:** The BFF layer is well documented with module- and
  function-level docstrings that explain *why*, not just *what* — e.g.
  `app/src/bff/app/agent_client.py:1-31` (a "WHY THIS TARGETS THE RESPONSES API"
  design note) and `app/src/bff/app/auth.py:1-14` (why On-Behalf-Of is required).
  `app/src/bff/app/main.py:1-11` carries an endpoint-summary module docstring.
- **Gaps:** The React/TypeScript front end (`app/src/web/src/`, 12 `.tsx`/`.ts`
  files) is almost entirely uncommented — `App.tsx`, `IQPanel.tsx`,
  `FlowScene.tsx`, `ChatPanel.tsx` etc. have 0–2 comments each against files of
  100–300+ lines, and none document component props or intent beyond one
  isolated JSDoc block (`ChatPanel.tsx:38`). Data-generation and provisioning
  scripts under `data/work-iq/` and `data/fabric-iq/` (e.g.
  `generate_fabric_data.py`) mix a strong module docstring with undocumented
  helper functions further down the file. Coverage is inconsistent across the
  codebase — strong in `app/src/bff`, weak everywhere else — so this lands at
  "partial and inconsistent" per the rubric rather than "notable gaps only."

### README & Onboarding — 3/5 · 🟡 · weight 22

- **Freshness:** STALE — `README.md:436` points readers to
  `mortgage-iq-app/README.md` for the managed-identity role details, but no such
  path exists in this repository (the app lives at `app/`, whose README has no
  "Required role (agents data plane)" section). This is a broken/renamed
  reference to a doc that either never shipped in this repo or was moved
  without updating the link → **capped at 3**.
- **Strengths:** The root README (`README.md:1-489`) is unusually thorough: it
  states purpose, prerequisites, a zero-Azure smoke test (`README.md:72-84`),
  full per-layer deploy steps, and a repository-layout tree that matches the
  actual folders (`README.md:31-68`). `app/README.md` and `infra/README.md` are
  similarly detailed with runnable commands and a troubleshooting table.
- **Gaps:** The dangling `mortgage-iq-app/README.md` reference
  (`README.md:436`). No single top-level "run the tests" section exists for the
  repo as a whole — there is no automated test suite anywhere in the repo (no
  `tests/`, `pytest`, or `npm test` script; `app/src/web/package.json:6-10` has
  no `test` script), so "how to run the tests" cannot be documented because
  there is nothing to run.

### API Reference — 2/5 · 🔴 · weight 22

- **Freshness:** current for what exists — the documented endpoints in
  `app/src/bff/app/main.py:1-11` match the implemented routes.
- **Strengths:** `main.py`'s module docstring lists all seven endpoints
  (`GET /health`, `/api/config`, `/api/me`, `/api/iqs`, `/api/story`,
  `POST /api/chat`, `/api/diag`) with one-line purpose each
  (`app/src/bff/app/main.py:3-11`), and `agent/agent_instructions.md:37-47`
  documents the three agent function tools with parameters and return shapes.
- **Gaps:** No machine-readable spec (OpenAPI/Swagger) is generated or
  committed for the FastAPI service, and none of the seven REST endpoints
  documents request/response bodies, status/error codes, or auth requirements
  beyond a one-line description — a caller has to read `main.py` itself for
  parameter shapes (e.g. `ChatRequest` at `main.py:47-49`). This is "an API
  exists but is effectively undocumented beyond a name and one-liner," landing
  at the low end of "partial coverage."

### Architecture & Design — 3/5 · 🟡 · weight 16

- **Freshness:** STALE — `infra/README.md:47-58` states the live estate is
  spread across resource groups including `rg-mortgage-iq` (`canadacentral`,
  hosting AI Search) and `rg-Fabric` (`centralus`), verified "as at
  2026-08-21," alongside a caveat that resource names still carry a
  pre-rebrand `scotia` label (`infra/README.md:7-13`) — a self-acknowledged
  staleness pattern for infra naming that the doc itself calls out as
  deliberately not fixed. Per the rubric, any doc that "no longer reflects the
  current structure" (even if by the doc's own admission) caps the dimension
  at 3.
- **Strengths:** `app/README.md:35-73` gives a clear, accurate architecture
  diagram (Browser → nginx/SPA → FastAPI BFF → Foundry agent) plus a "Why this
  exists" design-rationale section explaining OBO and the citation-corruption
  fix. `infra/README.md:15-45` documents what Bicep can and can't express with
  a full resource-by-resource table, and `docs/architecture.drawio` provides an
  actual diagram file.
- **Gaps:** No ADRs are recorded as discrete documents (design decisions live
  inline in READMEs, e.g. `infra/README.md:138-160`, rather than as a
  browsable decision log). The `docs/` folder contains only the one
  `.drawio` file with no accompanying rendered image or walkthrough referenced
  from the README.

### User & Developer Guides — 4/5 · 🟢 · weight 13

- **Freshness:** current — the guide content (setup steps, troubleshooting
  table, guided-mode chapter list) matches the code it describes (e.g. the
  nine troubleshooting symptoms in `app/README.md:196-206` map to real error
  paths in `app/src/bff/app/agent_client.py` and `auth.py`).
- **Strengths:** `app/README.md:190-210` has a genuinely detailed
  troubleshooting/FAQ table covering nine distinct symptoms with root causes.
  `agent/demo-questions.md`, `agent/test-questions-fabric-iq.md`, and
  `agent/test-questions-cross-layer.md` give worked example prompts and
  expected answer shapes per IQ layer. `agent/reference.md` and
  `agent/agent_instructions.connections.md` document an alternate agent
  configuration path.
- **Gaps:** All guidance is developer/operator-facing; there is no end-user
  guide for someone just using the deployed web app (only internal
  walkthroughs for the people running or extending it).

## Coverage Snapshot

| Item | Value |
|------|-------|
| Files scanned | ~103 (excluding `node_modules`, `dist`, `.git`, `__pycache__`, `doc-audit`, `Materials`) |
| Primary languages | Python (BFF, agent, data-seeding scripts), TypeScript/React (web front end), Bicep (infra) |
| Dimensions assessed | in-code, readme-onboarding, api-reference, architecture-design, user-developer-guides |
| Dimensions skipped (reason) | none |
| Docs present | `README.md`, `app/README.md`, `infra/README.md`, `agent/agent_instructions.md` (+ `.connections.md`), `agent/reference.md`, `agent/demo-questions.md`, `agent/test-questions-*.md`, `docs/architecture.drawio` |
| Potentially stale docs | `README.md:436` (dangling `mortgage-iq-app/README.md` reference); `infra/README.md:7-13, 47-58` (self-acknowledged pre-rebrand resource naming and a point-in-time "as at 2026-08-21" live-estate snapshot) |
| Docs missing | OpenAPI/Swagger spec for the BFF's seven REST endpoints; ADR log; end-user (non-developer) guide for the deployed web app; inline documentation for the React/TypeScript front end |
