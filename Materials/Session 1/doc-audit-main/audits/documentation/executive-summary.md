---
genre: documentation
kind: summary
title: Documentation Health — Executive Overview
relevance:
  always-include: true
---

# Documentation Health — Executive Overview

> **Generated:** _[YYYY-MM-DD HH:MM]_  **Repository:** _[name/path]_
> **Audience:** Engineering team

This is the **only** report doc-audit produces. It carries the overall score, a
heatmap, and a self-contained mini-summary per dimension. There is no separate
per-dimension file and no improvement roadmap — each summary states the score,
freshness, strengths, and the gaps that held the score back.

## Documentation Health Score

**Score: [ ] / 100** — _[Excellent | Good | Fair | Poor | Critical]_

Bands: 90–100 Excellent · 75–89 Good · 55–74 Fair · 30–54 Poor · 0–29 Critical.

## Dimension Heatmap

| Dimension | Score (1–5) | Weight | Weighted Contribution | Status |
|-----------|:-----------:|:------:|:---------------------:|:------:|
| In-Code Documentation | [ ] | 27 | | 🟢🟡🔴 |
| README & Onboarding | [ ] | 22 | | 🟢🟡🔴 |
| API Reference | [ ] | 22 | | 🟢🟡🔴 |
| Architecture & Design | [ ] | 16 | | 🟢🟡🔴 |
| User & Developer Guides | [ ] | 13 | | 🟢🟡🔴 |
| **Overall** | — | **[ ]** | **[ ]/100** | — |

_Status: 🟢 4–5 · 🟡 3 · 🔴 1–2. **For any dimension that was skipped, delete its
row** (or mark it `— skipped: <reason>`). The **Overall** weight cell shows the sum
of the weights of the dimensions that ran; the Health Score is always out of 100,
with skipped weight redistributed proportionally. Remember the **freshness gate**:
any dimension with stale or code-contradicting docs is capped at 3._

## Dimension Summaries

> One self-contained mini-assessment per dimension — a compressed version of a
> full dimension report. Cite real `file:line` / paths. Each must state a freshness
> verdict; if docs are stale, say so and confirm the score is capped at 3.

### In-Code Documentation — [ ]/5 · 🟢🟡🔴 · weight 27

- **Freshness:** _[current | STALE: <what is out of date> → capped at 3]_
- **Strengths:** _[1–2, with paths]_
- **Gaps:** _[1–2 most significant, with paths — what held the score back]_

### README & Onboarding — [ ]/5 · 🟢🟡🔴 · weight 22

- **Freshness:** _[current | STALE: <what> → capped at 3]_
- **Strengths:** _[…]_
- **Gaps:** _[…]_

### API Reference — [ ]/5 · 🟢🟡🔴 · weight 22

- **Freshness:** _[current | STALE: <what> → capped at 3]_
- **Strengths:** _[…]_
- **Gaps:** _[…]_

_(If no API surface was detected, delete this block and record `api-reference` as skipped.)_

### Architecture & Design — [ ]/5 · 🟢🟡🔴 · weight 16

- **Freshness:** _[current | STALE: <what> → capped at 3]_
- **Strengths:** _[…]_
- **Gaps:** _[…]_

### User & Developer Guides — [ ]/5 · 🟢🟡🔴 · weight 13

- **Freshness:** _[current | STALE: <what> → capped at 3]_
- **Strengths:** _[…]_
- **Gaps:** _[…]_

## Coverage Snapshot

| Item | Value |
|------|-------|
| Files scanned | |
| Primary languages | |
| Dimensions assessed | |
| Dimensions skipped (reason) | |
| Docs present | |
| Potentially stale docs | |
| Docs missing | |
