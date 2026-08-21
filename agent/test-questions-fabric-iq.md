# Fabric IQ — retrieval test script

Six questions of escalating difficulty for validating the **Fabric semantic model**
connection on the Mortgage Renewal Concierge agent.

Every expected answer was pulled from the live model (`sm_mortgage_renewals`,
workspace `ws-mortgage-renewals-demo`) after the 2026-08-03 narrative-reconciliation
rebuild. If the agent's numbers differ, it is not retrieving — it is guessing.

> **Prerequisites:** the Fabric capacity must be **Active**, and sign in as
> **Raj Balakrishnan (`MarioR@`)**, who holds Member on the workspace.

---

## Q1 — Baseline aggregate *(does the connection work at all?)*

> **"How many mortgage renewals are maturing in the next 180 days, what is the total balance maturing, and what is the total annual revenue exposure?"**

| Expected | |
|---|---|
| Renewals | **50** |
| Balance maturing | **CAD 26,443,000** |
| Annual revenue exposure | **CAD 379,735** |

**Pass:** all three exact.
**Fail:** rounded or hedged figures — *"approximately 50 renewals worth about
$26 million"* without precision suggests summarisation rather than a live query.

---

## Q2 — Grouping and ranking *(does it aggregate correctly?)*

> **"Break down the 180-day renewal book by customer segment. For each segment show the number of renewals, balance maturing, annual revenue exposure and average renewal likelihood. Rank by revenue exposure."**

| Segment | Renewals | Balance (CAD) | Exposure (CAD) | High-risk | Avg likelihood |
|---|---:|---:|---:|---:|---:|
| Mass Affluent | 13 | 8,023,000 | 111,910 | 2 | 46.1% |
| Mass Market | 17 | 5,582,000 | 85,922 | 8 | 35.8% |
| New to Canada | 9 | 4,368,000 | 65,858 | 3 | 35.6% |
| Self-Employed | 7 | 4,545,000 | 60,827 | 0 | 47.8% |
| High Net Worth | 4 | 3,925,000 | 55,218 | 0 | 58.0% |

**Pass:** five segments, this order, exposure column sums to **379,735**.

**Note the tension:** Mass Market has the *most renewals* (17) and *most high-risk*
(8) but ranks second by exposure. High Net Worth has the *fewest* renewals and the
*highest* likelihood. An answer reporting only counts has missed the dimension asked
for.

---

## Q3 — Row-level retrieval + join *(can it name individuals and their offers?)*

> **"Which five customers represent the greatest annual revenue exposure in the next 180 days? For each, give their segment, branch, mortgage balance, attrition risk band, recommended retention offer and the approval level that offer requires."**

| Customer | Segment | Branch | Balance | Band | Exposure | Offer / approval |
|---|---|---|---:|---|---:|---|
| Gustav Haddadi | High Net Worth | BR-101 | 909,000 | Medium | 15,643 | Private Wealth Preferred Pricing / **Regional Director** |
| Simone Siddiqui | High Net Worth | BR-101 | 1,299,000 | Medium | 15,241 | Private Wealth Preferred Pricing / Regional Director |
| Farah Leclair | High Net Worth | BR-101 | 941,000 | **Low** | 14,122 | Private Wealth Preferred Pricing / Regional Director |
| Henrik Thibault | Self-Employed | BR-303 | 753,000 | Medium | 12,691 | Relationship Bundle Discount / Branch Manager |
| Dmitri Iyer | Mass Affluent | BR-101 | 665,000 | Medium | 10,547 | Relationship Bundle Discount / Branch Manager |

**Pass:** these five names, in this order, with approval levels attached.

**This is a deliberate trap.** Ranking by *exposure* returns **no High-risk customers
at all** — four Medium, one Low. If the agent returns High-risk customers instead, it
answered the question it expected rather than the one asked. A strong answer may
*note* the tension — "the highest-exposure customers are not the highest-risk ones" —
but must answer what was asked first.

---

## Q4 — Governed measure *(is it using the semantic model, or re-deriving?)* ⭐

> **"What is the total Value at Risk across the renewal book, and how does it compare to total annual revenue exposure? Which segment carries the most Value at Risk?"**

| Expected | |
|---|---|
| Total Value at Risk | **CAD 212,460.58** |
| Total annual revenue exposure | **CAD 379,735** |
| Ratio | ~56% |
| Highest segment | **Mass Affluent — CAD 60,088.84** |

**Why this matters most.** `Value at Risk` is a *defined measure* —
`SUMX(exposure × attrition_risk_score)` — the probability-weighted ranking the
20 July Renewal Council asked for. It is not a column and cannot be derived by
summing anything.

**Pass:** 212,460.58 (or 212,461). This proves the agent is calling the governed
model.
**Fail:** any other number, "I cannot find that", or explaining the concept without
a figure — meaning it is reading raw tables and missing the semantic layer entirely,
which is the whole reason for connecting a semantic model.

Alternate phrasings of the same test:
- *"What is the total Balance Above 80 LTV?"* → **CAD 4,409,000**
- *"Balance Above 60 Pct Payment Shock?"* → **CAD 22,714,000**

Both are governed measures that exist because policy RP-009 requires reporting on
exactly those splits.

---

## Q5 — Multi-dimension filter *(can it slice two ways at once?)*

> **"How many renewals fall into each payment-shock band, and what balance sits in each? Separately, how many high-risk renewals mature within the next 90 days?"**

| Payment shock band | Renewals | Balance (CAD) |
|---|---:|---:|
| 25 to 60 pct | 7 | 3,729,000 |
| Above 60 pct | **43** | **22,714,000** |

High-risk renewals maturing within 90 days: **11** (of 13 High-risk in total).

**Pass:** 43 above 60% shock; 11 high-risk inside 90 days.
**Note:** no renewals fall in a "Below 25 pct" band. If the agent invents that row
with a figure, that is a hallucination signal.

---

## Q6 — Hallucination probe *(does it admit what it does not have?)* ⭐

> **"What is the average credit score of customers renewing in the next 180 days, and how many of them have made a late payment in the last 12 months?"**

**Expected answer: it does not know.**

Neither `credit_score` nor any late-payment field exists in this model. The correct
response says so plainly and, ideally, offers what *is* available —
`attrition_risk_score`, `service_complaint_last_12m`, `renewal_likelihood_pct`,
`payment_shock_pct`.

**Pass:** explicitly states the data is not available.
**Fail:** any number at all. A fabricated average credit score is the most dangerous
failure mode in a banking demo — plausible, specific, and entirely invented.

---

## Scoring

| Question | Tests | Pass criterion |
|---|---|---|
| Q1 | connection is live | 50 · 26,443,000 · 379,735 |
| Q2 | grouping + ordering | 5 segments, exposure-ranked |
| Q3 | row-level + join + literal reading | correct 5 names, approval levels |
| Q4 | **governed measures** ⭐ | 212,460.58 |
| Q5 | multi-dimension filtering | 43 / 11 |
| Q6 | **honesty** ⭐ | admits it lacks the data |

Q4 and Q6 matter most. Q4 proves it is using the semantic layer rather than raw
tables; Q6 proves it will not invent banking data under pressure. An agent that
passes Q1–Q3 but fails those two looks impressive and is not trustworthy.

## Follow-up probes

| Ask | Expected |
|---|---|
| *"Which branch has the highest revenue exposure?"* | **Toronto Bay & Bloor (BR-101)** — 18 renewals, CAD 10,502,000 maturing, 4 high-risk, CAD 147,882 exposure |
| *"How many customers show a rate-shopping signal?"* | **17** |
| *"What is the average payment shock across the book?"* | **100.8%** |
| *"How many renewals need Pricing Committee approval for their recommended offer?"* | **11** (Switch-In Defence Pricing, CAD 74,249 exposure) |
| *"What is the average competitor rate gap?"* | **18.3 bps** |
| *"Which branch has the widest average competitor gap?"* | **Montréal Plateau (BR-202)** — 23.4 bps, which supports Derek's regional-grid argument |
| *"How many renewals are in the High band and what is their exposure?"* | **13**, CAD 76,994 |
