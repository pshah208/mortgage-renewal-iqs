# Attack Scenarios — How These Findings Get Exploited

> **Generated:** 2026-09-15  
> **Source:** security findings from this audit run  
> **Purpose:** translate the audit's findings into concrete attacker actions and business impact.

---

## Why this report exists

This report turns the audit's security findings into concrete attacker actions. The important detail is not just that the app has risky configuration; it is that a person can misuse those settings to bypass or weaken the enforced user identity and downstream access.

## Bottom line up front

| If exploited | Realistic impact | Likelihood |
|---|---|---|
| Local auth bypass | An attacker can reach protected API paths as a demo user and retrieve tenant-scoped data through the BFF | Medium |
| Broad delegated consent | A malicious or compromised user can leverage broad Graph/AI access granted to the app registration | Medium |

---

## Attack Scenario 1 — Local config drift turns into full auth bypass

**Main takeaway:** An attacker with access to the misconfigured environment could reach the app as the demo user without logging in at all.

**Attacker goal:** Use the app's trusted backend route and downstream data access without a real user token.
**Severity of the chain:** Critical  
**Likelihood:** Medium — this requires an environment misconfiguration, but the repo does not guard against that state.

**Entry point:** `app/src/bff/app/config.py:31-38`, `app/src/bff/app/auth.py:81-88`

**Kill-chain:**
1. The attacker identifies that `MOCK_MODE` is a configuration flag and that it is accepted as a boolean environment setting (`app/src/bff/app/config.py:31-38`).
2. They get the deployment or environment to run with `MOCK_MODE=true` outside of local development, which bypasses the `Authorization` header check in `current_user()` (`app/src/bff/app/auth.py:81-88`).
3. The BFF then returns the synthetic user `raj.balakrishnan@demo` and any subsequent call to `/api/chat` or `/api/me` is processed under that identity.
4. Because the app is designed to call downstream Work IQ and Foundry tools on behalf of the current user, the attacker can now drive those tools with the forged identity and access content tied to the demo persona.

**What the attacker walks away with:** A bypass of the normal Entra login boundary and access to the app as a valid-looking user, with the ability to query Work IQ, Fabric, and other tenant-backed resources if they are exposed through the BFF.

**Findings this chain relies on:**
- `app/src/bff/app/config.py:31-38` — `MOCK_MODE` toggle (Critical)
- `app/src/bff/app/auth.py:81-88` — hard-coded mock user bypass (Critical)

---

## Attack Scenario 2 — Broad tenant consent turns a demo app into a tenant-wide data bridge

**Main takeaway:** A demo app can become a tenant-wide bridge to Graph and AI data if the app registration is consented for all principals.

**Attacker goal:** Abuse delegated permissions to access mailbox, Teams, and other data without needing a narrowly scoped, individually approved app relationship.
**Severity of the chain:** High  
**Likelihood:** Medium — the exploit depends on app registration and tenant permission posture, which are operationally controlled but easy to over-grant in a demo environment.

**Entry point:** `app/infra/provision_app_registrations.py:177-189`, `app/infra/grant_foundry_permission.py:136-147`

**Kill-chain:**
1. The admin or provisioning script creates an app registration and then calls `/oauth2PermissionGrants` with `consentType: "AllPrincipals"` (`app/infra/provision_app_registrations.py:177-189`).
2. The same pattern is repeated for Foundry access in `grant_foundry_permission.py` (`app/infra/grant_foundry_permission.py:136-147`).
3. Because the grant is tenant-wide, any user that can sign in to the tenant and use the app has delegated access to the granted Graph/AI resources.
4. The BFF, which uses OBO, can then exchange tokens and fetch data on the user's behalf, increasing the blast radius from a demo scenario to a broader tenant-facing permission model.

**What the attacker walks away with:** Broader access to tenant data available through Graph/AI APIs than intended, with increased data exposure risk and a weaker security boundary around the app.

**Findings this chain relies on:**
- `app/infra/provision_app_registrations.py:177-189` — tenant-wide grant for Graph scopes (High)
- `app/infra/grant_foundry_permission.py:136-147` — tenant-wide grant for Foundry access (High)

---

## Findings with no current exploitation path

The repo does not expose a strong SQL injection or direct object reference in the code paths that were reviewed. Most of the risk is configuration-driven and operational rather than code-level injection; the danger is that a mis-set deployment state turns a working demo into a user-identity bypass.

---

## What this means for you

The main risk is not a complex exploit chain in the app code itself; it is configuration drift. A single mis-set environment variable or too-broad Entra grant expands the trust boundary in ways that are easy to miss during demo setup. Fixing the `MOCK_MODE` gate and narrowing the permission grants is the fastest path to making the app safe for broader deployment and reducing the chance that tenant data is exposed via the BFF or downstream tools.
