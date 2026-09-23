---
genre: documentation
kind: dimension
dimension: user-developer-guides
title: User & Developer Guides
weight: 13
relevance:
  always-include: true
  file-patterns:
    - "docs/**"
    - "**/mkdocs.y*ml"
    - "**/docusaurus.config.*"
    - "**/conf.py"
    - "**/*.md"
  keywords: ["tutorial", "how-to", "guide", "FAQ", "troubleshooting", "example"]
rubric:
  "1": "No task-oriented guides; only (at best) a README. Users/devs are left to figure out workflows themselves."
  "3": "Thin, scattered, or happy-path-only guides; OR a docs folder dominated by historical plans/specs rather than durable how-tos; OR no end-user guidance. Also the ceiling whenever guides are stale or contradicted by the current behavior."
  "5": "Task-oriented guides cover the common user AND developer workflows, with worked examples and troubleshooting, are current, and are browsable (mkdocs/docusaurus/sphinx)."
---

# User & Developer Guides — Documentation Assessment

**Dimension:** `user-developer-guides`  **Weight:** 13/100
**Maturity Score:** [ ] / 5
**Status:** [ ] Complete

## What this dimension covers

Task-oriented documentation: tutorials, how-tos, usage examples,
troubleshooting/FAQ, and any docs site.

## Maturity Rubric

| Level | What it looks like |
|------:|--------------------|
| 5 | Guides cover common user **and** developer workflows, with worked examples + troubleshooting, are **current**, and are browsable (docs site). |
| 4 | Strong and current; only minor gaps short of level 5. |
| 3 | Thin/scattered/happy-path-only guides, a docs folder dominated by historical plans, or no end-user guidance. |
| 2 | Notable gaps; partial and inconsistent. |
| 1 | No task-oriented guides; only (at best) a README. |

> **Freshness is a gate, not a bonus.** Guides that no longer match current
> behavior cap the dimension at 3. Point-in-time plans/specs do not count as
> durable guides. Covering only developer workflows (no end-user guidance), or
> only the happy path, also caps at 3.

## Assessment Checklist

- [ ] Getting-started / tutorial content beyond the README
- [ ] How-to guides for common tasks/workflows
- [ ] Worked examples or sample usage
- [ ] Troubleshooting / FAQ section
- [ ] A docs site or organized docs/ tree (mkdocs/docusaurus/sphinx) where warranted
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
