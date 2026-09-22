# Fabric notebook source
# Source contract validation only; no credentials or management-plane calls.

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()

EXPECTED = {
    "customers": {"customer_id", "branch_id", "primary_advisor_id", "segment"},
    "branch_performance": {"branch_id", "as_of_date", "renewals_next_180d"},
    "retention_offers": {"offer_id", "eligible_segments", "required_approval_level"},
    "mortgage_renewals": {
        "renewal_id", "customer_id", "maturity_date", "days_to_maturity", "as_of_date"
    },
    "renewal_risk_scores": {
        "renewal_id", "attrition_risk_score", "attrition_risk_band", "model_version", "scored_on"
    },
}

SOURCE_TABLES = {
    "customers": "mortgage_reference.customers",
    "branch_performance": "mortgage_reference.branch_performance",
    "retention_offers": "mortgage_reference.retention_offers",
    "mortgage_renewals": "mortgage_operations.mortgage_renewals",
    "renewal_risk_scores": "mortgage_signals.renewal_risk_scores",
}

for name, table in SOURCE_TABLES.items():
    frame = spark.table(table)
    missing = EXPECTED[name] - set(frame.columns)
    if missing:
        raise RuntimeError(f"{table} is missing columns: {sorted(missing)}")
    if frame.limit(1).count() == 0:
        raise RuntimeError(f"{table} is empty")
    print(f"validated {table}: {len(frame.columns)} columns")

renewals = spark.table(SOURCE_TABLES["mortgage_renewals"])
invalid_window = renewals.where(
    (F.col("days_to_maturity") < 0) | (F.col("days_to_maturity") > 180)
)
if invalid_window.limit(1).count():
    raise RuntimeError("mortgage_renewals contains rows outside the 0-180 day window")

print("source validation succeeded")
