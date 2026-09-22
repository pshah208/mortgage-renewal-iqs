"""Generate the synthetic Fabric IQ dataset for the Mortgage Renewal Concierge.

Deterministic (fixed seed) so the CSVs can be regenerated identically.

    python generate_fabric_data.py

Produces, next to this file:
    customers.csv           50 retail customers across 3 branches
    mortgage_renewals.csv   50 mortgages maturing within the next 180 days
    renewal_risk_scores.csv attrition risk, revenue exposure, recommended offer
    retention_offers.csv    the offer catalogue the recommendations point at
    branch_performance.csv  branch-level renewal retention rollup
"""

from __future__ import annotations

import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 20260803
AS_OF = date(2026, 8, 3)
HORIZON_DAYS = 180
OUT = Path(__file__).parent

random.seed(SEED)

BRANCHES = [
    ("BR-101", "Toronto Bay & Bloor", "ON", "Marcus Delaney"),
    ("BR-202", "Montreal Plateau", "QC", "Sophie Tremblay"),
    ("BR-303", "Calgary Centre Street", "AB", "Nadia Osei"),
]

ADVISORS = [
    ("ADV-011", "Liam O'Connor", "BR-101"),
    ("ADV-012", "Priya Raghavan", "BR-101"),
    ("ADV-021", "Wei Zhang", "BR-202"),
    ("ADV-022", "Camille Fortin", "BR-202"),
    ("ADV-031", "Fatima Haddad", "BR-303"),
    ("ADV-032", "Jonas Berg", "BR-303"),
]

SEGMENTS = [
    # (name, weight, balance range, tenure range, products range)
    ("High Net Worth", 0.10, (720_000, 1_450_000), (9, 24), (4, 7)),
    ("Mass Affluent", 0.24, (430_000, 780_000), (5, 18), (3, 6)),
    ("Mass Market", 0.36, (210_000, 460_000), (2, 14), (1, 4)),
    ("New to Canada", 0.16, (340_000, 640_000), (1, 4), (1, 3)),
    ("Self-Employed", 0.14, (380_000, 820_000), (3, 12), (2, 5)),
]

PRODUCTS = [
    ("5-Year Fixed Closed", 0.46, 60),
    ("3-Year Fixed Closed", 0.20, 36),
    ("2-Year Fixed Closed", 0.08, 24),
    ("5-Year Variable Closed", 0.18, 60),
    ("1-Year Fixed Closed", 0.08, 12),
]

FIRST = [
    "Aiden", "Mei", "Rahul", "Chloe", "Tomas", "Ingrid", "Kwame", "Sofia", "Hassan",
    "Emily", "Andre", "Yuki", "Olivier", "Nadia", "Dmitri", "Grace", "Samuel",
    "Amara", "Lucas", "Farah", "Noah", "Isabelle", "Ravi", "Anika", "Etienne",
    "Marta", "Jae-won", "Beatrice", "Omar", "Helena", "Diego", "Sana", "Felix",
    "Naomi", "Viktor", "Leila", "Caleb", "Rosa", "Tariq", "Josephine", "Mateo",
    "Ayesha", "Gustav", "Simone", "Nikhil", "Clara", "Bruno", "Zainab", "Henrik",
    "Valeria",
]
LAST = [
    "Whitmore", "Chen", "Deshpande", "Beaulieu", "Novak", "Larsen", "Mensah",
    "Rossi", "Karim", "Turner", "Gagnon", "Tanaka", "Lachance", "Petrov",
    "Adeyemi", "Boucher", "Okonkwo", "Sinclair", "Moreau", "Haddadi", "Bergeron",
    "Nakamura", "Iyer", "Kowalski", "Dufresne", "Silva", "Park", "Ellsworth",
    "Farouk", "Vasquez", "Marchetti", "Rahman", "Brandt", "Fitzgerald", "Sokolov",
    "Benali", "Thibault", "Guerrero", "Aziz", "Lindqvist", "Castellanos",
    "Siddiqui", "Hoffmann", "Leclair", "Mehta", "Vandenberg", "Costa", "Yusuf",
    "Solberg", "Cardoso",
]

OFFERS = [
    # offer_id, name, eligible segments, max discount bps, cashback, approval level, notes
    ("OFR-01", "Loyalty Rate Match", "Mass Market|Mass Affluent|New to Canada", 15, 0,
     "Advisor", "Matches a documented written competitor offer up to 15 bps."),
    ("OFR-02", "Relationship Bundle Discount", "Mass Affluent|High Net Worth|Self-Employed", 20, 0,
     "Branch Manager", "Requires 3+ products held, including a chequing account."),
    ("OFR-03", "Early Renewal Lock (120-day)", "Mass Market|Mass Affluent|New to Canada|Self-Employed", 10, 0,
     "Advisor", "Locks the posted-less-discount rate up to 120 days before maturity."),
    ("OFR-04", "Cashback Retention Offer", "Mass Market|New to Canada", 0, 1500,
     "Branch Manager", "Cash incentive in lieu of a rate discount; clawback on early payout."),
    ("OFR-05", "Private Wealth Preferred Pricing", "High Net Worth", 35, 0,
     "Regional Director", "HNW only; requires investable assets >= CAD 1M held at CFC Bank."),
    ("OFR-06", "Blend & Extend", "Mass Affluent|High Net Worth|Self-Employed", 12, 0,
     "Branch Manager", "Blends the existing rate with the new term; no re-qualification for a straight blend."),
    ("OFR-07", "Amortization Relief Renewal", "Mass Market|New to Canada|Self-Employed", 5, 0,
     "Credit Risk", "Extends amortization to ease payment shock; TDS/GDS re-test required."),
    ("OFR-08", "Switch-In Defence Pricing", "Mass Market|Mass Affluent", 25, 500,
     "Pricing Committee", "Deployed only where a confirmed competitor switch package exists."),
]

RISK_DRIVERS = [
    "Competitor rate gap",
    "Payment shock at renewal",
    "Single-product relationship",
    "Low digital engagement",
    "Rate-shopping signal detected",
    "Recent service complaint",
    "Advisor turnover on file",
    "Broker-originated relationship",
    "Declining deposit balances",
    "Short tenure with bank",
]

# ---------------------------------------------------------------------------
# Narrative overrides.
#
# Five renewals are named explicitly in the Work IQ email/Teams corpus, with
# specific balances, branches, timings and competitor gaps. Those rows must agree
# with what the emails say, otherwise an agent joining the two layers surfaces a
# contradiction. These overrides are applied as *seeds* inside the generation
# loop, so every derived field (LTV, payment shock, risk score, revenue exposure,
# recommended offer) is still computed by the normal formulas.
#
# Source of truth for each:
#   RNW-5014  EM-008 / EM-009 / TC-301  Wei Zhang -> Sophie, Derek
#             612k, 5yr fixed, 41 days, 11-year client, chequing + LOC + RRSP,
#             ~190k deposits, competitor 4.62 vs 4.94 floor = 32 bps, High risk
#   RNW-5033  EM-011 / TC-302           Jonas Berg -> Nadia
#             screenshot evidence, 22 bps under floor, 14-year client, BR-303
#   RNW-5008 / RNW-5021 / RNW-5044      EM-017 / TC-304  Sophie -> Derek
#             three Quebec files maturing inside 30 days, ~1.4M combined
# ---------------------------------------------------------------------------
NARRATIVE_OVERRIDES = {
    "RNW-5014": {
        "branch_id": "BR-202",
        "advisor_id": "ADV-021",          # Wei Zhang
        "segment": "Mass Affluent",
        "tenure_years": 11,
        "products_held": 4,               # mortgage + chequing + LOC + locked-in RRSP
        "primary_relationship_flag": "Y",
        "origination_channel": "Branch",
        "loan_amount": 612_000,
        "product": "5-Year Fixed Closed",
        "days_out": 41,
        "current_rate_pct": 2.19,
        "offered_renewal_rate_pct": 4.94,  # the guardrail floor quoted by Derek
        "competitor_rate_gap_bps": 32,     # 4.94 - 4.62
        "rate_shopping_signal": "Y",
        "renewal_stage": "In Negotiation",
        "force_band": "High",
    },
    "RNW-5033": {
        "branch_id": "BR-303",
        "advisor_id": "ADV-032",          # Jonas Berg
        "segment": "Mass Market",
        "tenure_years": 14,
        "products_held": 2,
        "origination_channel": "Branch",
        "loan_amount": 388_000,
        "product": "5-Year Fixed Closed",
        "days_out": 37,
        "current_rate_pct": 2.34,
        "offered_renewal_rate_pct": 4.88,
        "competitor_rate_gap_bps": 22,    # screenshot evidence, above the 20 bps line
        "rate_shopping_signal": "Y",
        "renewal_stage": "In Negotiation",
    },
    # Sophie's three Quebec files - all BR-202, all inside 30 days, 1,400,000 total
    "RNW-5008": {
        "branch_id": "BR-202",
        "advisor_id": "ADV-022",          # Camille Fortin
        "segment": "Mass Affluent",
        "loan_amount": 517_000,
        "days_out": 22,
        "product": "5-Year Fixed Closed",
        "current_rate_pct": 2.04,
        "offered_renewal_rate_pct": 4.91,
        "competitor_rate_gap_bps": 35,
        "rate_shopping_signal": "Y",
        "renewal_stage": "Offer Sent",
        "preferred_language": "FR",
    },
    "RNW-5021": {
        "branch_id": "BR-202",
        "advisor_id": "ADV-021",          # Wei Zhang
        "segment": "Mass Market",
        "loan_amount": 465_000,
        "days_out": 18,
        "product": "5-Year Fixed Closed",
        "current_rate_pct": 2.28,
        "offered_renewal_rate_pct": 4.97,
        "competitor_rate_gap_bps": 38,
        "rate_shopping_signal": "Y",
        "renewal_stage": "In Negotiation",
        "preferred_language": "FR",
    },
    "RNW-5044": {
        "branch_id": "BR-202",
        "advisor_id": "ADV-022",          # Camille Fortin
        "segment": "Mass Market",
        "loan_amount": 418_000,
        "days_out": 26,
        "product": "3-Year Fixed Closed",
        "current_rate_pct": 2.41,
        "offered_renewal_rate_pct": 5.02,
        "competitor_rate_gap_bps": 41,
        "rate_shopping_signal": "Y",
        "renewal_stage": "Offer Sent",
        "preferred_language": "FR",
    },
}


# ---------------------------------------------------------------------------
# Narrative distribution targets.
#
# The Work IQ corpus states these figures explicitly, so they cannot be left to
# random allocation - a reshuffle would silently contradict the emails:
#
#   BR-101 book size   EM-002 / TC-101  Marcus: "18 maturities inside 180 days"
#   broker-originated  TC-201 / EM-018  Marcus 6 + Sophie 4 + Nadia 3 = 13,
#                                       "thirteen files with no owner"
# ---------------------------------------------------------------------------
BRANCH_TARGETS = {"BR-101": 18, "BR-202": 16, "BR-303": 16}      # = 50
BROKER_TARGETS = {"BR-101": 6, "BR-202": 4, "BR-303": 3}         # = 13


def plan_branches(overrides: dict) -> list[str]:
    """Assign a branch to each of the 50 renewals, honouring overrides first."""
    plan: list[str | None] = [None] * 50
    remaining = dict(BRANCH_TARGETS)

    for rid, ov in overrides.items():
        if "branch_id" in ov:
            idx = int(rid.split("-")[1]) - 5001
            plan[idx] = ov["branch_id"]
            remaining[ov["branch_id"]] -= 1

    pool = [b for b, k in remaining.items() for _ in range(k)]
    random.shuffle(pool)
    it = iter(pool)
    return [b if b else next(it) for b in plan]


def plan_channels(branch_plan: list[str], overrides: dict) -> list[str]:
    """Assign an origination channel, hitting the broker targets per branch."""
    plan: list[str | None] = [None] * 50
    remaining = dict(BROKER_TARGETS)

    for rid, ov in overrides.items():
        if "origination_channel" in ov:
            idx = int(rid.split("-")[1]) - 5001
            plan[idx] = ov["origination_channel"]

    for branch, want in remaining.items():
        free = [i for i, b in enumerate(branch_plan) if b == branch and plan[i] is None]
        random.shuffle(free)
        for i in free[:want]:
            plan[i] = "Broker"

    for i, v in enumerate(plan):
        if v is None:
            plan[i] = random.choices(["Branch", "Digital"], weights=[0.78, 0.22], k=1)[0]
    return plan  # type: ignore[return-value]


def weighted(options):
    names = [o[0] for o in options]
    weights = [o[1] for o in options]
    return random.choices(names, weights=weights, k=1)[0]


def money(lo, hi, step=1000):
    return round(random.randint(lo, hi) / step) * step


def main() -> None:
    seg_lookup = {s[0]: s for s in SEGMENTS}
    prod_lookup = {p[0]: p for p in PRODUCTS}

    customers, renewals, risks = [], [], []
    used_names = set()

    branch_plan = plan_branches(NARRATIVE_OVERRIDES)
    channel_plan = plan_channels(branch_plan, NARRATIVE_OVERRIDES)

    for i in range(50):
        cust_id = f"CUST-{1001 + i}"
        renewal_id = f"RNW-{5001 + i}"
        ov = NARRATIVE_OVERRIDES.get(renewal_id, {})

        while True:
            name = f"{random.choice(FIRST)} {random.choice(LAST)}"
            if name not in used_names:
                used_names.add(name)
                break

        branch_id = branch_plan[i]
        branch_name, province = next((b[1], b[2]) for b in BRANCHES if b[0] == branch_id)

        if "advisor_id" in ov:
            advisor_id = ov["advisor_id"]
            advisor_name = next(a[1] for a in ADVISORS if a[0] == advisor_id)
        else:
            advisor_id, advisor_name, _ = random.choice(
                [a for a in ADVISORS if a[2] == branch_id]
            )

        segment = ov.get("segment") or weighted(SEGMENTS)
        _, _, bal_range, tenure_range, prod_range = seg_lookup[segment]

        tenure = ov.get("tenure_years", random.randint(*tenure_range))
        products_held = ov.get("products_held", random.randint(*prod_range))
        digital = random.randint(12, 98)
        nps = random.choice([-40, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80])
        primary = ov.get(
            "primary_relationship_flag",
            "Y" if products_held >= 3 and random.random() > 0.15 else "N",
        )
        channel = channel_plan[i]

        customers.append(
            {
                "customer_id": cust_id,
                "full_name": name,
                "segment": segment,
                "province": province,
                "branch_id": branch_id,
                "branch_name": branch_name,
                "primary_advisor_id": advisor_id,
                "primary_advisor_name": advisor_name,
                "tenure_years": tenure,
                "products_held": products_held,
                "primary_relationship_flag": primary,
                "origination_channel": channel,
                "digital_engagement_score": digital,
                "nps_score": nps,
                "preferred_language": ov.get(
                    "preferred_language",
                    "FR" if province == "QC" and random.random() > 0.4 else "EN",
                ),
            }
        )

        # ---- mortgage ----
        product = ov.get("product") or weighted(PRODUCTS)
        term_months = prod_lookup[product][2]
        balance = ov.get("loan_amount") or money(*bal_range)
        property_value = int(balance / random.uniform(0.42, 0.88))
        ltv = round(balance / property_value * 100, 1)
        insured = "Y" if ltv > 80 else "N"
        current_rate = ov.get("current_rate_pct", round(random.uniform(1.79, 3.24), 2))
        offered_rate = ov.get(
            "offered_renewal_rate_pct", round(random.uniform(4.09, 5.34), 2)
        )
        amort_remaining = random.randint(11, 27)
        days_out = ov.get("days_out", random.randint(6, HORIZON_DAYS))
        maturity = AS_OF + timedelta(days=days_out)
        origination = maturity - timedelta(days=term_months * 30)
        payment_freq = random.choice(
            ["Monthly", "Monthly", "Bi-weekly", "Accelerated Bi-weekly"]
        )
        # payment shock: rough monthly P&I delta
        old_pmt = balance * (current_rate / 100 / 12)
        new_pmt = balance * (offered_rate / 100 / 12)
        payment_shock_pct = round((new_pmt - old_pmt) / max(old_pmt, 1) * 100, 1)

        if "renewal_stage" in ov:
            stage = ov["renewal_stage"]
        elif days_out <= 45:
            stage = random.choice(["Offer Sent", "In Negotiation", "Advisor Contacted"])
        elif days_out <= 120:
            stage = random.choice(["Advisor Contacted", "Not Started", "Offer Sent"])
        else:
            stage = random.choice(["Not Started", "Not Started", "Advisor Contacted"])

        renewals.append(
            {
                "renewal_id": renewal_id,
                "customer_id": cust_id,
                "branch_id": branch_id,
                "advisor_id": advisor_id,
                "product_type": product,
                "term_months": term_months,
                "mortgage_balance_cad": balance,
                "property_value_cad": property_value,
                "ltv_pct": ltv,
                "insured_flag": insured,
                "current_rate_pct": current_rate,
                "offered_renewal_rate_pct": offered_rate,
                "payment_frequency": payment_freq,
                "amortization_remaining_years": amort_remaining,
                "origination_date": origination.isoformat(),
                "maturity_date": maturity.isoformat(),
                "days_to_maturity": days_out,
                "payment_shock_pct": payment_shock_pct,
                "renewal_stage": stage,
                "as_of_date": AS_OF.isoformat(),
            }
        )

        # ---- risk score ----
        competitor_gap = ov.get(
            "competitor_rate_gap_bps",
            random.choice([0, 5, 10, 12, 15, 18, 20, 25, 30, 35, 40]),
        )
        shopping = ov.get(
            "rate_shopping_signal",
            "Y" if competitor_gap >= 20 and random.random() > 0.35 else "N",
        )
        complaint = "Y" if random.random() > 0.86 else "N"

        score = 0.18
        score += min(competitor_gap, 40) / 40 * 0.26
        score += min(payment_shock_pct, 120) / 120 * 0.18
        score += 0.12 if products_held <= 2 else 0.0
        score += 0.08 if primary == "N" else 0.0
        score += 0.09 if channel == "Broker" else 0.0
        score += 0.07 if digital < 35 else 0.0
        score += 0.10 if shopping == "Y" else 0.0
        score += 0.06 if complaint == "Y" else 0.0
        score += 0.05 if tenure <= 3 else 0.0
        score -= 0.10 if segment == "High Net Worth" else 0.0
        score -= 0.06 if nps >= 50 else 0.0
        score += random.uniform(-0.04, 0.04)
        score = round(min(max(score, 0.03), 0.97), 3)

        # A few narrative files are described in the corpus as High risk. Nudge the
        # score into the band rather than overwriting it, so it stays explainable.
        if ov.get("force_band") == "High" and score < 0.68:
            score = round(random.uniform(0.68, 0.78), 3)

        band = "High" if score >= 0.65 else "Medium" if score >= 0.40 else "Low"

        drivers = []
        if competitor_gap >= 20:
            drivers.append("Competitor rate gap")
        if payment_shock_pct >= 55:
            drivers.append("Payment shock at renewal")
        if products_held <= 2:
            drivers.append("Single-product relationship")
        if digital < 35:
            drivers.append("Low digital engagement")
        if shopping == "Y":
            drivers.append("Rate-shopping signal detected")
        if complaint == "Y":
            drivers.append("Recent service complaint")
        if channel == "Broker":
            drivers.append("Broker-originated relationship")
        if tenure <= 3:
            drivers.append("Short tenure with bank")
        if not drivers:
            drivers = [random.choice(RISK_DRIVERS)]
        drivers = drivers[:3]

        # Revenue exposure = net interest margin on balance + ancillary product margin
        nim_bps = random.randint(105, 165)
        annual_ni = round(balance * nim_bps / 10_000, 0)
        ancillary = round(products_held * random.randint(60, 210), 0)
        revenue_exposure = int(annual_ni + ancillary)
        ltv_5yr = int(revenue_exposure * random.uniform(3.4, 5.1))

        # Recommended offer - must respect the segment eligibility in OFFERS
        eligible = {o[0] for o in OFFERS if segment in o[2].split("|")}

        if segment == "High Net Worth":
            preference = ["OFR-05", "OFR-02", "OFR-06"]
        elif shopping == "Y" and competitor_gap >= 25:
            preference = ["OFR-08", "OFR-01", "OFR-02", "OFR-04"]
        elif payment_shock_pct >= 70 and segment in ("Mass Market", "New to Canada", "Self-Employed"):
            preference = ["OFR-07", "OFR-04", "OFR-01"]
        elif products_held >= 3 and segment in ("Mass Affluent", "Self-Employed"):
            preference = ["OFR-02", "OFR-06", "OFR-01"]
        elif band == "High" and segment in ("Mass Market", "New to Canada"):
            preference = ["OFR-04", "OFR-01", "OFR-03"]
        elif competitor_gap >= 10:
            preference = ["OFR-01", "OFR-02", "OFR-03"]
        elif days_out > 120:
            preference = ["OFR-03", "OFR-01", "OFR-02"]
        else:
            preference = ["OFR-06", "OFR-02", "OFR-03", "OFR-01"]

        offer = next((o for o in preference if o in eligible), sorted(eligible)[0])

        risks.append(
            {
                "renewal_id": renewal_id,
                "customer_id": cust_id,
                "segment": segment,
                "attrition_risk_score": score,
                "attrition_risk_band": band,
                "renewal_likelihood_pct": round((1 - score) * 100, 1),
                "top_risk_drivers": "; ".join(drivers),
                "competitor_rate_gap_bps": competitor_gap,
                "rate_shopping_signal": shopping,
                "service_complaint_last_12m": complaint,
                "annual_revenue_exposure_cad": revenue_exposure,
                "five_year_lifetime_value_cad": ltv_5yr,
                "recommended_offer_id": offer,
                "model_version": "attrition-renewal-v2.3",
                "scored_on": AS_OF.isoformat(),
            }
        )

    # ---- branch performance rollup ----
    branch_rows = []
    for bid, bname, prov, mgr in BRANCHES:
        b_renewals = [r for r in renewals if r["branch_id"] == bid]
        b_risks = [x for x in risks if x["renewal_id"] in {r["renewal_id"] for r in b_renewals}]
        bal = sum(r["mortgage_balance_cad"] for r in b_renewals)
        high = sum(1 for x in b_risks if x["attrition_risk_band"] == "High")
        exposure = sum(x["annual_revenue_exposure_cad"] for x in b_risks)
        branch_rows.append(
            {
                "branch_id": bid,
                "branch_name": bname,
                "province": prov,
                "branch_manager": mgr,
                "renewals_next_180d": len(b_renewals),
                "balance_maturing_cad": bal,
                "high_risk_count": high,
                "annual_revenue_at_risk_cad": exposure,
                "retention_rate_last_quarter_pct": round(random.uniform(78.0, 91.5), 1),
                "avg_discount_granted_bps": random.randint(9, 24),
                "advisor_capacity_files_per_fte": random.randint(38, 74),
                "as_of_date": AS_OF.isoformat(),
            }
        )

    offer_rows = [
        {
            "offer_id": o[0],
            "offer_name": o[1],
            "eligible_segments": o[2],
            "max_discount_bps": o[3],
            "cashback_cad": o[4],
            "required_approval_level": o[5],
            "notes": o[6],
        }
        for o in OFFERS
    ]

    def write(name, rows):
        path = OUT / name
        with path.open("w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
        print(f"wrote {path.name:<28} {len(rows):>3} rows")

    write("customers.csv", customers)
    write("mortgage_renewals.csv", renewals)
    write("renewal_risk_scores.csv", risks)
    write("retention_offers.csv", offer_rows)
    write("branch_performance.csv", branch_rows)

    high = sum(1 for r in risks if r["attrition_risk_band"] == "High")
    med = sum(1 for r in risks if r["attrition_risk_band"] == "Medium")
    print(
        f"\nrisk mix -> High {high} | Medium {med} | Low {len(risks) - high - med}"
        f"\ntotal annual revenue exposure: "
        f"CAD {sum(r['annual_revenue_exposure_cad'] for r in risks):,}"
    )


if __name__ == "__main__":
    main()
