# Fabric notebook source

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()
spark.sql("CREATE SCHEMA IF NOT EXISTS gold")

renewals = spark.table("gold.mortgage_renewals").alias("r")
customers = spark.table("gold.customers").alias("c")
risks = spark.table("gold.renewal_risk_scores").alias("s")
branches = spark.table("gold.branch_performance").alias("b")
offers = spark.table("gold.retention_offers").alias("o")

portfolio = (
    renewals.join(customers, "customer_id")
    .join(risks, "renewal_id")
    .join(branches, "branch_id")
    .join(offers, F.col("recommended_offer_id") == F.col("offer_id"), "left")
    .where(F.col("days_to_maturity").between(0, 180))
    .select(
        "renewal_id", "customer_id", "segment", "province", "branch_id", "branch_name",
        "product_type", "mortgage_balance_cad", "property_value_cad", "ltv_pct",
        "maturity_date", "days_to_maturity", "payment_shock_pct", "renewal_stage",
        "attrition_risk_score", "attrition_risk_band", "renewal_likelihood_pct",
        "competitor_rate_gap_bps",
        "annual_revenue_exposure_cad", "five_year_lifetime_value_cad",
        "recommended_offer_id", F.col("offer_name").alias("recommended_offer"),
        "required_approval_level", "model_version", "as_of_date",
    )
    .withColumn(
        "maturity_bucket",
        F.when(F.col("days_to_maturity") <= 30, "0-30 days")
        .when(F.col("days_to_maturity") <= 60, "31-60 days")
        .when(F.col("days_to_maturity") <= 90, "61-90 days")
        .when(F.col("days_to_maturity") <= 120, "91-120 days")
        .otherwise("121-180 days"),
    )
    .withColumn(
        "ltv_band",
        F.when(F.col("ltv_pct") < 65, "Below 65")
        .when(F.col("ltv_pct") <= 80, "65 to 80")
        .otherwise("Above 80"),
    )
    .withColumn(
        "payment_shock_band",
        F.when(F.col("payment_shock_pct") < 25, "Below 25 pct")
        .when(F.col("payment_shock_pct") <= 60, "25 to 60 pct")
        .otherwise("Above 60 pct"),
    )
)

portfolio.write.format("delta").mode("overwrite").option(
    "overwriteSchema", "true"
).saveAsTable("gold.renewal_portfolio")

(
    portfolio.groupBy("segment")
    .agg(
        F.count("*").alias("renewals_next_180d"),
        F.sum("mortgage_balance_cad").alias("balance_maturing_cad"),
        F.avg("renewal_likelihood_pct").alias("avg_renewal_likelihood_pct"),
        F.sum(F.when(F.col("attrition_risk_band") == "High", 1).otherwise(0)).alias(
            "high_risk_count"
        ),
        F.sum("annual_revenue_exposure_cad").alias("annual_revenue_exposure_cad"),
    )
    .write.format("delta").mode("overwrite").option("overwriteSchema", "true")
    .saveAsTable("gold.renewal_segment_summary")
)
