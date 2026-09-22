# Deterministic generation

`generate_fabric_data.py` is the migrated legacy generator for this pack. It has
no network calls, credentials, endpoint configuration, or cloud SDK dependencies.
It uses the fixed seed and `AS_OF` date declared in the script, and writes five
CSV files beside itself:

- `customers.csv`
- `mortgage_renewals.csv`
- `renewal_risk_scores.csv`
- `retention_offers.csv`
- `branch_performance.csv`

Run `python generate_fabric_data.py` from this directory. Existing files are
replaced deterministically. The files preserve the legacy headers and domain
logic; the risk score is a derived signal for prioritization and is not a lending,
pricing, eligibility, or customer-outcome decision.
