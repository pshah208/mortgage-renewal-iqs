# Fabric notebook source

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()
spark.sql("CREATE SCHEMA IF NOT EXISTS gold")

requested_cutoff = "__GOLD_AS_OF_DATE__"
cutoff_value = (
    requested_cutoff
    if requested_cutoff != "__GOLD_AS_OF_DATE__"
    else spark.table("silver.mortgage_renewals").agg(F.max("as_of_date")).first()[0]
)
if cutoff_value is None:
    raise RuntimeError("No source as_of_date is available for the Gold cutoff")
cutoff = F.to_date(F.lit(str(cutoff_value)))

cutoff_columns = {
    "customers": None,
    "branch_performance": "as_of_date",
    "retention_offers": None,
    "mortgage_renewals": "as_of_date",
    "renewal_risk_scores": "scored_on",
}

for name, date_column in cutoff_columns.items():
    frame = spark.table(f"silver.{name}")
    if date_column:
        frame = frame.where(F.to_date(F.col(date_column)) <= cutoff)
    frame.write.format("delta").mode("overwrite").option(
        "overwriteSchema", "true"
    ).saveAsTable(f"gold.{name}")

metadata = spark.createDataFrame(
    [(str(cutoff_value), "mortgage-renewal-operations", "checkpoint-3")],
    ["gold_as_of_date", "pack_id", "pipeline_version"],
)
metadata.write.format("delta").mode("overwrite").option(
    "overwriteSchema", "true"
).saveAsTable("gold.deployment_metadata")
