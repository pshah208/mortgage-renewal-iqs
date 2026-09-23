# security

### Area / asset

Identity, delegated data access, secrets, synthetic mortgage data, and policy retrieval.

### Threat model

- Unauthorized user tries to query another user's Work IQ content.
- Client or attacker tries to expose the BFF client secret.
- Demo data is mistaken for real customer or policy data.
- A model produces an unsupported pricing or approval recommendation.

### Authn / authz

- SPA signs in with MSAL.
- BFF validates Entra JWT issuer, audience, expiry, and `access_as_user`.
- BFF uses OBO for Foundry and Graph access.
- Work IQ remains security-trimmed to the signed-in user.
- Docs describe Azure AI User, Search, Fabric, and Graph permissions in root `README.md:431-440`.

### Secrets handling

- BFF client secret is an environment variable.
- Seeder secret is printed once and documented as not written to disk.
- **Unknown:** production secret store, rotation interval, and whether Key Vault references are wired.

### Known weaknesses

- `MOCK_MODE=true` bypasses auth and must not be used for a real deployment.
- Synthetic disclaimer is documentation/UI-level protection, not a technical data boundary.
- Graph seeder requests broad directory/mail/team/file permissions.
- No threat model review or security test evidence was found.

### Open questions

- **Unknown:** tenant restrictions, app roles, conditional access, private networking, and audit retention.
- **Unknown:** who reviews policy corpus changes.
