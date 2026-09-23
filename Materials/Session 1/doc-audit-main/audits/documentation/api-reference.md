---
genre: documentation
kind: dimension
dimension: api-reference
title: API Reference Documentation
weight: 22
relevance:
  always-include: false
  file-patterns:
    - "**/openapi*.y*ml"
    - "**/openapi*.json"
    - "**/swagger*.y*ml"
    - "**/swagger*.json"
    - "**/*.proto"
    - "**/schema.graphql"
    - "**/*.graphql"
  keywords: ["openapi", "swagger", "@app.route", "@RestController", "router.get", "router.post", "graphql", "grpc"]
rubric:
  "1": "An API exists but is effectively undocumented; consumers must read source to call it."
  "3": "Partial coverage — many operations missing params, response shapes, error codes, or examples; or only auto-generated stubs with no committed/curated reference. Also the ceiling whenever the reference is stale or no longer matches the implemented API."
  "5": "Complete, current, spec-backed reference: every operation documents params, response shapes, error codes, auth requirements, and usage examples; generated from or verified against a committed spec (OpenAPI/GraphQL schema/proto) that matches the live API."
---

# API Reference Documentation — Documentation Assessment

**Dimension:** `api-reference`  **Weight:** 22/100
**Maturity Score:** [ ] / 5
**Status:** [ ] Complete

> This dimension is **gated**: run it only if an API surface is detected. If the
> repository has no API surface, skip it and record the reason `no API surface detected`.

## What this dimension covers

Reference documentation for the project's API surface: endpoints/operations,
parameters, responses, errors, auth, and examples.

## Maturity Rubric

| Level | What it looks like |
|------:|--------------------|
| 5 | Complete, **current**, spec-backed reference: every operation documents params, response shapes, error codes, auth, and examples; generated from / verified against a committed spec that matches the live API. |
| 4 | Strong and current; only minor gaps short of level 5. |
| 3 | Partial coverage (missing params, responses, error codes, or examples), or only auto-generated stubs with no committed/curated reference. |
| 2 | Notable gaps; partial and inconsistent. |
| 1 | API exists but is effectively undocumented; consumers must read source. |

> **Freshness is a gate, not a bonus.** A reference that no longer matches the
> implemented API is worse than none. If the documented API drifts from the code,
> the dimension **cannot score above 3**. Auto-generated docs that are accurate
> but lack params/errors/examples are partial coverage — also a 3 at most.

## Assessment Checklist

- [ ] A machine-readable spec exists (OpenAPI/Swagger/GraphQL schema/proto) where applicable
- [ ] Every public endpoint/operation is documented
- [ ] Parameters and request bodies are described (types, required/optional)
- [ ] Response shapes and status/error codes are documented
- [ ] Authentication/authorization requirements are stated
- [ ] Usage examples (request/response) are provided
- [ ] **Up to date** — the reference matches the implemented API (no removed or renamed operations)

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
