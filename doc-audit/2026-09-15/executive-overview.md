---
genre: documentation
kind: summary
title: Documentation Health — Executive Overview
relevance:
  always-include: true
---

# Documentation Health — Executive Overview

> **Generated:** 2026-09-15 00:15  **Repository:** mortgage-renewal - IQs
> **Audience:** Engineering team

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

_Status: 🟢 4–5 · 🟡 3 · 🔴 1–2. All five dimensions ran. Freshness caps any
dimension containing stale or contradicted documentation at 3._

## Dimension Summaries

### In-Code Documentation — 2/5 · 🔴 · weight 27

- **Freshness:** current in the sampled files; no direct contradiction found.
- **Strengths:** BFF modules explain design intent, especially OBO and the
  Responses API in `app/src/bff/app/auth.py:1-14` and
  `app/src/bff/app/agent_client.py:1-31`. Endpoint inventory is documented in
  `app/src/bff/app/main.py:1-11`.
- **Gaps:** The React/TypeScript surface is inconsistently documented; for
  example `app/src/web/src/App.tsx:1-30` has no component-level explanation,
  while only isolated JSDoc appears in `ChatPanel.tsx:38-40`. Data and
  provisioning scripts similarly have module docs but limited public-function
  documentation. This is partial coverage, not near-complete coverage.

### README & Onboarding — 3/5 · 🟡 · weight 22

- **Freshness:** **STALE:** `README.md:436` points to missing
  `mortgage-iq-app/README.md`; the current app documentation is under
  `app/README.md`. Score capped at 3.
- **Strengths:** Root onboarding covers purpose, layout, zero-Azure smoke test,
  deployment, data layers, and regeneration (`README.md:1-17`,
  `README.md:72-105`, `README.md:480-488`). The new product entrypoint adds
  concise orientation and explicit unknowns at
  `docs/products/mortgage-iq/README.md:3-49`.
- **Gaps:** Broken cross-reference remains. No repository-wide automated test
  command is documented because no test suite or `npm test` script was found;
  `app/src/web/package.json:6-10` defines only dev/build/preview scripts.

### API Reference — 2/5 · 🔴 · weight 22

- **Freshness:** current for the sampled routes; `main.py:52-238` matches the
  endpoint inventory in `main.py:1-11`.
- **Strengths:** The BFF endpoint list is explicit in `main.py:3-11`.
  `docs/products/mortgage-iq/backend/README.md:12-23` repeats the interfaces
  and identifies authenticated/SSE routes.
- **Gaps:** No committed OpenAPI/Swagger specification was found. Endpoint
  request/response schemas, error codes, and auth requirements remain mostly in
  implementation (`ChatRequest` is only defined at `main.py:47-50`).
  Agent tool contracts are documented in `agent/agent_instructions.md:37-47`,
  but that does not replace the BFF API reference.

### Architecture & Design — 3/5 · 🟡 · weight 16

- **Freshness:** **STALE:** `infra/README.md:47-58` is a dated
  `2026-08-21` live-estate snapshot and `infra/README.md:7-13` records
  deliberately retained pre-rebrand resource names. Score capped at 3.
- **Strengths:** `docs/products/mortgage-iq/architecture/README.md:3-40`
  now gives a concise component/data-flow view with evidence paths. The app
  architecture diagram and rationale remain strong in `app/README.md:35-55`,
  and `docs/architecture.drawio` exists.
- **Gaps:** No formal ADR files were found; decisions remain inline in
  `docs/products/mortgage-iq/decisions/README.md:3-13`. The draw.io source has
  no recorded update date or rendered export (`docs/products/mortgage-iq/diagrams/README.md:9-25`).

### User & Developer Guides — 4/5 · 🟢 · weight 13

- **Freshness:** current for the sampled setup and troubleshooting paths.
- **Strengths:** `app/README.md:190-210` provides concrete troubleshooting
  cases. The product docs now organize backend, frontend, deployment,
  integrations, security, and testing notes; examples include
  `docs/products/mortgage-iq/frontend/README.md:3-33` and
  `docs/products/mortgage-iq/testing/README.md:3-38`.
- **Gaps:** Guidance is still primarily for developers/operators. No browsable
  mkdocs, Docusaurus, or Sphinx site was detected, and no dedicated end-user
  guide for the deployed web app was found.

## Coverage Snapshot

| Item | Value |
|------|-------|
| Files scanned | 128 (excluding `node_modules`, `vendor`, `dist`, `build`, `.git`, `__pycache__`, `doc-audit`, `Materials`) |
| Primary languages | Python, TypeScript/React, Bicep |
| API surface | FastAPI REST/SSE routes in `app/src/bff/app/main.py` |
| Docs site | None detected; no mkdocs, Docusaurus, or Sphinx configuration |
| Dimensions assessed | in-code, readme-onboarding, api-reference, architecture-design, user-developer-guides |
| Dimensions skipped | none |
| Docs present | Root/app/infra READMEs, agent docs, and the completed living-doc tree under `docs/products/mortgage-iq/` |
| Potentially stale docs | `README.md:436`; `infra/README.md:7-13,47-58` |
| Docs missing | OpenAPI/Swagger spec; formal ADR files; end-user guide; automated BFF/frontend/infrastructure tests |
