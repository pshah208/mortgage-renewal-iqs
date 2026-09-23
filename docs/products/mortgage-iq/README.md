# Mortgage Renewal Concierge / IQs

## Summary

Synthetic CFC Bank demo for a mortgage-renewal concierge. It combines:

- Work IQ: Microsoft 365 email, Teams, meetings, and files.
- Fabric IQ: 50 synthetic renewals, risk scores, offers, and measures.
- Foundry IQ: Azure AI Search over 10 synthetic policy documents.
- A Foundry agent and a React/FastAPI delivery app.

Verified in `README.md:1-27`, `agent/agent_instructions.md:11-22`.

## Why It Matters

- Demonstrates grounded answers across conversation, governed analytics, and policy.
- Shows delegated user access for Work IQ instead of app-only access.
- Keeps synthetic data clearly separate from real banking information.
- Provides a repeatable deployment path, but it spans Azure, Fabric, Microsoft Graph, and Foundry.

## Key Repos

- `mortgage-renewal - IQs` -> this repository.
- No separate service repositories were identified. **Verified:** the deployable code and data are in this repo.

## Main Components

- `agent/` - Foundry agent instructions, tool contract, creation and smoke-test script.
- `data/work-iq/` - Graph seeding and persona mapping.
- `data/fabric-iq/` - deterministic CSV generation, Fabric deployment, notebooks, semantic model.
- `data/foundry-iq/` - policy corpus and AI Search indexing.
- `app/src/bff/` - FastAPI BFF, token validation, OBO exchange, SSE chat, diagnostics.
- `app/src/web/` - React/Vite/MSAL web UI.
- `infra/` - Bicep control-plane resources and role assignments.
- `deploy.ps1` - end-to-end orchestration.

## Open Questions

- **Unknown:** Who owns this demo after handoff?
- **Unknown:** Is the intended deployment tenant still the tenant described in the docs?
- **Unknown:** Are the live resource names and `2026-08-21` estate snapshot still current?
- The root README still references missing `mortgage-iq-app/README.md` at `README.md:436`.
- **Inferred:** The app and root README describe the same product, but no formal release/version ownership file was found.

## Sources

- Repo files inspected: root `README.md`, `app/README.md`, `infra/README.md`, `agent/`, `data/`, `app/`, `infra/`.
- Architecture source: `docs/architecture.drawio`.
- No people were spoken to; ownership is therefore unknown.

## Subfolder Status

| Folder | Status |
|---|---|
| `architecture/` | Filled |
| `backend/` | Filled |
| `frontend/` | Filled |
| `infrastructure/` | Filled |
| `database/` | Filled |
| `integrations/` | Filled |
| `deployment/` | Filled |
| `monitoring/` | Filled |
| `testing/` | Filled |
| `security/` | Filled |
| `decisions/` | Filled |
| `diagrams/` | Filled |
| `meeting-notes/` | Not applicable: no meeting notes were supplied |
| `roadmap/` | Filled with inferred follow-up themes |
| `incidents/` | Not applicable: no incident or postmortem records were supplied |
| `misc/` | Not applicable: no orphaned topic was identified |
