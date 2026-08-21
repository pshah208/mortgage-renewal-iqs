"""The approved retention offer catalogue, RP-003.

WHY THIS LIVES IN THE BFF
-------------------------
A flyer is customer-facing material, and RP-003 is explicit about what that
means:

    "Any offer not listed requires Pricing Committee approval **before it is
    presented to a client**."
    "SEGMENT INTEGRITY. Offers may not be presented outside their eligible
    segments."

So the app cannot simply render whatever offer the model proposes — it has to be
able to say no. That check must be deterministic, which rules out asking the
model to mark its own homework.

The catalogue is transcribed from the RP-003 record in
`data/foundry-iq/renewal_policies.json`, the same file that seeds the Azure AI
Search index behind Foundry IQ. It is duplicated here rather than read from that
file because the BFF image only copies `src/bff`, and shipping the whole demo
data directory into a container to read one record is worse than a transcription
with a citation. If RP-003 changes, this changes with it.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class Offer:
    code: str
    name: str
    #: Maximum rate discount in basis points. Zero where the offer is cash-only.
    max_bps: int
    #: Maximum cash component in Canadian dollars. Zero where there is none.
    max_cash: int
    segments: tuple[str, ...]
    approver: str
    condition: str


SEGMENTS = (
    "Mass Market",
    "Mass Affluent",
    "New to Canada",
    "Self-Employed",
    "High Net Worth",
)

CATALOGUE: tuple[Offer, ...] = (
    Offer(
        "OFR-01", "Loyalty Rate Match", 15, 0,
        ("Mass Market", "Mass Affluent", "New to Canada"),
        "Mortgage Advisor",
        "Requires a documented competitor offer per RP-002.",
    ),
    Offer(
        "OFR-02", "Relationship Bundle Discount", 20, 0,
        ("Mass Affluent", "High Net Worth", "Self-Employed"),
        "Branch Manager",
        "Requires three or more products held, including a chequing account.",
    ),
    Offer(
        "OFR-03", "Early Renewal Lock (120-day)", 10, 0,
        ("Mass Market", "Mass Affluent", "New to Canada", "Self-Employed"),
        "Mortgage Advisor",
        "Locks the posted-less-discount rate up to 120 days before maturity.",
    ),
    Offer(
        "OFR-04", "Cashback Retention Offer", 0, 1500,
        ("Mass Market", "New to Canada"),
        "Branch Manager",
        "Clawback on early payout must be disclosed in writing before acceptance.",
    ),
    Offer(
        "OFR-05", "Private Wealth Preferred Pricing", 35, 0,
        ("High Net Worth",),
        "Regional Director",
        "Requires CAD 1M or more investable assets held at the bank, verified at offer.",
    ),
    Offer(
        "OFR-06", "Blend and Extend", 12, 0,
        ("Mass Affluent", "High Net Worth", "Self-Employed"),
        "Branch Manager",
        "A straight blend with no increase in principal needs no re-qualification.",
    ),
    Offer(
        "OFR-07", "Amortization Relief Renewal", 5, 0,
        ("Mass Market", "New to Canada", "Self-Employed"),
        "Credit Risk",
        "Governed by RP-006; TDS/GDS re-testing outside the straight-renewal fast path.",
    ),
    Offer(
        "OFR-08", "Switch-In Defence Pricing", 25, 500,
        ("Mass Market", "Mass Affluent"),
        "Pricing Committee",
        "Only where a confirmed competitor switch package exists, evidenced per RP-002.",
    ),
)


def catalogue() -> list[dict]:
    return [asdict(o) for o in CATALOGUE]
