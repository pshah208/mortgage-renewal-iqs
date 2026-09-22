# Fabric notebook source

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()
spark.sql("CREATE SCHEMA IF NOT EXISTS silver")

SOURCE_TABLES = {
    "customers": "mortgage_reference.customers",
    "branch_performance": "mortgage_reference.branch_performance",
    "retention_offers": "mortgage_reference.retention_offers",
    "mortgage_renewals": "mortgage_operations.mortgage_renewals",
    "renewal_risk_scores": "mortgage_signals.renewal_risk_scores",
}

DATE_COLUMNS = {
    "customers": [],
    "branch_performance": ["as_of_date"],
    "retention_offers": [],
    "mortgage_renewals": ["origination_date", "maturity_date", "as_of_date"],
    "renewal_risk_scores": ["scored_on"],
}

for name, source in SOURCE_TABLES.items():
    frame = spark.table(source)
    for column in DATE_COLUMNS[name]:
        frame = frame.withColumn(column, F.to_date(F.col(column)))
    frame = frame.dropDuplicates()
    frame.write.format("delta").mode("overwrite").option(
        "overwriteSchema", "true"
    ).saveAsTable(f"silver.{name}")
    print(f"conformed silver.{name}")
