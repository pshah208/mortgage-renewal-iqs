/**
 * A markdown table, rendered as something worth looking at.
 *
 * Three things the plain <table> did not do:
 *
 *   1. **Know which columns are numbers.** Currency, basis points, percentages
 *      and counts get right-aligned with tabular figures so digits line up in a
 *      column — the single biggest readability win on a financial answer.
 *   2. **Show magnitude.** The dominant numeric column gets an inline bar behind
 *      the cell, so "which of these is the big one" is answerable at a glance.
 *   3. **Become a chart.** Any table with a label column and a numeric column can
 *      switch to a ranked bar or a share donut.
 *
 * The parsed number is used for geometry, ordering and comparison only. Every
 * string rendered to screen is the original cell text, untouched — see the note
 * at the top of `Markdown.tsx` for why that rule exists.
 */

import { useMemo, useState } from "react";
import { BarChart, CellBar, DonutChart, type Datum } from "./Chart";
import { FlyerModal } from "./FlyerModal";
import { buildFlyerSpec, useOfferCatalogue } from "../lib/offers";
import type { FlyerSpec } from "../types";

export type Align = "left" | "right" | "center";

export interface TableModel {
  header: string[];
  rows: string[][];
  align: Align[];
  /** Text of the paragraph immediately above, used as the chart caption. */
  caption?: string;
}

/* ------------------------------------------------------------ numerics --- */

/**
 * Pull a magnitude out of a cell.
 *
 * Handles the shapes this agent actually emits: `CAD 26,443,000`, `$1,240`,
 * `28 bps`, `54.5%`, `1.8M`, `(12,000)` for negatives, and bare counts. Returns
 * null for anything else, which is how a column is judged non-numeric.
 */
export function parseNumber(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  // Strip markdown emphasis so **1,240** still parses.
  const bare = s.replace(/[*`_]/g, "").trim();
  if (!bare) return null;

  // Must contain at least one digit, and must not be mostly prose.
  if (!/\d/.test(bare)) return null;
  if (/[a-z]{4,}/i.test(bare.replace(/CAD|bps|USD/gi, ""))) return null;

  const negative = /^\(.*\)$/.test(bare) || bare.startsWith("-");
  const cleaned = bare
    .replace(/^[($]|[)]$/g, "")
    .replace(/CAD|USD|bps|[$,%\s]/gi, "")
    .replace(/[−–]/g, "-");

  const mult = /(\d)\s*[kK]\b/.test(bare) ? 1e3
    : /(\d)\s*[mM]{1,2}\b/.test(bare) ? 1e6
    : /(\d)\s*[bB]\b/.test(bare) ? 1e9
    : 1;

  const n = parseFloat(cleaned.replace(/[kKmMbB]+$/, ""));
  if (!Number.isFinite(n)) return null;
  return (negative && n > 0 ? -n : n) * mult;
}

/** A column is numeric when most of its populated cells parse as numbers. */
function isNumericColumn(rows: string[][], col: number): boolean {
  const cells = rows.map((r) => r[col] ?? "").filter((c) => c.trim());
  if (cells.length < 2) return false;
  const parsed = cells.filter((c) => parseNumber(c) !== null);
  return parsed.length / cells.length >= 0.7;
}

/**
 * Pick the column worth visualising: prefer one whose header names a magnitude
 * (exposure, balance, value, amount), otherwise take the numeric column with the
 * widest spread, which is the one that actually discriminates between rows.
 */
function pickValueColumn(header: string[], rows: string[][], numeric: number[]): number {
  if (!numeric.length) return -1;

  const preferred = /exposure|balance|value|amount|revenue|total|ltv|volume|cad|\$/i;
  const named = numeric.find((c) => preferred.test(header[c] ?? ""));
  if (named !== undefined) return named;

  let best = numeric[0];
  let bestSpread = -1;
  for (const c of numeric) {
    const vals = rows.map((r) => parseNumber(r[c] ?? "")).filter((v): v is number => v !== null);
    if (vals.length < 2) continue;
    const spread = Math.max(...vals) - Math.min(...vals);
    if (spread > bestSpread) { bestSpread = spread; best = c; }
  }
  return best;
}

/** The first non-numeric column is the label; without one, nothing is chartable. */
function pickLabelColumn(header: string[], numeric: number[]): number {
  for (let c = 0; c < header.length; c += 1) {
    if (!numeric.includes(c)) return c;
  }
  return -1;
}

/* ------------------------------------------------------ renewal columns --- */

/** First column whose header matches, or -1. */
function findCol(header: string[], re: RegExp): number {
  return header.findIndex((h) => re.test(h.replace(/[*`]/g, "").trim()));
}

/**
 * Locate the columns a flyer needs.
 *
 * `Customer ID` is excluded explicitly — it matches /customer/ and sorts before
 * `Customer` in the tables the agent emits, so a naive match would put the
 * action on an opaque identifier instead of a person's name.
 */
function renewalColumns(header: string[]) {
  const idLike = /^(customer|client)\s*(id|number|#)$/i;
  const customer = header.findIndex((h) => {
    const t = h.replace(/[*`]/g, "").trim();
    return !idLike.test(t) && /^(customer|client|name|customer name|client name)$/i.test(t);
  });
  return {
    customer: customer >= 0 ? customer : findCol(header, /^(customer|client)$/i),
    segment: findCol(header, /segment/i),
    offer: findCol(header, /recommended\s*offer|^offer$/i),
    approval: findCol(header, /approval|approver/i),
    maturity: findCol(header, /maturity|matures/i),
  };
}

/* ---------------------------------------------------------------- view --- */

type View = "table" | "bar" | "donut";

export function DataTable({ model }: { model: TableModel }) {
  const { header, rows, align, caption } = model;
  const [view, setView] = useState<View>("table");
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const [flyer, setFlyer] = useState<FlyerSpec | null>(null);
  const catalogue = useOfferCatalogue();

  const numeric = useMemo(
    () => header.map((_, c) => c).filter((c) => isNumericColumn(rows, c)),
    [header, rows],
  );
  const valueCol = useMemo(
    () => pickValueColumn(header, rows, numeric),
    [header, rows, numeric],
  );
  const labelCol = useMemo(() => pickLabelColumn(header, numeric), [header, numeric]);

  /** Charting needs a label, a magnitude, and enough rows to be worth drawing. */
  const chartable = labelCol >= 0 && valueCol >= 0 && rows.length >= 2 && rows.length <= 14;

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const { col, dir } = sort;
    const isNum = numeric.includes(col);
    return [...rows].sort((a, b) => {
      const av = a[col] ?? "";
      const bv = b[col] ?? "";
      if (isNum) {
        const an = parseNumber(av) ?? -Infinity;
        const bn = parseNumber(bv) ?? -Infinity;
        return (an - bn) * dir;
      }
      return av.localeCompare(bv) * dir;
    });
  }, [rows, sort, numeric]);

  /** Largest absolute value in the value column, for scaling the inline bars. */
  const scale = useMemo(() => {
    if (valueCol < 0) return 0;
    const vals = rows
      .map((r) => parseNumber(r[valueCol] ?? ""))
      .filter((v): v is number => v !== null)
      .map(Math.abs);
    return vals.length ? Math.max(...vals) : 0;
  }, [rows, valueCol]);

  const chartData: Datum[] = useMemo(() => {
    if (!chartable) return [];
    return sorted
      .map((r) => ({
        label: (r[labelCol] ?? "").replace(/[*`_]/g, "").trim(),
        value: parseNumber(r[valueCol] ?? "") ?? 0,
        display: (r[valueCol] ?? "").replace(/[*`_]/g, "").trim(),
      }))
      .filter((d) => d.label && Number.isFinite(d.value))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [sorted, chartable, labelCol, valueCol]);

  const cols = useMemo(() => renewalColumns(header), [header]);

  /* A flyer needs a person to address and an offer to put in front of them.
     Without both, the action is not offered rather than offered and broken. */
  const canFlyer = cols.customer >= 0 && cols.offer >= 0;

  const cell = (r: string[], c: number) =>
    c >= 0 ? (r[c] ?? "").replace(/[*`]/g, "").trim() : undefined;

  function openFlyer(r: string[]) {
    setFlyer(buildFlyerSpec({
      customer: cell(r, cols.customer) ?? "",
      segment: cell(r, cols.segment),
      offerText: cell(r, cols.offer),
      approval: cell(r, cols.approval),
      maturity: cell(r, cols.maturity),
    }, catalogue));
  }

  function toggleSort(col: number) {
    setSort((s) =>
      s && s.col === col
        ? (s.dir === -1 ? { col, dir: 1 } : null)
        : { col, dir: -1 },
    );
  }

  const chartCaption = caption || `${header[labelCol] ?? ""} by ${header[valueCol] ?? ""}`;

  return (
    <div className="dt">
      {chartable && (
        <div className="dt-toolbar">
          <div className="dt-views" role="tablist" aria-label="View as">
            {(["table", "bar", "donut"] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={`dt-view${view === v ? " active" : ""}`}
                onClick={() => setView(v)}
              >
                {v === "table" ? "Table" : v === "bar" ? "Chart" : "Share"}
              </button>
            ))}
          </div>
          <span className="dt-meta">
            {rows.length} rows · ranked by {header[valueCol]}
          </span>
        </div>
      )}

      {view === "bar" && <BarChart data={chartData} caption={chartCaption} />}
      {view === "donut" && <DonutChart data={chartData} caption={chartCaption} />}

      {view === "table" && (
        <div className="dt-scroll">
          <table className="dt-table">
            <thead>
              <tr>
                {header.map((h, c) => (
                  <th
                    key={c}
                    className={`${numeric.includes(c) ? "num" : ""} ${
                      sort?.col === c ? "sorted" : ""
                    }`}
                    style={{ textAlign: numeric.includes(c) ? "right" : align[c] }}
                    onClick={() => toggleSort(c)}
                    title="Sort"
                  >
                    <span className="th-inner">
                      {h.replace(/[*`]/g, "")}
                      <span className="th-sort" aria-hidden>
                        {sort?.col === c ? (sort.dir === -1 ? "▾" : "▴") : "⇅"}
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, ri) => (
                <tr key={ri}>
                  {header.map((_, c) => {
                    const cellText = r[c] ?? "";
                    const num = numeric.includes(c);
                    const showBar = c === valueCol && scale > 0;
                    const v = showBar ? parseNumber(cellText) : null;
                    const isCustomer = canFlyer && c === cols.customer;
                    return (
                      <td
                        key={c}
                        className={`${num ? "num" : ""}${isCustomer ? " dt-customer" : ""}`}
                        style={{ textAlign: num ? "right" : align[c] }}
                      >
                        {showBar && v !== null && (
                          <CellBar fraction={Math.abs(v) / scale} />
                        )}
                        <span className="td-text">{cellText.replace(/[*`]/g, "")}</span>
                        {isCustomer && (
                          <button
                            className="dt-flyer-btn"
                            onClick={() => openFlyer(r)}
                            title={`Build a renewal offer flyer for ${
                              cellText.replace(/[*`]/g, "")}`}
                          >
                            <span aria-hidden>◆</span> Flyer
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {flyer && <FlyerModal spec={flyer} onClose={() => setFlyer(null)} />}
    </div>
  );
}
