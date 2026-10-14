import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { paths } from "./lib.mjs";

function openDatabase() {
  if (!fs.existsSync(paths.database)) {
    const error = new Error("Observatory database is not built. Run npm run observatory:build.");
    error.status = 503;
    return { error };
  }
  return { db: new DatabaseSync(paths.database, { readOnly: true }) };
}

function fail(status, error) {
  return { status, body: { error } };
}

function limitOf(value, fallback, max = 5000) {
  if (value == null || value === "") return { value: fallback };
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > max) {
    return { error: `limit must be an integer from 1 to ${max}.` };
  }
  return { value: number };
}

function resolveCountry(db, value) {
  if (!value) return null;
  return db.prepare(`
    SELECT iso3, iso2, name, region FROM countries
    WHERE iso3 = ? COLLATE NOCASE OR iso2 = ? COLLATE NOCASE OR name = ? COLLATE NOCASE
  `).get(value, value, value);
}

export function queryObservatory(params) {
  const opened = openDatabase();
  if (opened.error) return fail(opened.error.status || 503, opened.error.message);
  const db = opened.db;
  try {
    const view = params.view || "status";
    if (view === "status") return { status: 200, body: status(db) };
    if (view === "countries") return { status: 200, body: { countries: db.prepare("SELECT * FROM countries ORDER BY region, name").all() } };
    if (view === "indicators") return indicators(db, params);
    if (view === "series") return series(db, params);
    if (view === "trade") return trade(db, params);
    if (view === "corridors") return corridors(db, params);
    if (view === "prices") return prices(db, params);
    return fail(400, "view must be status, countries, indicators, series, trade, corridors, or prices.");
  } finally {
    db.close();
  }
}

function status(db) {
  const datasets = db.prepare("SELECT * FROM datasets ORDER BY id").all();
  const queries = db.prepare("SELECT status, COUNT(*) AS queries FROM collection_queries GROUP BY status").all();
  const tea = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'KEN' AND partner_iso3 = 'PAK' AND hs_code = '0902' AND year = 2024 AND flow = 'export'
  `).get();
  return {
    database: "data/observatory.sqlite",
    counts: {
      countries: db.prepare("SELECT COUNT(*) AS n FROM countries").get().n,
      indicators: db.prepare("SELECT COUNT(*) AS n FROM indicators").get().n,
      observations: db.prepare("SELECT COUNT(*) AS n FROM observations").get().n,
      tradeFlows: db.prepare("SELECT COUNT(*) AS n FROM trade_flows").get().n,
      commodityPrices: db.prepare("SELECT COUNT(*) AS n FROM commodity_prices").get().n,
      marketRecords: db.prepare("SELECT COUNT(*) AS n FROM market_records").get().n,
    },
    observationsByDataset: db.prepare(`
      SELECT dataset_id AS datasetId, COUNT(*) AS observations FROM observations GROUP BY dataset_id
    `).all(),
    collectionQueries: queries,
    kenyaTeaExportsToPakistan2024: tea || null,
    note: "A missing trade row is not zero trade. Flows under USD 1 million are omitted. Commodity prices are international benchmarks, not bilateral contracts.",
    datasets,
  };
}

function indicators(db, params) {
  const rows = db.prepare(`
    SELECT code, name, label, unit, category, side, frequency, source_url AS sourceUrl, interpretation, dataset_id AS datasetId
    FROM indicators
    WHERE (? = '' OR category = ?)
    ORDER BY category, code
  `).all(params.category || "", params.category || "");
  return { status: 200, body: { total: rows.length, rows } };
}

function series(db, params) {
  const country = resolveCountry(db, params.country);
  if (!country) return fail(400, "country is required. Use ISO2, ISO3, or a country name.");
  if (!params.indicator) return fail(400, "indicator is required.");
  const indicator = db.prepare("SELECT code, name, unit, category, dataset_id AS datasetId FROM indicators WHERE code = ?").get(params.indicator);
  if (!indicator) return fail(400, `Unknown indicator: ${params.indicator}`);
  const start = Number(params.start || 2015);
  const end = Number(params.end || 2025);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) return fail(400, "start and end must be years, with start <= end.");
  const rows = db.prepare(`
    SELECT country_iso3 AS country, year, value, status, dataset_id AS datasetId
    FROM observations
    WHERE country_iso3 = ? AND indicator_code = ? AND year BETWEEN ? AND ?
    ORDER BY year
  `).all(country.iso3, indicator.code, start, end);
  return {
    status: 200,
    body: {
      country,
      indicator,
      total: rows.length,
      rows,
      note: "Missing years are omitted. A missing year is not zero.",
    },
  };
}

function trade(db, params) {
  const reporter = params.reporter ? resolveCountry(db, params.reporter) : null;
  const partner = params.partner ? resolveCountry(db, params.partner) : null;
  if (params.reporter && !reporter) return fail(400, "Unknown reporter.");
  if (params.partner && !partner) return fail(400, "Unknown partner.");
  if (!reporter && !partner && !params.hs && !params.year) {
    return fail(400, "Provide reporter, partner, hs, or year.");
  }
  const limited = limitOf(params.limit, 100);
  if (limited.error) return fail(400, limited.error);
  const year = params.year ? Number(params.year) : null;
  if (params.year && !Number.isInteger(year)) return fail(400, "year must be an integer.");
  const rows = db.prepare(`
    SELECT reporter_iso3 AS reporter, reporter_name AS reporterName, reporter_region AS reporterRegion,
      partner_iso3 AS partner, partner_name AS partnerName, partner_region AS partnerRegion,
      hs_code AS hsCode, product_name AS product, category, observatory_product AS observatoryProduct,
      year, flow, trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM v_africa_asia_trade
    WHERE (? IS NULL OR reporter_iso3 = ?)
      AND (? IS NULL OR partner_iso3 = ?)
      AND (? = '' OR hs_code = ?)
      AND (? IS NULL OR year = ?)
    ORDER BY trade_value_usd DESC
    LIMIT ?
  `).all(reporter?.iso3 || null, reporter?.iso3 || null, partner?.iso3 || null, partner?.iso3 || null, params.hs || "", params.hs || "", year, year, limited.value);
  return {
    status: 200,
    body: {
      total: rows.length,
      rows,
      note: "Export values of at least USD 1 million. A missing pair is not zero trade.",
    },
  };
}

function corridors(db, params) {
  const limited = limitOf(params.limit, 25);
  if (limited.error) return fail(400, limited.error);
  const year = params.year ? Number(params.year) : null;
  if (params.year && !Number.isInteger(year)) return fail(400, "year must be an integer.");
  const rows = db.prepare(`
    SELECT reporter_iso3 AS reporter, reporter_name AS reporterName, reporter_region AS reporterRegion,
      partner_iso3 AS partner, partner_name AS partnerName, partner_region AS partnerRegion,
      hs_code AS hsCode, product_name AS product, observatory_product AS observatoryProduct,
      year, trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM v_africa_asia_trade
    WHERE flow = 'export' AND (? IS NULL OR year = ?) AND (? = '' OR hs_code = ?)
    ORDER BY trade_value_usd DESC
    LIMIT ?
  `).all(year, year, params.hs || "", params.hs || "", limited.value);
  return { status: 200, body: { total: rows.length, rows } };
}

function prices(db, params) {
  if (!params.product && !params.series) return fail(400, "product or series is required.");
  const limited = limitOf(params.limit, 24, 2000);
  if (limited.error) return fail(400, limited.error);
  const rows = db.prepare(`
    SELECT p.series, s.product, s.category, s.observatory_product AS observatoryProduct, s.unit, s.detail,
      p.period, p.price
    FROM commodity_prices p
    JOIN commodity_series s ON s.series = p.series
    WHERE (? = '' OR s.product = ? COLLATE NOCASE OR s.observatory_product = ? COLLATE NOCASE)
      AND (? = '' OR p.series = ? COLLATE NOCASE)
    ORDER BY p.period DESC
    LIMIT ?
  `).all(params.product || "", params.product || "", params.product || "", params.series || "", params.series || "", limited.value);
  return {
    status: 200,
    body: {
      total: rows.length,
      rows,
      note: "Monthly international benchmarks. Tea is the Mombasa auction price.",
    },
  };
}
