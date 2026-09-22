CREATE TABLE IF NOT EXISTS mortgage_signals.renewal_risk_scores (
  renewal_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  segment STRING NOT NULL,
  attrition_risk_score DOUBLE NOT NULL,
  attrition_risk_band STRING NOT NULL,
  renewal_likelihood_pct DOUBLE NOT NULL,
  top_risk_drivers STRING NOT NULL,
  competitor_rate_gap_bps DOUBLE NOT NULL,
  rate_shopping_signal STRING NOT NULL,
  service_complaint_last_12m STRING NOT NULL,
  annual_revenue_exposure_cad DOUBLE NOT NULL,
  five_year_lifetime_value_cad DOUBLE NOT NULL,
  recommended_offer_id STRING NOT NULL,
  model_version STRING NOT NULL,
  scored_on DATE NOT NULL,
  CONSTRAINT renewal_risk_scores_pk PRIMARY KEY (renewal_id)
) USING DELTA;
