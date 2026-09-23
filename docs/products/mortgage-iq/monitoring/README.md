# monitoring

### What's monitored

- BFF liveness: `GET /health`.
- End-to-end auth and agent reachability: `GET /api/diag`.
- Per-request SSE status, IQ activity, tool errors, and completion state.
- Azure platform logs through Application Insights/Log Analytics are provisioned, but use is not documented.

### Dashboards

- **Unknown:** no dashboard URL or saved workbook was found.
- Start with `/api/diag` for a single-user diagnostic.

### Alerts

- **Unknown:** no alert rules, thresholds, or paging policy were found.

### SLO / SLI

- **Unknown:** no availability, latency, answer completeness, or grounding SLO was found.

### Useful log queries

- `GET /api/diag` - token, OBO, and agent reachability checks.
- BFF logs - agent stream exceptions and tool errors (`agent_client.py:301-307`).
- **Unknown:** Application Insights query names and retention.

### Gaps

- No documented alert ownership.
- No measurement of empty answers, partial tool failures, or citation quality.
