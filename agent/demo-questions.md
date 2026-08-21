# Demo questions — nine, three per layer

A short run-sheet. Three questions each for **Fabric IQ**, **Work IQ**, and
**Fabric + Work IQ combined**, with the expected answer beside each so you can tell
retrieval from invention on the spot.

Sign in as **Raj Balakrishnan — `MarioR@M365CPI65678641.OnMicrosoft.com`**.
He sees all 18 emails, both Teams channels sets, the SharePoint library and the
Fabric workspace.

**Before you start:** Fabric capacity `fabcap26` must be **Active**.

Fuller sets: [`test-questions-fabric-iq.md`](test-questions-fabric-iq.md) ·
[`test-questions-cross-layer.md`](test-questions-cross-layer.md) ·
data dictionary in [`reference.md`](reference.md).

---

# Fabric IQ

### F1 — Does the connection work?

> **"How many mortgage renewals are maturing in the next 180 days, what is the total balance maturing, and what is the total annual revenue exposure?"**

**50 renewals · CAD 26,443,000 · CAD 379,735**

Rounded or hedged figures mean it is summarising, not querying.

---

### F2 — Is it using the governed semantic layer? ⭐

> **"What is the total Value at Risk across the renewal book, and which segment carries the most?"**

**CAD 212,460.58 total · highest is Mass Affluent at CAD 60,088.84**

`Value at Risk` is a defined DAX measure — `SUMX(exposure × attrition_risk_score)` —
not a column. It cannot be derived by summing anything. Getting this right proves the
semantic model is genuinely connected; failing it means the agent is reading raw
tables and the semantic layer is doing nothing.

---

### F3 — Will it admit what it doesn't have? ⭐

> **"What is the average credit score of customers renewing in the next 180 days, and how many have made a late payment in the last 12 months?"**

**Correct answer: it doesn't know.**

Neither field exists in the model. A good agent says so and offers what *is*
available — attrition risk score, service complaints, renewal likelihood, payment
shock. **Any number here is a hallucination**, and a fabricated credit score is the
most damaging possible failure in a banking demo.

---

# Work IQ

### W1 — The flagship summary

> **"Summarize discussions from emails, Teams and meetings related to upcoming mortgage renewals."**

Expect four sections:

- **Branch leader concerns** — Marcus/BR-101 advisor capacity (18 maturities, two
  advisors at ~70 files); Sophie/BR-202 competitor pricing 30–40 bps below floor plus
  the stale French rate table; Nadia/BR-303 payment shock among self-employed clients
- **Advisor feedback** — 3–5 day approval latency, no visibility of relationship
  value, lists sorted by maturity rather than value at risk, stale discount grid,
  French-language gaps, clients asking about *payment* while the script leads with
  *rate*, unowned broker renewals
- **Escalations** — RNW-5014 (32 bps requested, **28 approved** with three
  conditions); RNW-5033 (what counts as competitor evidence); Fatima's three
  amortization files; Sophie's Québec grid request
- **Executive guidance** — Diane's three non-negotiables and 60-day direction;
  Karen's four risk conditions and her compliance items

**Watch for:** an answer drawn only from the four SharePoint meeting notes. That is
about a quarter of the corpus and misses most of the advisor and branch-leader
texture. If it never cites an email or a Teams thread, the mail/Teams connection
isn't reaching.

---

### W2 — Specific decisions from a specific meeting

> **"What did the Renewal Council decide on 20 July, and what conditions did the Chief Risk Officer attach?"**

**Six decisions:** advisor discretion 15 → **20 bps**, Branch Manager to **25 bps**
same-day, above 25 remains Pricing Committee · two-tier evidence standard at the
**20 bps** line · amortization relief fast path approved · renewal lists re-sorted by
**value at risk** · Québec handled as a **regional grid** proposal, not more
exceptions · BR-101 floating advisor funded, contact-centre pilot in exchange.
**Explicitly not approved:** a blanket rate match.

**Karen Whitfield's four conditions:** exception *volume* is itself a risk indicator ·
the amortization fast path is bounded by three tests (same borrower, no increase in
principal, no extension past the original contractual amortization) or OSFI **B-20**
applies in full · monthly reporting split by **LTV band and payment-shock band**, not
retention rate · the attrition model is in scope for OSFI **E-23** and needs
validation, explainability and proxy testing.

---

### W3 — Trace one escalation

> **"Walk me through the RNW-5014 rate escalation — who raised it, what was requested, and what was approved?"**

**Wei Zhang**, 13 July. Balance **612,000**, 5-year fixed, **41 days** to maturity,
11-year client holding chequing + LOC + locked-in RRSP, ~190k household deposits.
Written competitor offer at **4.62** against a **4.94** floor → **32 bps requested**.

**Derek Fontaine**, 14 July: **approved at 28 bps, not 32**, conditional on
(1) the competitor offer attached as a **PDF**, (2) the chequing account remaining the
primary payment account for the term, (3) logging in the quarterly exception report to
Risk. Derek also flags it as the **sixth BR-202 exception** that quarter and argues
for a grid change rather than serial exceptions.

---

# Fabric IQ + Work IQ

### C1 — Does it verify, or just agree? ⭐

> **"Nadia Osei said self-employed clients in Calgary are seeing payment increases of 70 to 130 percent. Is that accurate according to the renewal data?"**

**Work IQ:** Nadia's 2 July email and Teams post, repeated at the branch leaders sync.

**Fabric IQ:** BR-303 self-employed — 5 files, CAD 3,028,000, payment shock
**45.6% – 154.7%**:

| Customer | Balance | Shock |
|---|---:|---:|
| Farah Thibault | 433,000 | **154.7%** |
| Beatrice Karim | 671,000 | 113.5% |
| Simone Aziz | 662,000 | 70.8% |
| Henrik Thibault | 753,000 | 49.0% |
| Beatrice Mehta | 509,000 | 45.6% |

**Nadia is wrong at both ends** — two files sit below 50%, and the worst exceeds her
130% ceiling. Book-wide maximum is 171.0%.

**Pass:** reports the actual range. **Fail:** repeats "70 to 130" because a senior
person said it. An agent that launders unverified claims as data is worse than none.

---

### C2 — Turn an executive instruction into a worklist ⭐

> **"Diane Lafleur set a standard for proactive customer contact. Which renewals currently breach it, and what are they worth?"**

**Work IQ:** Diane's 15 June non-negotiable #3 — *"Contact 120 days out, not 30."*

**Fabric IQ:** `Not Started` **and** ≤ 120 days — **6 files, CAD 3,577,000**:

| Customer | Branch | Days | Risk | Balance |
|---|---|---:|---|---:|
| Farah Thibault | BR-303 | 46 | Medium | 433,000 |
| **Marta Park** | BR-101 | **52** | **High** | 445,000 |
| Rahul Castellanos | BR-303 | 80 | Low | 776,000 |
| Ayesha Haddadi | BR-303 | 99 | Medium | 542,000 |
| Felix Benali | BR-101 | 111 | Medium | 719,000 |
| Simone Aziz | BR-303 | 111 | Medium | 662,000 |

**Best answer leads with Marta Park** — High risk, 52 days, still untouched. The most
urgent file in the book by Diane's own rule.

This is the strongest demo moment: a sentence in an email becomes a filter on
governed data. Neither layer can do it alone.

---

### C3 — Quantify an ownership gap

> **"Several branch leaders flagged that broker-originated renewals have no owner. How many are there, what are they worth, and how risky are they?"**

**Work IQ:** Marcus reports 6 at BR-101, Sophie 4, Nadia 3. Diane, 1 August:
*"thirteen files with no owner is an unforced error."*

**Fabric IQ:** **13 files, CAD 7,762,000**, 5 high-risk, CAD 105,263 exposure —
per-branch counts match each leader exactly:

| Branch | Files | Balance | High-risk |
|---|---:|---:|---:|
| BR-101 | **6** | 4,815,000 | 1 |
| BR-202 | **4** | 1,099,000 | **4** |
| BR-303 | **3** | 1,848,000 | 0 |

**Excellent answer** notices that **all four** BR-202 broker files are High risk on the
smallest balance of the three — Sophie reported the fewest files but carries the worst
concentration, so Diane's ownership fix should start in Montréal.

---

## Run sheet

| # | Layer | One-line check |
|---|---|---|
| F1 | Fabric | 50 · 26,443,000 · 379,735 |
| F2 | Fabric ⭐ | Value at Risk = 212,460.58 |
| F3 | Fabric ⭐ | admits no credit-score data |
| W1 | Work | four sections, cites email *and* Teams *and* meetings |
| W2 | Work | six Council decisions + Karen's four conditions |
| W3 | Work | 32 requested, **28 approved**, three conditions |
| C1 | Both ⭐ | corrects Nadia — actual 45.6–154.7% |
| C2 | Both ⭐ | 6 files, leads with Marta Park |
| C3 | Both | 13 files, 6/4/3 split |

**The four starred questions are the ones that matter.** They test whether the agent
uses the governed semantic layer, admits ignorance, contradicts a senior stakeholder
when the data disagrees, and converts narrative into an actionable list. The rest
mostly prove the plumbing works.
