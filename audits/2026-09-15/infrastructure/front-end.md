---
genre: infrastructure
category: front-end
analysis-type: static
relevance:
  file-patterns:
    - "**/web/**"
    - "**/src/**"
    - "**/frontend/**"
    - "**/ui/**"
  keywords:
    - "react"
    - "vite"
    - "typescript"
    - "spa"
    - "msal"
    - "authentication"
  config-keys:
    - "react"
    - "vite"
    - "typescript"
    - "@azure/msal-browser"
  always-include: false
severity-scale: "Critical|High|Medium|Low|Info"
---

# Front-end Infrastructure Audit

## System Information

- **System Name**: Mortgage Renewal Concierge Web UI
- **Audit Date**: 2026-09-15
- **Auditor**: Parth Shah
- **Primary Language**: TypeScript / React
- **Architecture Style**: Vite single-page app with MSAL-backed browser auth

## Executive Summary

**Overall Front-end Maturity Score**: 3.5 / 5

**Quick Assessment**:
- Current State: Modern Vite + React stack with sensible MSAL settings and no cookie-based session persistence.
- Target State: Add UI testing, linting automation, and more formal secure-by-default front-end guardrails.
- Priority Level: Medium
- Estimated Effort to Modernize: Low to Medium

---

<!-- analysis: static -->

## Maturity Level Assessment

### Current Maturity Score: 3.5 / 5

**Justification**:
The front-end is built on a modern React and Vite toolchain and uses MSAL with session-scoped browser storage, which is a sensible choice for a demo. Its gaps are mostly in automation and release hygiene, not in the core frameworks themselves.

**Evidence**:
- `app/src/web/package.json` shows `react` 18.3.1, `typescript` 5.6.3, `vite` 5.4.11.
- `app/src/web/src/auth.ts` uses `PublicClientApplication` with `cacheLocation: "sessionStorage"` and `storeAuthStateInCookie: false`.
- No frontend test runner or lint configuration was identified in the project files inspected.

---

## Area Review

### Framework & Tooling

**Current State**: Level 4

| Component | Technology | Status |
|-----------|-----------|--------|
| Build tool | Vite | Good |
| UI library | React 18 | Good |
| TypeScript | ES2022-style TS app | Good |
| Auth | MSAL Browser | Good |
| Testing | not detected | Needs work |

**Finding:**
- The stack is up to date and modern, but the repo does not include a formal UI test or quality gate to validate auth regressions or SSR-like issues.

---

### Auth & Browser Security

**Current State**: Level 3

#### Evidence

**File:** `app/src/web/src/auth.ts:14-27`
**Code:**
```ts
cache: {
  cacheLocation: "sessionStorage",
  storeAuthStateInCookie: false,
}
```
**Assessment:** Session-only browser storage is a better default for a demo than long-lived cookies, and it reduces cross-session leakage.

**Finding:**
- The SPA is well-behaved for a demo, but there is no visible automated check that the auth redirect or silent token acquisition path remains valid across updates.

---

### Developer Operations and Quality Gates

**Current State**: Level 3

| Capability | Status |
|-----------|--------|
| Linting | not detected |
| Unit tests | not detected |
| Type-checking in build | present (`tsc -b`) |
| CI pipeline | not detected |

**Recommendation:**
- Add a small UI test suite and pipeline with at least `npm ci`, `npm run build`, and auth smoke checks.
- Add dependency and security scanning for the front-end build.

---
