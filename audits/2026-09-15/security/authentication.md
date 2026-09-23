---
genre: security
category: authentication
analysis-type: static
relevance:
  file-patterns:
    - "**/auth/**"
    - "**/login/**"
    - "**/middleware/auth*"
    - "**/passport*"
  keywords:
    - "jwt"
    - "oauth"
    - "session"
    - "passport"
    - "bcrypt"
    - "argon2"
    - "saml"
    - "mfa"
    - "totp"
  config-keys:
    - "passport"
    - "jsonwebtoken"
    - "@auth0"
    - "bcrypt"
    - "argon2"
    - "express-session"
    - "next-auth"
  always-include: false
severity-scale: "Critical|High|Medium|Low|Info"
---

# Authentication Security Assessment

**Assessment Date:** 2026-09-15
**Auditor:** Parth Shah
**Application:** Mortgage Renewal Concierge
**Status:** Complete

---

<!-- analysis: static -->

## Executive Summary

**Overall Authentication Security Rating:** [x] Critical

**Key Findings:**
- Total Vulnerabilities: 2
- Critical: 1 | High: 1 | Medium: 0 | Low: 0

**Most Critical Issue:** An environment-driven bypass disables token validation and returns a synthetic user identity when `MOCK_MODE=true`.

---

## Scope

### Components Assessed
- [x] OAuth 2.0 / OpenID Connect implementation
- [x] Session management
- [x] Single Sign-On (SSO) integration
- [x] Authorization boundary enforcement

### Out of Scope
- Password storage and MFA for the external Entra tenant are managed outside this repo.

---

## 3. Session Management

### 3.1 Authentication Bypass via Mock Mode

**Finding:** [x] Pass [ ] Fail [ ] N/A

**Assessment:**
- The BFF explicitly bypasses all token validation when `MOCK_MODE` is true, returning a hard-coded user object instead of the signed-in identity. This is intended for local-only UI testing but is dangerous if a deployment accidentally enables it.

**Issues Found:**

| Severity | Issue | Location | Committed By | Approved By | Impact |
|----------|-------|----------|--------------|-------------|--------|
| Critical | `MOCK_MODE` disables auth and impersonates a synthetic user | `app/src/bff/app/config.py:31-38`, `app/src/bff/app/auth.py:81-88` | Parth Shah <shahpar@microsoft.com> | Unknown | Any caller can access protected API routes and impersonate the demo user if the flag is enabled in a non-local environment |
| High | The app can be configured to fall back to app identity instead of the user's token | `app/src/bff/app/config.py:31-37`, `app/src/bff/app/agent_client.py:152-180` | Parth Shah <shahpar@microsoft.com> | Unknown | The user-scoped OBO design can silently collapse to the app identity, undermining tenant isolation and downstream access restrictions |

**Evidence:**

**File:** `app/src/bff/app/config.py:31-38`
**Code:**
```python
allow_app_identity_fallback: bool = (
    os.getenv("ALLOW_APP_IDENTITY_FALLBACK", "false").lower() == "true"
)
mock_mode: bool = os.getenv("MOCK_MODE", "false").lower() == "true"
```
**Issue:** Misconfiguration toggles are not gated to local-only environments and can disable the end-user identity checks.

**File:** `app/src/bff/app/auth.py:81-88`
**Code:**
```python
async def current_user(request: Request) -> User:
    if settings.mock_mode:
        return User(
            {"oid": "mock", "preferred_username": "raj.balakrishnan@demo",
             "name": "Raj Balakrishnan (mock)"},
            "",
        )
```
**Issue:** This returns a synthetic user without validating an incoming bearer token, bypassing the access check.

**Recommendations:**
- Fail closed: require `MOCK_MODE=false` in all non-local environments and reject any deployment that has it enabled.
- Add startup validation to refuse configuration if `MOCK_MODE=true` outside a developer workstation.
- Add tests to assert that protected routes reject unauthenticated calls when auth is enabled.

---

## 4. OAuth / OBO Security

### 4.1 OBO Pattern is Correct, but Fallbacks Weaken Integrity

**Finding:** [ ] Pass [x] Fail [ ] N/A

**Assessment:**
- The design uses Entra OBO and checks the `access_as_user` scope, which is a solid pattern. However, the code also keeps a local fallback that can weaken the user-bound flow if enabled.

**Issues Found:**

| Severity | Issue | Location | Committed By | Approved By | Impact |
|----------|-------|----------|--------------|-------------|--------|
| High | Fallback path removes end-user identity gating | `app/src/bff/app/config.py:31-37` | Parth Shah <shahpar@microsoft.com> | Unknown | If misconfigured, downstream tool calls may run as the app instead of the signed-in user |

**Recommendations:**
- Remove the app-identity fallback from production config or gate it behind an explicit local-only environment guard.
- Log and alert whenever the fallback path is activated.

---
