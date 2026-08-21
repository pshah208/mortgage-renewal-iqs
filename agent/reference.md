# Reference — IDs, people and data dictionary

Quick lookup for the Mortgage Renewal Concierge demo dataset.
Regenerated 2026-08-03 after narrative reconciliation. All values synthetic.

> **SYNTHETIC DEMO DATA.** CFC Bank is a branding label only. No customer,
> balance, rate, policy or person here reflects real CFC Bank information.

---

## ID schemes

| Prefix | Range | Meaning |
|---|---|---|
| `RNW-` | RNW-5001 – RNW-5050 | Renewal (a mortgage maturing inside 180 days) |
| `CUST-` | CUST-1001 – CUST-1050 | Customer. 1:1 with renewals — `RNW-50NN` ↔ `CUST-10NN` |
| `BR-` | BR-101, BR-202, BR-303 | Branch |
| `ADV-` | ADV-011 … ADV-032 | Advisor. `ADV-0` + branch digit + sequence |
| `OFR-` | OFR-01 – OFR-08 | Retention offer catalogue |
| `RP-` | RP-001 – RP-010 | Policy document (Foundry IQ / AI Search index) |
| `EM-` | EM-001 – EM-018 | Email (source JSON only — the mailbox copies carry no ID) |
| `TC-` | TC-101 – TC-304 | Teams conversation (source JSON only) |

**As-of date:** 2026-08-03. Renewals mature between 11 and 180 days out.

---

## Branches

| ID | Name | Province | Renewals | Balance maturing | High-risk | Exposure | Branch manager |
|---|---|---|---:|---:|---:|---:|---|
| **BR-101** | Toronto Bay & Bloor | ON | **18** | 10,502,000 | 4 | 147,882 | Marcus Delaney |
| **BR-202** | Montréal Plateau | QC | 16 | 6,970,000 | **7** | 104,916 | Sophie Tremblay |
| **BR-303** | Calgary Centre Street | AB | 16 | 8,971,000 | 2 | 126,937 | Nadia Osei |

Avg competitor gap: BR-101 16.4 bps · BR-202 **23.4 bps** · BR-303 15.2 bps
Avg payment shock: BR-101 101.9% · BR-202 **109.5%** · BR-303 90.8%

---

## Advisors

| ID | Advisor | Branch | Files | Appears in |
|---|---|---|---:|---|
| ADV-011 | Liam O'Connor | BR-101 | 9 | approval-latency feedback (EM-005) |
| ADV-012 | Priya Raghavan | BR-101 | 9 | stale grid, broker channel (EM-006) |
| ADV-021 | Wei Zhang | BR-202 | 9 | **RNW-5014 escalation** (EM-008) |
| ADV-022 | Camille Fortin | BR-202 | 7 | French-language gaps (EM-007) |
| ADV-031 | Fatima Haddad | BR-303 | 9 | three amortization files (EM-010) |
| ADV-032 | Jonas Berg | BR-303 | 7 | **RNW-5033 evidence question** (EM-011) |

---

## Personas → tenant accounts

| Persona | Role | UPN | Object ID |
|---|---|---|---|
| Diane Lafleur | EVP, Personal Banking | `LisaT@` | — |
| **Raj Balakrishnan** | VP, Real Estate Secured Lending · **demo driver** | **`MarioR@`** | `34e1d06e-b2b0-459d-85ec-39bb2898b011` |
| Karen Whitfield | Chief Risk Officer | `MonicaT@` | — |
| Derek Fontaine | Director, Mortgage Pricing | `OmarB@` | `709b33a9-1c57-4e05-acfb-1c1714e6dec3` |
| Helena Vasquez | Director, Regulatory Compliance | `KaiC@` | — |
| Marcus Delaney | BM, BR-101 | `AdilE@` | — |
| Sophie Tremblay | BM, BR-202 | `AmberR@` | `232478da-c877-44ab-8381-23b0d7ae1490` |
| Nadia Osei | BM, BR-303 | `BillieV@` | — |
| Liam O'Connor | Sr Advisor ADV-011 | `CoraT@` | — |
| Priya Raghavan | Advisor ADV-012 | `CoreyG@` | — |
| Wei Zhang | Sr Advisor ADV-021 | `DaichiM@` | — |
| Camille Fortin | Advisor ADV-022 | `DakotaS@` | — |
| Fatima Haddad | Sr Advisor ADV-031 | `EkaS@` | — |
| Jonas Berg | Advisor ADV-032 | `HadarC@` | — |

Domain: `@M365CPI65678641.OnMicrosoft.com` · Tenant `cf54b15b-1866-486f-88d6-7ba81bf35aa1`
Originals for `--restore-users` are in `data/work-iq/user_mapping.restore.json`.

---

## Retention offers

| ID | Offer | Max discount | Cashback | Approval | Count |
|---|---|---:|---:|---|---:|
| OFR-01 | Loyalty Rate Match | 15 bps | — | Advisor | 6 |
| OFR-02 | Relationship Bundle Discount | 20 bps | — | Branch Manager | 11 |
| OFR-03 | Early Renewal Lock (120-day) | 10 bps | — | Advisor | 2 |
| OFR-04 | Cashback Retention Offer | — | 1,500 | Branch Manager | 0 |
| OFR-05 | Private Wealth Preferred Pricing | 35 bps | — | Regional Director | 4 |
| OFR-06 | Blend & Extend | 12 bps | — | Branch Manager | 0 |
| OFR-07 | Amortization Relief Renewal | 5 bps | — | Credit Risk | **16** |
| OFR-08 | Switch-In Defence Pricing | 25 bps | 500 | Pricing Committee | 11 |

---

## Policy documents (Foundry IQ)

| ID | Title | Category |
|---|---|---|
| RP-001 | Renewal Pricing Guardrails — National Discount Grid | pricing_guardrail |
| RP-002 | Discretionary Pricing Approval Matrix and Competitor Evidence Standard | approval_requirement |
| RP-003 | Retention Offer Catalogue — Eligibility and Approval | approval_requirement |
| RP-004 | OSFI Guideline B-20 — Application to Mortgage Renewals | regulatory_reference |
| RP-005 | OSFI Guideline E-23 — Model Risk Management for the Attrition Model | regulatory_reference |
| RP-006 | Amortization Relief Fast Path for Straight Renewals | approval_requirement |
| RP-007 | Fair Treatment of Clients at Renewal — Conduct and Disclosure | risk_consideration |
| RP-008 | Regional Pricing Variation — Governance and Evidence | pricing_guardrail |
| RP-009 | Renewal Portfolio Risk Considerations and Concentration Limits | risk_consideration |
| RP-010 | Renewal Escalation Procedure and Service Standards | approval_requirement |

---

## The five renewals named in the email corpus

Reconciled 2026-08-03 — Work IQ and Fabric IQ now agree on these.

| ID | Customer | Branch | Advisor | Balance | Days | Gap | Referenced in |
|---|---|---|---|---:|---:|---:|---|
| **RNW-5014** | Josephine Novak | BR-202 | Wei Zhang | 612,000 | 41 | 32 bps | EM-008/009, TC-301 — 32 bps requested, **28 approved** |
| **RNW-5033** | Mateo Bergeron | BR-303 | Jonas Berg | 388,000 | 37 | 22 bps | EM-011, TC-302 — screenshot evidence question |
| **RNW-5008** | Simone Fitzgerald | BR-202 | Camille Fortin | 517,000 | 22 | 35 bps | EM-017, TC-304 — Québec grid |
| **RNW-5021** | Simone Marchetti | BR-202 | Wei Zhang | 465,000 | 18 | 38 bps | EM-017, TC-304 — Québec grid |
| **RNW-5044** | Tariq Marchetti | BR-202 | Camille Fortin | 418,000 | 26 | 41 bps | EM-017, TC-304 — Québec grid |

Sophie's three Québec files total **CAD 1,400,000**, matching her 31 July email.

---

## Portfolio totals

| Measure | Value |
|---|---:|
| Renewals in 180 days | 50 |
| Balance maturing | CAD 26,443,000 |
| Annual revenue exposure | CAD 379,735 |
| Five-year lifetime value | CAD 1,660,530 |
| **Value at Risk** | **CAD 212,460.58** |
| High / Medium / Low | 13 / 31 / 6 |
| Balance above 80% LTV | CAD 4,409,000 |
| Balance above 60% payment shock | CAD 22,714,000 |
| Rate-shopping signals | 17 |
| Avg payment shock | 100.8% |
| Avg competitor gap | 18.3 bps |
| Avg LTV | 66.9% |

**Segments:** Mass Affluent 13 · Mass Market 17 · New to Canada 9 · Self-Employed 7 · High Net Worth 4

---

## Full renewal roster

| RNW | Customer | Br | Advisor | Balance | Days | Band | Segment |
|---|---|---|---|---:|---:|---|---|
| 5001 | Sana Mehta | BR-101 | Liam O'Connor | 736,000 | 63 | Medium | Mass Affluent |
| 5002 | Bruno Castellanos | BR-303 | Jonas Berg | 511,000 | 30 | Medium | New to Canada |
| 5003 | Rahul Park | BR-101 | Liam O'Connor | 549,000 | 110 | Medium | Mass Affluent |
| 5004 | Beatrice Karim | BR-303 | Fatima Haddad | 671,000 | 164 | Medium | Self-Employed |
| 5005 | Aiden Larsen | BR-202 | Wei Zhang | 213,000 | 165 | Low | Mass Market |
| 5006 | Andre Cardoso | BR-101 | Liam O'Connor | 300,000 | 147 | Medium | Mass Market |
| 5007 | Beatrice Mehta | BR-303 | Fatima Haddad | 509,000 | 92 | Medium | Self-Employed |
| **5008** | Simone Fitzgerald | BR-202 | Camille Fortin | 517,000 | 22 | High | Mass Affluent |
| 5009 | Valeria Guerrero | BR-101 | Priya Raghavan | 291,000 | 72 | High | Mass Market |
| 5010 | Gustav Haddadi | BR-101 | Liam O'Connor | 909,000 | 149 | Medium | High Net Worth |
| 5011 | Amara Lachance | BR-202 | Camille Fortin | 215,000 | 16 | High | Mass Market |
| 5012 | Rosa Bergeron | BR-202 | Wei Zhang | 555,000 | 119 | Medium | Mass Affluent |
| 5013 | Ayesha Novak | BR-303 | Fatima Haddad | 711,000 | 100 | Medium | Mass Affluent |
| **5014** | Josephine Novak | BR-202 | Wei Zhang | 612,000 | 41 | High | Mass Affluent |
| 5015 | Naomi Iyer | BR-101 | Priya Raghavan | 798,000 | 43 | Medium | Self-Employed |
| 5016 | Farah Thibault | BR-303 | Fatima Haddad | 433,000 | 46 | Medium | Self-Employed |
| 5017 | Ravi Sokolov | BR-303 | Jonas Berg | 544,000 | 174 | Medium | Mass Affluent |
| 5018 | Farah Leclair | BR-101 | Priya Raghavan | 941,000 | 138 | Low | High Net Worth |
| 5019 | Yuki Karim | BR-101 | Priya Raghavan | 344,000 | 37 | Low | Mass Market |
| 5020 | Nikhil Petrov | BR-303 | Fatima Haddad | 394,000 | 77 | Low | Mass Market |
| **5021** | Simone Marchetti | BR-202 | Wei Zhang | 465,000 | 18 | High | Mass Market |
| 5022 | Omar Kowalski | BR-101 | Liam O'Connor | 444,000 | 136 | Medium | Mass Market |
| 5023 | Felix Benali | BR-101 | Priya Raghavan | 719,000 | 111 | Medium | Self-Employed |
| 5024 | Simone Siddiqui | BR-101 | Liam O'Connor | **1,299,000** | 132 | Medium | High Net Worth |
| 5025 | Henrik Thibault | BR-303 | Jonas Berg | 753,000 | 75 | Medium | Self-Employed |
| 5026 | Nadia Silva | BR-202 | Camille Fortin | 613,000 | 162 | Medium | New to Canada |
| 5027 | Simone Aziz | BR-303 | Fatima Haddad | 662,000 | 111 | Medium | Self-Employed |
| 5028 | Lucas Aziz | BR-101 | Priya Raghavan | 354,000 | 46 | High | New to Canada |
| 5029 | Ayesha Haddadi | BR-303 | Fatima Haddad | 542,000 | 99 | Medium | New to Canada |
| 5030 | Felix Solberg | BR-202 | Wei Zhang | 717,000 | 51 | Medium | Mass Affluent |
| 5031 | Valeria Okonkwo | BR-303 | Jonas Berg | 521,000 | 111 | Medium | Mass Affluent |
| 5032 | Leila Beaulieu | BR-202 | Wei Zhang | 347,000 | 56 | Medium | New to Canada |
| **5033** | Mateo Bergeron | BR-303 | Jonas Berg | 388,000 | 37 | High | Mass Market |
| 5034 | Samuel Sinclair | BR-202 | Camille Fortin | 254,000 | 134 | High | Mass Market |
| 5035 | Andre Petrov | BR-202 | Camille Fortin | 254,000 | 180 | Medium | Mass Market |
| 5036 | Bruno Cardoso | BR-101 | Priya Raghavan | 657,000 | 143 | Medium | Mass Affluent |
| 5037 | Sana Sinclair | BR-303 | Jonas Berg | 475,000 | 86 | Medium | New to Canada |
| 5038 | **Rahul Castellanos** | BR-303 | Fatima Haddad | 776,000 | 80 | Low | High Net Worth |
| 5039 | Aiden Rossi | BR-101 | Liam O'Connor | 444,000 | 175 | Medium | Mass Market |
| 5040 | **Clara Thibault** | BR-101 | Liam O'Connor | 343,000 | **11** | High | Mass Market |
| 5041 | Caleb Yusuf | BR-202 | Wei Zhang | 725,000 | 110 | Medium | Mass Affluent |
| 5042 | Lucas Petrov | BR-202 | Wei Zhang | 212,000 | 102 | High | Mass Market |
| 5043 | Andre Ellsworth | BR-202 | Camille Fortin | 339,000 | 83 | Medium | Mass Market |
| **5044** | Tariq Marchetti | BR-202 | Camille Fortin | 418,000 | 26 | High | Mass Market |
| 5045 | Dmitri Iyer | BR-101 | Liam O'Connor | 665,000 | 166 | Medium | Mass Affluent |
| 5046 | Bruno Kowalski | BR-202 | Wei Zhang | 514,000 | 127 | Medium | Mass Affluent |
| 5047 | Hassan Kowalski | BR-303 | Jonas Berg | 631,000 | 56 | High | New to Canada |
| 5048 | Grace Dufresne | BR-303 | Fatima Haddad | 450,000 | 94 | Medium | New to Canada |
| 5049 | Sana Moreau | BR-101 | Priya Raghavan | 264,000 | 121 | Low | Mass Market |
| 5050 | **Marta Park** | BR-101 | Priya Raghavan | 445,000 | 52 | High | New to Canada |

### Useful rows for demos

| Row | Why |
|---|---|
| **RNW-5040** Clara Thibault | most urgent — **11 days**, High risk |
| **RNW-5024** Simone Siddiqui | largest balance — CAD 1,299,000 |
| **RNW-5038** Rahul Castellanos | **7 products, Low band, Not Started** — the client Marcus warned about |
| **RNW-5050** Marta Park | High risk, 52 days, **Not Started** — worst breach of Diane's 120-day rule |
| **RNW-5014** Josephine Novak | the escalation traceable across all three layers |

---

## Environment

| Item | Value |
|---|---|
| Fabric workspace | `ws-mortgage-renewals-demo` · `733b25a0-884f-4a27-adc1-77b7dd35ec79` |
| Lakehouse | `lh_mortgage_renewals` · `6950f951-51f9-426a-ab3b-9897beb8be88` |
| Semantic model | `sm_mortgage_renewals` · `b5e99aa7-479f-420f-9f88-a0c8ecbc048e` |
| Fabric capacity | `fabcap26` (F4, Central US) — **suspend when idle** |
| AI Search | `aisearchrgmortgageiqa7d3b8` · index `renewal-policies` |
| Foundry project | `mortgage-iqs/proj-conceirge` (rg-scotia-iqs) |
| Teams | `Retail Mortgage Renewals FY26` · `65d8408a-fee6-4f3a-8e55-8677e2326e89` |
| SharePoint | `https://m365cpi65678641.sharepoint.com/sites/RetailMortgageRenewalsFY26` |
| Meeting notes | `…/Shared Documents/Renewal Campaign/Meetings` |
