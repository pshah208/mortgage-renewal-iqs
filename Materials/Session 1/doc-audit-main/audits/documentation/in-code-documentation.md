---
genre: documentation
kind: dimension
dimension: in-code
title: In-Code Documentation
weight: 27
relevance:
  always-include: true
  file-patterns:
    - "**/*.py"
    - "**/*.ts"
    - "**/*.js"
    - "**/*.go"
    - "**/*.java"
    - "**/*.cs"
    - "**/*.rb"
  keywords: []
rubric:
  "1": "Public surface is largely undocumented, OR comments merely restate the code."
  "3": "Partial and inconsistent: many public functions/classes have no doc or only a shallow one-liner, intent is rarely explained, or the style is mixed. Also the ceiling for any dimension containing stale or code-contradicting docs."
  "5": "Near-complete and current: essentially every public function, class, and module documents purpose, params, returns, and error behavior; comments explain the *why*; one uniform style; and all of it matches the code as it exists today."
---

# In-Code Documentation — Documentation Assessment

**Dimension:** `in-code`  **Weight:** 27/100
**Maturity Score:** [ ] / 5
**Status:** [ ] Complete

## What this dimension covers

Docstrings and inline comments on the code itself: public functions, classes,
modules; whether comments explain *why* rather than restating *what*.

## Maturity Rubric

| Level | What it looks like |
|------:|--------------------|
| 5 | Near-complete **and current**: essentially all public functions, classes, and modules document purpose, params, returns, and error behavior; comments explain the *why*; one uniform style; matches today's code. |
| 4 | Strong and current; only minor gaps short of level 5. |
| 3 | Partial/inconsistent: shallow one-liners, missing docs on many public symbols, intent rarely explained, or mixed styles. |
| 2 | Notable gaps; only scattered docs. |
| 1 | Public surface largely undocumented, or comments only restate the code. |

> **Freshness is a gate, not a bonus.** Existence alone earns nothing. If *any*
> docstring/comment in this dimension is stale or contradicts the current code,
> the dimension **cannot score above 3**, regardless of coverage. Reaching 4–5
> additionally requires near-complete coverage *and* demonstrably current content.

## Assessment Checklist

- [ ] Public functions/methods have docstrings describing purpose, params, returns
- [ ] Public classes/modules have a top-level doc explaining their role
- [ ] Error/exception behavior is documented where non-obvious
- [ ] Comments explain *why* (intent, trade-offs), not *what* the code already says
- [ ] A consistent docstring style/convention is used across the codebase
- [ ] Complex/non-obvious logic carries explanatory comments
- [ ] **Up to date** — docstrings/comments match the current code (no stale or contradicted references)

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
