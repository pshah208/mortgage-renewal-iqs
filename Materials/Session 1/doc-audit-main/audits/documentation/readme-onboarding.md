---
genre: documentation
kind: dimension
dimension: readme-onboarding
title: README & Onboarding
weight: 22
relevance:
  always-include: true
  file-patterns:
    - "README*"
    - "**/README*"
    - "docs/**"
    - "CONTRIBUTING*"
  keywords: ["getting started", "installation", "prerequisites", "quick start"]
rubric:
  "1": "No README, or a stub that does not say what the project is or how to run it, OR documented steps that do not actually work."
  "3": "Purpose plus basic install/run steps exist but onboarding has real gaps (missing prerequisites, env setup, a local-run path, or how to run tests). Also the ceiling whenever the README is stale or contradicts current code/behavior."
  "5": "From the docs alone a new developer reliably clones and runs in under 30 minutes: purpose, prerequisites, install, build, run, test, configure are all present, accurate, AND current; recently shipped features are reflected."
---

# README & Onboarding — Documentation Assessment

**Dimension:** `readme-onboarding`  **Weight:** 22/100
**Maturity Score:** [ ] / 5
**Status:** [ ] Complete

## What this dimension covers

Top-level README and the getting-started path: can a new developer understand the
project and get it running quickly?

## Maturity Rubric

| Level | What it looks like |
|------:|--------------------|
| 5 | New dev reliably clones and runs in <30 min from the docs alone: purpose, prerequisites, install, build, run, test, configure all present, accurate, **and current**; recent features reflected. |
| 4 | Strong and current; only minor gaps short of level 5. |
| 3 | Purpose + basic install/run present, but real onboarding gaps (prereqs, env, local-run path, or tests). |
| 2 | Notable gaps; partial and inconsistent. |
| 1 | No README/stub, or documented steps that don't actually work. |

> **Freshness is a gate, not a bonus.** A comprehensive-but-stale README is not a
> good README. If the README is out of date, contradicts the code, or omits
> recently shipped features, the dimension **cannot score above 3**. Verify that
> documented commands/paths still exist before crediting them.

## Assessment Checklist

- [ ] README states what the project is and the problem it solves
- [ ] Prerequisites and supported versions are listed
- [ ] Install steps are present and accurate
- [ ] Build/run steps are present and accurate
- [ ] How to run the tests is documented
- [ ] Configuration / environment variables are documented
- [ ] A new developer could get running in under 30 minutes
- [ ] **Up to date** — matches the current code/behavior (no stale, contradicted, or removed-feature references)

## Evidence

> Cite real paths/lines. "Documentation absent" is valid evidence — point at the
> missing docstring location or the missing file. Never invent documentation.

| Observation | Location (`file:line` / path) | Notes |
|-------------|-------------------------------|-------|
| | | |

## Strengths

- 

## Gaps

- 

## Recommendations

### Quick wins (0–1 week)

- [ ] {what} — *where:* `path` — *impact:* High/Med/Low — *effort:* High/Med/Low

### Short-term (1–4 weeks)

- [ ] 

### Larger efforts (1–3 months)

- [ ] 

## Dimension Score: [ ] / 5

**Rationale:** _Tie the score to the rubric and the evidence above._
