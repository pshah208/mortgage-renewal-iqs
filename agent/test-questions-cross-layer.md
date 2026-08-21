# Cross-layer test questions — Work IQ × Fabric IQ

Seven questions that **cannot be answered from one layer alone**. Each needs a
qualitative claim from email/Teams/meetings *and* a quantitative check against the
renewal analytics.

These are the questions worth demoing. Single-layer questions prove a connection
works; these prove the agent can *reconcile* sources — which is the actual value.

All figures pulled from the live semantic model after the 2026-08-03
narrative-reconciliation rebuild. Sign in as **Raj Balakrishnan (`MarioR@`)** — he
sees all 18 emails, the Teams channels, the SharePoint library and the Fabric
workspace.

---

## Q1 — Corroborate a branch leader's concern

> **"Marcus Delaney raised concerns about capacity at BR-101. What exactly did he say, and does the renewal data support it? How does BR-101 compare to the other two branches?"**

**Work IQ should surface:** Marcus's 22 June email and Teams post — **18 maturities**
inside 180 days, two advisors at ~70 active files each, the 120-day contact standard
unreachable, sub-300k renewals untouched until the 30-day letter, a 640k file lost
because nobody called until day 22. Follow-up 28 July: floating advisor still
unassigned.

**Fabric IQ should confirm:**

| Branch | Renewals | Balance maturing | High-risk | Exposure | Avg shock |
|---|---:|---:|---:|---:|---:|
| **Toronto Bay & Bloor (BR-101)** | **18** ✓ | 10,502,000 | 4 | **147,882** | 101.9% |
| Calgary Centre Street (BR-303) | 16 | 8,971,000 | 2 | 126,937 | 90.8% |
| Montréal Plateau (BR-202) | 16 | 6,970,000 | 7 | 104,916 | 109.5% |

**Good answer:** Marcus's figure of 18 is exactly right. BR-101 carries the largest
book by count *and* balance *and* revenue exposure — his capacity concern is
well-founded.

**Excellent answer:** notes that although BR-101 is largest by volume, **BR-202 has
more high-risk files (7 vs 4)** — so capacity is BR-101's problem, but *risk
concentration* is Montréal's. Two different problems needing two different responses.

---

## Q2 — Quantify an ownership gap

> **"Several branch leaders flagged that broker-originated renewals have no owner. How many are there, what are they worth, and how risky are they?"**

**Work IQ should surface:** Marcus (23 June, Branch Leaders Forum) — 6 files at
BR-101, clients never met the branch, don't return calls, broker channel team says
renewals aren't theirs. Sophie adds 4, Nadia adds 3. Diane's 1 August direction:
*"broker-originated renewals get an owner by Friday… thirteen files with no owner is
an unforced error."*

**Fabric IQ should confirm:** **13 broker-originated renewals, CAD 7,762,000**,
5 high-risk, CAD 105,263 exposure.

| Branch | Files | Balance | High-risk | Exposure |
|---|---:|---:|---:|---:|
| BR-101 | **6** ✓ | 4,815,000 | 1 | 63,787 |
| BR-202 | **4** ✓ | 1,099,000 | 4 | 17,712 |
| BR-303 | **3** ✓ | 1,848,000 | 0 | 23,764 |

**Good answer:** 13 files, CAD 7.76M — the per-branch counts match exactly what each
leader reported.

**Excellent answer:** flags that **all four** BR-202 broker files are High risk, on
the smallest balance of the three branches. Sophie reported the smallest count but
carries the worst concentration — Diane's ownership fix should start there.

---

## Q3 — Test whether it checks, or just agrees ⭐

> **"Nadia Osei said self-employed clients in Calgary are seeing payment increases of 70 to 130 percent. Is that accurate according to the renewal data?"**

**Work IQ should surface:** Nadia's 2 July email — self-employed originated 2021–22
near 2% on 25-year amortizations, renewing at 4.8–5.2%, *"payment goes up seventy to a
hundred and thirty percent."* Repeated in her Teams post and the branch leaders sync.

**Fabric IQ actually shows** — BR-303 self-employed, 5 files, CAD 3,028,000:

| Customer | Balance | Payment shock |
|---|---:|---:|
| Farah Thibault | 433,000 | **154.7%** |
| Beatrice Karim | 671,000 | 113.5% |
| Simone Aziz | 662,000 | 70.8% |
| Henrik Thibault | 753,000 | 49.0% |
| Beatrice Mehta | 509,000 | 45.6% |

**Actual range: 45.6% – 154.7%.** Nadia's range is wrong at *both* ends — the floor is
lower than she said (two files below 50%) and the ceiling is higher (154.7% exceeds
her 130%). Book-wide maximum is 171.0%.

**Pass:** the agent checks and reports the real range rather than repeating hers.

**Fail:** restating "70 to 130 percent" as fact because a senior person said it. This
is the most important test in the set — an agent that launders unverified human claims
as data is worse than no agent, because it makes the claim look validated.

**Bonus:** note that **none of the BR-303 self-employed files are High risk** — all
Medium. Severe payment shock is not, by itself, driving the attrition score.

---

## Q4 — Apply an executive standard as a data filter ⭐

> **"Diane Lafleur set a standard for proactive customer contact. Which renewals currently breach it, and what are they worth?"**

**Work IQ should surface:** Diane's 15 June email, non-negotiable #3 — *"Contact 120
days out, not 30. Our data says a client contacted inside 45 days of maturity is
already talking to someone else."* Plus Marcus's complaint that sub-300k renewals go
untouched until the automated 30-day letter.

**Fabric IQ should identify:** `renewal_stage = Not Started` **and**
`days_to_maturity ≤ 120` — **6 files, CAD 3,577,000**, of which **1 is High risk**:

| Customer | Branch | Days | Risk | Balance |
|---|---|---:|---|---:|
| Farah Thibault | BR-303 | 46 | Medium | 433,000 |
| **Marta Park** | BR-101 | **52** | **High** | 445,000 |
| Rahul Castellanos | BR-303 | 80 | Low | 776,000 |
| Ayesha Haddadi | BR-303 | 99 | Medium | 542,000 |
| Felix Benali | BR-101 | 111 | Medium | 719,000 |
| Simone Aziz | BR-303 | 111 | Medium | 662,000 |

**Good answer:** names the breaching files and leads with **Marta Park** — High risk,
52 days out, still untouched. That is the single most urgent file in the book by
Diane's own standard.

This is the strongest demo question: a *policy stated in an email* becomes a *filter
on governed data*, producing an actionable worklist. Neither layer can do it alone.

---

## Q5 — Turn a cultural warning into a worklist

> **"Marcus warned that advisors are treating the attrition score as gospel. Which low-risk customers might be getting neglected despite being valuable?"**

**Work IQ should surface:** Marcus's 28 July email and Branch Leaders Forum post —
advisors skipping proactive contact on anything scored Low; *"a Low-scored client with
a three hundred thousand dollar deposit balance still deserves a call."* Karen
Whitfield: the score informs prioritisation, it does not authorise omission (an OSFI
E-23 model-use point). Diane: nobody with a material deposit balance goes uncontacted.

**Fabric IQ should identify:** Low band = 6 renewals; **4 hold 4+ products**:

| Customer | Segment | Products | Exposure | Stage |
|---|---|---:|---:|---|
| Farah Leclair | High Net Worth | 4 | 14,122 | Advisor Contacted |
| **Rahul Castellanos** | High Net Worth | **7** | 10,212 | **Not Started** ⚠ |
| Nikhil Petrov | Mass Market | 4 | 5,844 | Offer Sent |
| **Sana Moreau** | Mass Market | 4 | 4,128 | **Not Started** ⚠ |

**The answer Marcus was worried about:** **Rahul Castellanos** — High Net Worth,
**seven products**, scored Low, **Not Started**. The deepest relationship in the Low
band and nobody has called him. Exactly the failure mode Marcus predicted, now named.

---

## Q6 — Three layers at once

> **"How many renewals would require written competitor evidence under our pricing policy, and what triggered that rule?"**

**Foundry IQ (policy):** RP-002 — up to 20 bps a dated screenshot or advisor-attested
verbal quote suffices; **above 20 bps a written competitor commitment on letterhead or
lender-portal PDF is mandatory.**

**Work IQ (origin):** Jonas Berg's 20 July escalation — a client showed him a phone
screenshot 22 bps under the floor, no letterhead, no client name; *"every advisor is
deciding this differently, which is the thing an audit will find."* Liam confirms he'd
invented his own rule. Settled at the 22 July Renewal Council; Karen added that the
rationale field is mandatory at every level.

**Fabric IQ (scope):** **20 renewals** have a competitor gap **above 20 bps** —
CAD 149,385 of annual revenue exposure. By branch: BR-101 **7**, BR-202 **9**,
BR-303 **4**. Separately, **17** carry a rate-shopping signal.

**Good answer:** states the threshold, cites RP-002, attributes the rule to Jonas's
escalation and the 22 July Council, and quantifies 20 affected renewals — noting
Montréal carries the largest share, consistent with Derek's regional-grid argument and
BR-202's 23.4 bps average gap (the widest of the three branches).

---

## Q7 — Trace a single escalation end to end

> **"Walk me through the RNW-5014 escalation. What was requested, what was approved, and what does the renewal data show about that file?"**

**Work IQ should surface:** Wei Zhang's 13 July escalation (EM-008 and the Pricing
Exceptions channel) — 612k balance, 5-year fixed, 41 days to maturity, 11-year client
with chequing + LOC + locked-in RRSP, ~190k household deposits, written competitor
offer at 4.62 against a 4.94 floor, **32 bps requested**. Derek's 14 July decision:
**approved at 28 bps, not 32**, conditional on (1) the competitor offer attached as a
PDF, (2) the chequing account remaining primary for the term, (3) logging in the
quarterly exception report to Risk. Derek also notes it is the sixth BR-202 exception
that quarter.

**Fabric IQ should confirm:** balance **CAD 612,000**, branch **BR-202**, advisor
**Wei Zhang**, **41 days** to maturity, competitor gap **32 bps**, tenure **11 years**,
**4 products held**, attrition band **High**.

**Foundry IQ should add:** RP-002 — above 25 bps is a **Pricing Committee** decision,
not a Director one, so Derek correctly took it to committee out of cycle. RP-002 also
requires written evidence above 20 bps, which is why the PDF condition was attached.

**Pass:** the numbers from the email and the data agree, and the agent explains *why*
28 rather than 32 was approved.

> The five renewal IDs named in the email corpus (**RNW-5014, RNW-5033, RNW-5008,
> RNW-5021, RNW-5044**) are reconciled with the Fabric data as of 2026-08-03, so
> ID-specific questions are safe. Sophie's three Québec files (5008, 5021, 5044) total
> exactly **CAD 1,400,000**, matching her 31 July email.

---

## What each question tests

| # | Tests | Failure mode it catches |
|---|---|---|
| Q1 | corroboration | repeating a claim without checking |
| Q2 | quantifying a qualitative concern | vague "several files" answers |
| Q3 | **contradicting a human** ⭐ | laundering unverified claims as data |
| Q4 | **policy-as-filter** ⭐ | can't turn narrative into a query |
| Q5 | narrative → named worklist | generic advice instead of specific names |
| Q6 | three-layer synthesis | dropping a layer silently |
| Q7 | single-thread traceability | can't join an ID across layers |

**Q3 and Q4 are the ones to watch.** Q3 is the trust test — will it push back on a
senior stakeholder when the data disagrees? Q4 is the value test — can it convert an
executive instruction into an actionable list?
