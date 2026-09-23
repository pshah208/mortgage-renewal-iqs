---
genre: security
category: api
analysis-type: static
relevance:
  file-patterns:
    - "**/api/**"
    - "**/routes/**"
    - "**/controllers/**"
    - "**/graphql/**"
    - "**/resolvers/**"
  keywords:
    - "api"
    - "endpoint"
    - "rest"
    - "graphql"
    - "swagger"
    - "openapi"
    - "cors"
    - "rate-limit"
  config-keys:
    - "express"
    - "fastify"
    - "@nestjs/core"
    - "flask"
    - "django-rest-framework"
    - "gin-gonic"
  always-include: false
severity-scale: "Critical|High|Medium|Low|Info"
---

# API Security Assessment

**Assessment Date:** 2026-09-15
**Auditor:** Parth Shah
**Application:** Mortgage Renewal Concierge
**Status:** Complete

---

<!-- analysis: static -->

## Executive Summary

**Overall API Security Rating:** [ ] Excellent [ ] Good [ ] Fair [x] Poor [ ] Critical

**Key Findings:**
- Total Vulnerabilities: 2
- Critical: 0 | High: 2 | Medium: 0 | Low: 0

**Most Critical Issue:** The provisioning scripts grant delegated Graph and AI permissions to all principals in the tenant, expanding the effective API surface beyond the intended demo users.

---

## 1. Authentication & Authorization

### 1.2 Authorization Controls

**Finding:** [ ] Pass [x] Fail [ ] N/A

**Assessment:**
- The OBO flow is properly scoped to a delegated `access_as_user` token, but the app registration logic grants default tenant-wide consent to Graph resources. This changes the trust boundary and means any user in the tenant can inherit the app's delegated rights once the app registration is in place.

**Issues Found:**

| Endpoint | Method | Severity | Issue | Impact |
|----------|--------|----------|-------|--------|
| `/oauth2PermissionGrants` | POST | High | `consentType: "AllPrincipals"` is used for delegated Graph and AI scopes | Broad tenant-wide authorization of a demo app, not a narrowly scoped user grant |
| `/oauth2PermissionGrants` | POST | High | Pre-consent is scripted for every principal in the tenant | Increases blast radius if the app or token is misused |

**Evidence:**

**File:** `app/infra/provision_app_registrations.py:177-189`
**Code:**
```python
if grant:
    merged = " ".join(sorted(set(grant["scope"].split()) | set(BFF_GRAPH_SCOPES)))
    g.call("PATCH", f"/oauth2PermissionGrants/{grant['id']}", {"scope": merged},
           ok=(204,))
else:
    g.call("POST", "/oauth2PermissionGrants", {
        "clientId": sp["id"], "consentType": "AllPrincipals",
        "resourceId": gsp["id"], "scope": want,
    })
```
**Issue:** This creates a tenant-wide delegated grant rather than a tightly scoped, per-user grant.

**File:** `app/infra/grant_foundry_permission.py:136-147`
**Code:**
```python
call("POST", "/oauth2PermissionGrants", {
    "clientId": bff_sp["id"], "consentType": "AllPrincipals",
    "resourceId": resource["id"], "scope": WANT_SCOPE,
})
```
**Issue:** The Foundry permission is also consented broadly to all principals in the tenant.

**Recommendations:**
- Prefer targeted, admin-approved consent or a tenant-restricted app rollout for demo scenarios instead of `AllPrincipals`.
- Revisit the app registration after testing and reduce granted scopes to the minimum required for the demo.
- Add a deployment guardrail that refuses to create broad grants in production tenants.

---

## 2. Input Validation & Data Security

### 2.1 Input Validation

**Finding:** [ ] Pass [ ] Fail [x] N/A

**Assessment:**
- The BFF validates the request body for chat by requiring a non-empty `question` string and then streams the request to the agent. This is appropriate for the current demo, but the repo does not include additional layered validation or abuse controls for prompt injection or request size.

**Recommendations:**
- Add rate limiting and request quotas for `/api/chat`.
- Consider prompt-injection guardrails if the app is moved beyond a controlled demo environment.

---
