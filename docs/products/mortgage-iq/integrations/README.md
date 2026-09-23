# integrations

### Microsoft Graph / Work IQ

- **Direction:** outbound reads and seed writes.
- **Protocol & auth:** Graph REST; app-only seeding for users/mail/files/team setup, delegated device-code auth for Teams messages, and delegated OBO at runtime.
- **Contract / SLA:** source code and scopes are in `data/work-iq/`; no SLA or rate-limit document found.
- **Failure modes:** missing mailbox, Teams membership, consent, or indexing can produce empty/403 results.
- **Owner:** **Unknown.**

### Microsoft Fabric

- **Direction:** outbound deployment/upload and runtime analytics reads.
- **Protocol & auth:** REST/OneLake APIs; Power BI executeQueries or SQL endpoint.
- **Contract / SLA:** semantic model and measure names are described in root `README.md:156-172`; no SLA found.
- **Failure modes:** paused capacity, missing workspace/model permissions, or missing ODBC driver.
- **Owner:** **Unknown.**

### Azure AI Search / Foundry

- **Direction:** policy corpus upload; runtime retrieval and agent invocation.
- **Protocol & auth:** Azure SDK/REST and Foundry Responses API; API key or Entra/RBAC depending on path.
- **Contract / SLA:** policy IDs RP-001 to RP-010 and tool contracts are in `agent/agent_instructions.md:37-47`.
- **Failure modes:** disabled semantic ranking, wrong project/agent name, missing Search permissions.
- **Owner:** **Unknown.**

### Open questions

- **Unknown:** authoritative connection configuration for native Foundry connections.
- **Unknown:** production SLAs, quotas, retry policy, and vendor escalation paths.
