# Executive Overview — Codebase Audit 2026-09-15

> **Generated:** 2026-09-15  
> **Assessment Period:** Static audit of the mortgage-renewal-iqs repo

---

## 📊 Executive Summary

**Overall Health Score: 60 / 100** — Fair

**Risk Level:** High

### At a Glance

| Metric | Value | Status |
|--------|-------|--------|
| Total Lines of Code | 21,285 | — |
| Total Findings | 6 | 🟡 Moderate |
| Critical Issues | 1 | 🔴 Immediate attention |
| High Severity Issues | 2 | 🔴 Action needed |
| Average Infrastructure Maturity | 3.3 / 5 | 🟡 Developing |

### Key Takeaways

1. **The repo is architecturally clean in the main path** — FastAPI + React + Vite + Entra-driven auth is a modern and understandable stack for a demo/pilot.
2. **The main concern is configuration guardrails** — a mock auth bypass and broad `AllPrincipals` consent create practical security and trust risks if deployment drift occurs.
3. **The fastest fix is operational** — fail closed on unsafe config and narrow the Entra grants before wider rollout.

### Top 3 Priorities

1. 🔴 **Remove or hard-gate `MOCK_MODE`** — block it in all non-local production-like environments.
2. 🔴 **Reduce `AllPrincipals` consent** — tighten app registrations to least-privilege delegated scopes.
3. 🟡 **Add auth and config smoke tests** — protect the BFF from unsafe deployment drift.

---

## 🎯 Overall Health Score

**Score: 60 / 100**

| Genre | Weight | Score | Grade | Weighted Contribution |
|-------|--------|-------|-------|---------------------|
| 🔒 Security | 55% | 54/100 | D | 29.7 points |
| 🏗️ Infrastructure | 45% | 66/100 | C | 29.7 points |
| **TOTAL** | **100%** | | | **59.4** |

**Grade Scale:** A (90-100) • B (75-89) • C (55-74) • D (30-54) • F (0-29)

---

## 🔒 Security Score Breakdown

**Score: 54 / 100** — Level 2 — Poor

### Your Metrics

| Metric | Value | Normalized (per 1K LOC) |
|--------|-------|-------------------------|
| Total LOC | 21,285 | — |
| Critical Findings | 1 | 0.047 |
| High Findings | 2 | 0.094 |
| Medium Findings | 0 | 0.000 |
| Low Findings | 0 | 0.000 |
| Info Findings | 0 | 0.000 |
| **Total Findings** | **3** | **0.141** |

### Top Security Findings

| Severity | Finding | Location | Impact |
|----------|---------|----------|--------|
| Critical | `MOCK_MODE` bypass disables auth validation | `app/src/bff/app/config.py:31-38`, `app/src/bff/app/auth.py:81-88` | A deployment config drift can turn protected API routes into an open path |
| High | Broad `AllPrincipals` consent in Entra provisioning | `app/infra/provision_app_registrations.py:177-189` | User access becomes too tenant-wide for a demo/security boundary |
| High | App identity fallback weakens end-user scoping | `app/src/bff/app/config.py:31-37` | Downstream identity can collapse to app identity instead of the signed-in user |

---

## 🏗️ Infrastructure Score Breakdown

**Score: 66 / 100** — Level 3 — Fair

### Your Metrics

| Dimension | Score (1-5) | Status | Key Notes |
|-----------|-------------|--------|-----------|
| Architecture | 3.5 | 🟡 | Good modular boundaries and clear layers |
| Build & CI/CD | 2.5 | 🔴 | No repo-native CI workflow or automated validation detected |
| Testing | 2.0 | 🔴 | No automated frontend/backend tests identified |
| Documentation | 4.0 | 🟢 | Project docs and scenario runbooks are rich |
| Code Quality | 3.5 | 🟡 | Clear code structure, but safety guardrails are thin |
| Error Handling | 3.5 | 🟡 | Structured diagnostics exist; more fail-closed validation is needed |
| **Average** | **3.3** | | |

**Penalty Applied:** None

---

## Action Plan

1. **Immediate (0-30 days):** Block `MOCK_MODE` in all non-local environments and add startup validation checks.
2. **Immediate (0-30 days):** Replace tenant-wide `AllPrincipals` consent with least-privilege, explicitly approved grants.
3. **Next sprint:** Add automated auth smoke tests and CI security scanning for backend/frontend dependencies.
4. **Next quarter:** Add production deployment baselines and a pre-flight config gate for identity, scopes, and access tokens.
