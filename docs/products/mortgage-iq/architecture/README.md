# architecture

### Summary

End-to-end mortgage renewal concierge. The browser calls an internal FastAPI BFF; the BFF validates the user's Entra token, performs OBO for Foundry, and streams agent output to the browser.

### Components

- React/Vite/MSAL SPA: `app/src/web/`.
- nginx web container: `app/src/web/Dockerfile`, `default.conf.template`.
- FastAPI BFF: `app/src/bff/app/main.py`.
- Foundry prompt agent: `agent/create_agent.py`.
- Work IQ: delegated Microsoft Graph content.
- Fabric IQ: Fabric semantic model `sm_mortgage_renewals`.
- Foundry IQ: Azure AI Search index `renewal-policies`.
- Azure control plane: `infra/`.

### Data flow

1. User signs in through MSAL.
2. SPA sends bearer token and question to `POST /api/chat`.
3. BFF validates `access_as_user`.
4. BFF exchanges the token OBO for Foundry.
5. Foundry agent retrieves from connected IQ sources.
6. BFF emits SSE status, layer, message, error, and done events.
7. SPA renders answer text and citations separately.

Verified in `app/README.md:35-55`, `app/src/bff/app/main.py:156-169`, `app/src/bff/app/agent_client.py:176-333`.

### External dependencies

- Microsoft Entra ID and Microsoft Graph.
- Azure AI Foundry project and model.
- Microsoft Fabric workspace, lakehouse, SQL endpoint, and semantic model.
- Azure AI Search.
- Azure Container Apps, ACR, Log Analytics, and Application Insights.

### Diagrams

- `../diagrams/README.md`
- Source: `docs/architecture.drawio`.
- **Inferred:** no rendered diagram export was found.

### Open questions

- **Unknown:** Which Foundry connections are authoritative: function tools, native connections, or both?
- **Unknown:** Is the `web` IQ layer in `app/src/bff/app/iq.py` deployed and used? The root runbook documents three layers, while the UI catalog has four.
