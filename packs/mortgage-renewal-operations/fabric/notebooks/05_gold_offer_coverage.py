# Fabric notebook source

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.getOrCreate()
portfolio = spark.table("gold.renewal_portfolio")

offers = (
    portfolio.groupBy("recommended_offer_id", "recommended_offer", "required_approval_level")
    .agg(
        F.count("*").alias("renewal_count"),
        F.sum("mortgage_balance_cad").alias("balance_maturing_cad"),
        F.sum("annual_revenue_exposure_cad").alias("annual_revenue_exposure_cad"),
        F.sum(F.when(F.col("attrition_risk_band") == "High", 1).otherwise(0)).alias(
            "high_risk_count"
        ),
        F.avg("renewal_likelihood_pct").alias("avg_renewal_likelihood_pct"),
    )
)
offers.write.format("delta").mode("overwrite").option(
    "overwriteSchema", "true"
).saveAsTable("gold.offer_coverage")

