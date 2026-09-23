# Scoring

Each dimension is scored **1–5** by the auditor against the rubric in that
dimension's template frontmatter. The reviewer combines them into a weighted
**Documentation Health Score (0–100)**:

```
health = round( Σ ( (score / 5) × 100 × weight ) / Σ weight )
```

Only dimensions that ran are summed; a skipped dimension is removed from both the
numerator and `Σ weight`, so its weight redistributes proportionally.

## Scoring is strict and freshness-gated

Scoring rewards **accuracy and freshness**, not mere coverage:

- **Presence is not credit.** Documentation that merely exists, is shallow, or
  restates the code scores low (2–3). Reserve 4–5 for documentation that is
  genuinely comprehensive *and* verified current.
- **Freshness is a hard gate.** If *any* doc within a dimension is stale,
  contradicts the current code, or omits a shipped feature, that dimension
  **cannot score above 3** — regardless of how complete it otherwise is. A
  comprehensive-but-stale README is worse than a thin-but-accurate one.

## Default weights

| Dimension | Weight |
|---|---:|
| in-code | 27 |
| readme-onboarding | 22 |
| api-reference | 22 |
| architecture-design | 16 |
| user-developer-guides | 13 |
| **Total** | **100** |

Override in `doc-audit-config.yml` under `review.weights`.

## Bands

| Score | Band |
|---|---|
| 90–100 | Excellent |
| 75–89 | Good |
| 55–74 | Fair |
| 30–54 | Poor |
| 0–29 | Critical |

## Worked example (api-reference skipped, README stale)

Scores: in-code 4, readme-onboarding **3** (capped — README is stale), architecture-design 4, user-developer-guides 3.
`api-reference` is skipped, so the active weight is 27 + 22 + 16 + 13 = 78.

Using the formula above:

```
Σ( (score / 5) × 100 × weight ) = (0.8 × 100 × 27) + (0.6 × 100 × 22) + (0.8 × 100 × 16) + (0.6 × 100 × 13)
                                = 2160 + 1320 + 1280 + 780
                                = 5540

health = round( 5540 / 78 ) = round(71.0) = 71   → Fair
```

The README here had broad coverage but was out of date, so the freshness gate held
it at 3 rather than the 4–5 its coverage alone might suggest.
