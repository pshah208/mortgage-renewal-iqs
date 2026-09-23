---
genre: documentation
kind: dimension
dimension: architecture-design
title: Architecture & Design Docs
weight: 16
relevance:
  always-include: true
  file-patterns:
    - "**/ARCHITECTURE*"
    - "**/docs/**"
    - "**/adr/**"
    - "**/*.drawio"
    - "**/*.puml"
  keywords: ["architecture", "design decision", "ADR", "data flow", "diagram"]
rubric:
  "1": "No architecture or design documentation; structure must be inferred from code alone."
  "3": "Partial, scattered, or diagram-less architecture notes; key data flows or module responsibilities missing, or the docs no longer reflect the current structure. Also the ceiling whenever the architecture docs are stale or contradicted by the code."
  "5": "Clear, current overview with module responsibilities, key data flows, recorded design decisions (ADRs), AND at least one accurate diagram; a new engineer forms a correct mental model fast, and every shipped subsystem is reflected."
---

# Architecture & Design Docs — Documentation Assessment

**Dimension:** `architecture-design`  **Weight:** 16/100
**Maturity Score:** [ ] / 5
**Status:** [ ] Complete

## What this dimension covers

Higher-level docs: architecture overview, module responsibilities, data flows,
diagrams, and recorded design decisions (ADRs).

## Maturity Rubric

| Level | What it looks like |
|------:|--------------------|
| 5 | Clear, **current** overview + module responsibilities + key data flows + ADRs + at least one accurate diagram; fast correct mental model; every shipped subsystem reflected. |
| 4 | Strong and current; only minor gaps short of level 5. |
| 3 | Partial/scattered/diagram-less notes, or docs that no longer reflect the current structure. |
| 2 | Notable gaps; partial and inconsistent. |
| 1 | No architecture/design docs; structure inferred from code alone. |

> **Freshness is a gate, not a bonus.** An overview that omits shipped subsystems
> or contradicts the current structure caps the dimension at 3. A prose-only
> overview with no diagram cannot reach 5.

## Assessment Checklist

- [ ] An architecture/overview document exists
- [ ] Major modules/components and their responsibilities are described
- [ ] Key data flows or request lifecycles are documented
- [ ] Diagrams are present and readable (and not stale)
- [ ] Significant design decisions are recorded (e.g. ADRs)
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
