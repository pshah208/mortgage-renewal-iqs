# Fabric notebook source

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()
portfolio = spark.table("gold.renewal_portfolio")

risk_product = (
    portfolio.groupBy("attrition_risk_band", "maturity_bucket")
    .agg(
        F.count("*").alias("renewal_count"),
        F.sum("mortgage_balance_cad").alias("balance_maturing_cad"),
        F.sum("annual_revenue_exposure_cad").alias("annual_revenue_exposure_cad"),
        F.avg("attrition_risk_score").alias("avg_attrition_risk_score"),
        F.avg("payment_shock_pct").alias("avg_payment_shock_pct"),
        F.avg("competitor_rate_gap_bps").alias("avg_competitor_gap_bps"),
    )
    .withColumn(
        "risk_signal_note",
        F.lit("Derived prioritization signal; not a lending, pricing, eligibility, or outcome decision"),
    )
)
risk_product.write.format("delta").mode("overwrite").option(
    "overwriteSchema", "true"
).saveAsTable("gold.renewal_risk_summary")

