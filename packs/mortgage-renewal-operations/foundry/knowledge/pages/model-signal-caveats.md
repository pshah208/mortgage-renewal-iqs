# Risk model and signal caveats

The attrition model produces a score, band, likelihood, drivers, and a
recommended offer. These are derived signals, not observed customer intent.
Always report `model_version` and `scored_on` when they are available.

The score supports queue prioritization and does not authorize omission,
pricing, or an eligibility decision. Users must be able to override a
model-driven recommendation with a recorded rationale. Model validation,
explainability, prohibited-attribute and proxy testing, drift monitoring, and
privacy assessment are required before and during client-facing use.

Payment shock, rate-shopping, service complaints, digital engagement, tenure,
and relationship depth can explain a signal but do not independently prove
financial difficulty, intent to leave, or suitability for an offer.
