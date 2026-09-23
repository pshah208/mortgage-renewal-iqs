---
genre: security
category: executive-summary
analysis-type: static
relevance:
  file-patterns: []
  keywords: []
  config-keys: []
  always-include: true
severity-scale: "Critical|High|Medium|Low|Info"
---

# Executive Security Audit Summary

**Audit Date:** 2026-09-15
**Auditor:** Parth Shah
**Organization:** Mortgage Renewal Concierge demo project
**Application:** Mortgage Renewal Concierge

<!-- analysis: static -->

## Executive Summary

This audit focused on the actual auth and OBO flow in the BFF, the API-bound provisioning scripts, and the browser identity bootstrap. The strongest security concern is a configuration-driven bypass in the local/mock path that can disable authentication if `MOCK_MODE` is enabled outside a developer workstation. A second issue is a broad `AllPrincipals` consent pattern in the Entra provisioning scripts, which expands delegated access beyond the narrow tenant scope that a demo should normally use.

**THREAT LEVEL: HIGH** - The app architecture is mostly well-designed around Entra ID, but the operational guardrails are not strong enough to prevent accidental production auth bypass or over-wide delegated consent.

## Audit Scope

The following domains were assessed with the repo evidence available:

- Authentication security
- API authorization and consent setup
- OBO and token validation flow
- Browser-driven auth configuration

**Total Files Reviewed:** 101  
**Total Lines of Code Audited:** ~21,285  
**Total Audit Documents:** 3  
**Methodology:** code review of auth/configuration paths, token validation logic, and deployment scripts

## Critical Findings Summary

| # | Vulnerability | Severity | Impact | Location |
|---|---------------|----------|--------|----------|
| 1 | Auth bypass via `MOCK_MODE` | Critical | Token validation can be skipped and a synthetic user returned | `app/src/bff/app/config.py:31-38`, `app/src/bff/app/auth.py:81-88` |
| 2 | Broad tenant consent in Entra app provisioning | High | Delegated Graph/AI access grants are created for all principals in the tenant | `app/infra/provision_app_registrations.py:177-189`, `app/infra/grant_foundry_permission.py:136-147` |
| 3 | App identity fallback weakens user binding | High | The BFF can revert to app identity instead of end-user identity if configuration is set incorrectly | `app/src/bff/app/config.py:31-37` |

### Vulnerability Distribution by Severity

```
CRITICAL: 1 vulnerability  ████████  (33%)
HIGH:     2 vulnerabilities  ████████████  (67%)
MEDIUM:   0 vulnerabilities  
LOW:      0 vulnerabilities  
INFO:     0 vulnerabilities  
────────────────────────────────────────────
TOTAL:    3 vulnerabilities
```

### Normalized Metrics (per 1,000 LOC)

- Critical findings per 1,000 LOC: 0.047
- High findings per 1,000 LOC: 0.094
- Total findings per 1,000 LOC: 0.141

## Business Impact Assessment

### Immediate Threats

1. **Authentication bypass** — If `MOCK_MODE=true` is enabled in a non-local environment, unauthenticated callers can reach protected API routes and impersonate the synthetic user.
2. **Tenant-wide delegated access** — `AllPrincipals` consent increases the chance that a compromised app or bad actor with tenant access can use the app to access Graph/AI resources beyond the intended demo set.
3. **Identity drift** — If the app identity fallback is activated, user-scoped downstream access is lost; this undermines the security model of the BFF and can break auditability.

### Recommended Priorities

1. Block `MOCK_MODE` outside local developer workstations.
2. Replace broad `AllPrincipals` consent with explicit, least-privilege, approved grants.
3. Add automated auth regression tests and configuration validation before release.

---
