CREATE SCHEMA IF NOT EXISTS mortgage_operations;

CREATE TABLE IF NOT EXISTS mortgage_operations.mortgage_renewals (
  renewal_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  advisor_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  term_months INTEGER NOT NULL,
  mortgage_balance_cad DOUBLE PRECISION NOT NULL,
  property_value_cad DOUBLE PRECISION NOT NULL,
  ltv_pct DOUBLE PRECISION NOT NULL,
  insured_flag TEXT NOT NULL,
  current_rate_pct DOUBLE PRECISION NOT NULL,
  offered_renewal_rate_pct DOUBLE PRECISION NOT NULL,
  payment_frequency TEXT NOT NULL,
  amortization_remaining_years INTEGER NOT NULL,
  origination_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  days_to_maturity INTEGER NOT NULL,
  payment_shock_pct DOUBLE PRECISION NOT NULL,
  renewal_stage TEXT NOT NULL,
  as_of_date DATE NOT NULL,
  PRIMARY KEY (renewal_id)
);

