# backend

### Service

Mortgage Renewal Concierge BFF. It exposes bootstrap, identity, catalogue, story, chat, and diagnostics endpoints.

### Repos / paths

- This repo -> `app/src/bff/app/`.
- Entrypoint -> `app/src/bff/app/main.py`.

### Interfaces

- `GET /health`
- `GET /api/config`
- `GET /api/me` (authenticated)
- `GET /api/iqs`
- `GET /api/offers`
- `GET /api/story`
- `POST /api/chat` (authenticated SSE)
- `GET /api/diag` (authenticated)

The endpoint list is in `main.py:3-11`; route implementations are in `main.py:52-238`.

### Dependencies

- Entra JWT/JWKS and OBO token endpoint.
- Foundry Responses API.
- Microsoft Graph for profile enrichment.
- `story.json` and local offer/IQ catalogues.

### Build & run

- Create a venv under `app/src/bff`.
- Install `app/src/bff/requirements.txt`.
- Set `AAD_TENANT_ID`, `AAD_CLIENT_ID`, `AAD_CLIENT_SECRET`, `AAD_API_SCOPE`, and `FOUNDRY_PROJECT_ENDPOINT`.
- Run `uvicorn app.main:app --reload --port 8000`.
- Set `MOCK_MODE=true` for local UI work without Azure.

Verified in `app/README.md:95-124`.

### Owners

- **Unknown:** no team or named owner is recorded.

### Risks / pain points

- Work IQ depends on delegated identity and the user's mailbox/Teams access.
- SSE depends on proxy buffering being disabled.
- No committed OpenAPI contract was found.
- Broad exception handlers exist in `main.py:127-128`, `main.py:202-204`, and `main.py:233-238`; operational policy for these failures is unknown.

### Open questions

- **Unknown:** required production timeout, concurrency, and retry limits.
- **Unknown:** whether `/api/offers` is an API contract or demo-only surface.
