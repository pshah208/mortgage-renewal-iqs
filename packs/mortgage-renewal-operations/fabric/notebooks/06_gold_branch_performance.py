# Fabric notebook source

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()
portfolio = spark.table("gold.renewal_portfolio")
branch_reference = spark.table("gold.branch_performance")

branch_product = (
    portfolio.groupBy("branch_id", "branch_name", "province")
    .agg(
        F.count("*").alias("renewals_next_180d"),
        F.sum("mortgage_balance_cad").alias("balance_maturing_cad"),
        F.sum(F.when(F.col("attrition_risk_band") == "High", 1).otherwise(0)).alias(
            "high_risk_count"
        ),
        F.sum("annual_revenue_exposure_cad").alias("annual_revenue_exposure_cad"),
        F.avg("payment_shock_pct").alias("avg_payment_shock_pct"),
        F.avg("attrition_risk_score").alias("avg_attrition_risk_score"),
    )
    .join(
        branch_reference.select(
            "branch_id", "retention_rate_last_quarter_pct",
            "avg_discount_granted_bps", "advisor_capacity_files_per_fte",
            "as_of_date",
        ),
        "branch_id",
        "left",
    )
)
branch_product.write.format("delta").mode("overwrite").option(
    "overwriteSchema", "true"
).saveAsTable("gold.branch_renewal_performance")

