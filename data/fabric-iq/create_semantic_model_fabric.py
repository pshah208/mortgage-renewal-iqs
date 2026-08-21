# Fabric notebook - build the Direct Lake semantic model for the Mortgage Renewal
# Concierge, then add business measures on top.
#
# SYNTHETIC DEMO DATA. CFC Bank is a branding label only.
#
# Run AFTER nb_load_renewals has created the Delta tables.
#   Automated:  python deploy_fabric.py --only semantic-model
#
# Direct Lake means the model reads the Delta/Parquet files in OneLake directly -
# no import, no refresh schedule, no data duplication. The measures defined here
# are what makes the model useful to Fabric IQ and to the agent: they encode the
# business definitions (revenue exposure, value at risk, the CRO's LTV and
# payment-shock splits) once, in the semantic layer, rather than in every query.
#
# The whole body is wrapped so that a full traceback is written to
# Files/_deploy/semantic_model_log.txt in the lakehouse - notebook job failures
# are otherwise opaque from the REST API.

import subprocess
import sys
import traceback

LOG: list[str] = []


def log(msg: object) -> None:
    print(msg)
    LOG.append(str(msg))


def flush_log() -> None:
    try:
        from notebookutils import mssparkutils

        mssparkutils.fs.put(
            "Files/_deploy/semantic_model_log.txt", "\n".join(LOG), True
        )
    except Exception as exc:  # noqa: BLE001
        print(f"could not write log: {exc}")


DATASET = "sm_mortgage_renewals"
LAKEHOUSE = "lh_mortgage_renewals"
FACT = "renewal_attrition_risk"

TABLES = [
    "renewal_attrition_risk",
    "renewal_segment_summary",
    "retention_offers",
    "branch_performance",
]

try:
    # ----------------------------------------------------------------------- #
    # 0. Dependency. Installed via subprocess rather than the %pip magic so the
    #    failure is catchable and lands in the log.
    # ----------------------------------------------------------------------- #
    try:
        import sempy_labs  # noqa: F401
        log("semantic-link-labs already present")
    except ImportError:
        log("installing semantic-link-labs…")
        out = subprocess.run(
            [sys.executable, "-m", "pip", "install", "semantic-link-labs"],
            capture_output=True, text=True,
        )
        log(out.stdout[-3000:])
        if out.returncode != 0:
            log(out.stderr[-4000:])
            raise RuntimeError("pip install semantic-link-labs failed")

    import sempy_labs as labs
    from sempy_labs.tom import connect_semantic_model

    log(f"sempy_labs {getattr(labs, '__version__', 'unknown')}")

    # ----------------------------------------------------------------------- #
    # 1. Generate the Direct Lake model over the curated tables.
    #    The signature of generate_direct_lake_semantic_model has changed across
    #    releases (0.17 requires both `tables` and `source`; earlier builds used
    #    `lakehouse` / `lakehouse_tables`). Introspect it and bind by alias rather
    #    than hard-coding, so this survives a library upgrade.
    # ----------------------------------------------------------------------- #
    import inspect

    gen = labs.directlake.generate_direct_lake_semantic_model
    sig = inspect.signature(gen)
    log(f"signature: generate_direct_lake_semantic_model{sig}")

    ALIASES = {
        "dataset": DATASET,
        "semantic_model": DATASET,
        "tables": TABLES,
        "lakehouse_tables": TABLES,
        "source": LAKEHOUSE,
        "lakehouse": LAKEHOUSE,
        "source_type": "Lakehouse",
        "overwrite": True,
        "refresh": True,
    }
    kwargs = {name: ALIASES[name] for name in sig.parameters if name in ALIASES}

    missing = [
        n for n, p in sig.parameters.items()
        if p.default is inspect.Parameter.empty
        and p.kind not in (p.VAR_POSITIONAL, p.VAR_KEYWORD)
        and n not in kwargs
    ]
    if missing:
        raise RuntimeError(f"unmapped required parameters {missing} - signature: {sig}")

    log(f"calling with: { {k: (v if not isinstance(v, list) else f'{len(v)} tables') for k, v in kwargs.items()} }")
    gen(**kwargs)
    log(f"semantic model '{DATASET}' generated")

    # --------------------------------------------------------------------------- #
    # 2. Relationships + measures.
    # --------------------------------------------------------------------------- #
    MEASURES = [
        # (name, DAX, format string, description)
        ("Renewals in 180 Days",
         f"COUNTROWS('{FACT}')", "#,0",
         "Count of mortgages maturing within the next 180 days."),

        ("Balance Maturing",
         f"SUM('{FACT}'[mortgage_balance_cad])", '"CAD "#,0',
         "Total mortgage balance maturing in the window."),

        ("Annual Revenue Exposure",
         f"SUM('{FACT}'[annual_revenue_exposure_cad])", '"CAD "#,0',
         "Annual net interest plus ancillary margin at risk if these renewals are lost."),

        ("Five Year Lifetime Value",
         f"SUM('{FACT}'[five_year_lifetime_value_cad])", '"CAD "#,0',
         "Modelled five-year relationship value of the maturing book."),

        ("Avg Renewal Likelihood Pct",
         f"AVERAGE('{FACT}'[renewal_likelihood_pct])", "0.0",
         "Average modelled probability the client renews with us."),

        ("High Risk Renewals",
         f"CALCULATE(COUNTROWS('{FACT}'), '{FACT}'[attrition_risk_band] = \"High\")", "#,0",
         "Renewals scored in the High attrition band."),

        ("High Risk Exposure",
         f"CALCULATE(SUM('{FACT}'[annual_revenue_exposure_cad]), "
         f"'{FACT}'[attrition_risk_band] = \"High\")", '"CAD "#,0',
         "Annual revenue exposure concentrated in High-risk renewals."),

        ("Value at Risk",
         f"SUMX('{FACT}', '{FACT}'[annual_revenue_exposure_cad] * "
         f"'{FACT}'[attrition_risk_score])", '"CAD "#,0',
         "Probability-weighted revenue exposure. This is the measure advisor worklists "
         "should be sorted by - see the 20 July Renewal Council decision."),

        ("Pct Balance At High Risk",
         f"DIVIDE(CALCULATE(SUM('{FACT}'[mortgage_balance_cad]), "
         f"'{FACT}'[attrition_risk_band] = \"High\"), SUM('{FACT}'[mortgage_balance_cad]))",
         "0.0%",
         "Share of maturing balance sitting in the High attrition band."),

        ("Avg Payment Shock Pct",
         f"AVERAGE('{FACT}'[payment_shock_pct])", "0.0",
         "Average increase in monthly payment at renewal."),

        ("Avg Competitor Gap Bps",
         f"AVERAGE('{FACT}'[competitor_rate_gap_bps])", "0.0",
         "Average gap in basis points between our offer and the best competitor quote."),

        ("Avg LTV Pct",
         f"AVERAGE('{FACT}'[ltv_pct])", "0.0",
         "Average loan-to-value of the maturing book."),

        ("Rate Shopping Signals",
         f"CALCULATE(COUNTROWS('{FACT}'), '{FACT}'[rate_shopping_signal] = \"Y\")", "#,0",
         "Renewals where a rate-shopping behavioural signal was detected."),

        ("Balance Above 80 LTV",
         f"CALCULATE(SUM('{FACT}'[mortgage_balance_cad]), '{FACT}'[ltv_band] = \"Above 80\")",
         '"CAD "#,0',
         "Maturing balance above 80 percent LTV - required by the CRO monthly pack (RP-009)."),

        ("Balance Above 60 Pct Payment Shock",
         f"CALCULATE(SUM('{FACT}'[mortgage_balance_cad]), "
         f"'{FACT}'[payment_shock_band] = \"Above 60 pct\")", '"CAD "#,0',
         "Maturing balance facing a payment increase above 60 percent - required by the "
         "CRO monthly pack (RP-009)."),
    ]

    with connect_semantic_model(dataset=DATASET, readonly=False) as tom:
        for from_col, to_table, to_col in (
            ("recommended_offer_id", "retention_offers", "offer_id"),
            ("branch_id", "branch_performance", "branch_id"),
        ):
            try:
                tom.add_relationship(
                    from_table=FACT, from_column=from_col,
                    to_table=to_table, to_column=to_col,
                    from_cardinality="Many", to_cardinality="One",
                    cross_filtering_behavior="OneDirection", is_active=True,
                )
                log(f"+ relationship {FACT} -> {to_table}")
            except Exception as exc:  # noqa: BLE001
                log(f"= relationship {to_table} skipped: {exc}")

        existing = {m.Name for m in tom.all_measures()}
        for name, dax, fmt, desc in MEASURES:
            if name in existing:
                log(f"= measure {name}")
                continue
            tom.add_measure(table_name=FACT, measure_name=name, expression=dax,
                            format_string=fmt, description=desc)
            log(f"+ measure {name}")

        tom.model.Description = (
            "SYNTHETIC DEMO DATA - Mortgage Renewal Concierge. Direct Lake model over "
            "the 180-day renewal book. CFC Bank is a branding label only; nothing "
            "here reflects real CFC Bank customers, pricing or policy."
        )

    log(f"semantic model '{DATASET}' ready with {len(MEASURES)} measures")
    log("STATUS: SUCCESS")

except Exception:  # noqa: BLE001
    log("STATUS: FAILED")
    log(traceback.format_exc())
    flush_log()
    raise
else:
    flush_log()
