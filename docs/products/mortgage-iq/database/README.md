# database

### Database

No conventional application database was found. The analytics store is Microsoft Fabric:

- CSV source data under `data/fabric-iq/`.
- OneLake lakehouse `lh_mortgage_renewals`.
- Delta tables loaded by `load_renewals_fabric.py`.
- Direct Lake semantic model `sm_mortgage_renewals`.

### Owner

- **Unknown:** operational data owner is not recorded.
- Generator and deployment code lives in `data/fabric-iq/`.

### Consumers

- Foundry agent uses the governed semantic model first.
- SQL analytics endpoint is an optional fallback.
- Local CSVs are the final fallback for demos.

Verified in root `README.md:143-192`.

### Schema highlights

- Raw: `customers`, `mortgage_renewals`, `renewal_risk_scores`, `retention_offers`, `branch_performance`.
- Curated: `renewal_attrition_risk`, `renewal_segment_summary`.
- Relationships connect curated risk data to offers and branch performance.
- Measures include renewals, balance, exposure, value at risk, high-risk counts, and payment/LTV splits.

### Migration approach

- Deterministic generation uses seed `20260803`.
- Fabric deployment scripts create/upload/run notebooks.
- **Unknown:** no schema migration/versioning or rollback process was found.

### Risks

- Data is synthetic and anchored to `AS_OF = 2026-08-03`.
- Semantic model and Delta tables can drift from the agent's expected measures.
- SQL fallback needs ODBC Driver 18.

### Open questions

- **Unknown:** retention policy for generated/seeded data.
- **Unknown:** who approves schema or measure changes.
