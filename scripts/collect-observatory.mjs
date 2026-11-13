import wdi from "../data/wdi.json" with { type: "json" };
import {
  OBSERVATORY_DB_PATH,
  PRODUCTS,
  SOURCE_ID,
  ensureSchema,
  openObservatory,
} from "../shared/observatory-db.mjs";

const SOURCE_URL = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";
const REPORTERS_URL = "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";
const LICENSE_URL = "https://comtradeplus.un.org/";
const USER_AGENT = "AfriXAsiaMarketObservatory/1.0";
const BATCHES = [[
  "0901", "0902", "1001", "1006", "080131", "180100",
  "070200", "080510", "03", "61", "62", "610910",
]];
const FLOWS = [
  ["export", "X"],
  ["import", "M"],
];

const years = (process.env.OBSERVATORY_YEARS || "2023,2024,2025")
  .split(",")
  .map((item) => Number(item.trim()))
  .filter((year) => Number.isInteger(year));
const reporterFilter = new Set(
  (process.env.OBSERVATORY_REPORTERS || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean),
);
let delayMs = Number(process.env.OBSERVATORY_DELAY_MS || 1200);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} for ${url}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function withRetry(run) {
  let wait = 5000;
  let last = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      last = error;
      const retry = error.status === 429 || error.status >= 500 || error.name === "TimeoutError";
      if (!retry || attempt === 6) break;
      if (error.status === 429) delayMs = Math.min(delayMs + 400, 4000);
      console.warn(`retry ${attempt} after ${wait}ms: ${error.message}`);
      await sleep(wait);
      wait = Math.min(wait * 2, 60000);
    }
  }
  throw last;
}

function canonicalHs(cmdCode, requested) {
  const raw = String(cmdCode ?? "");
  return requested.find((code) => code === raw || Number(code) === Number(raw)) || null;
}

function positiveOrNull(value, estimated) {
  if (estimated) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return number;
}

async function main() {
  if (!years.length) throw new Error("OBSERVATORY_YEARS did not include an integer year.");
  const reporters = await withRetry(() => getJson(REPORTERS_URL));
  const chosen = new Map();
  for (const row of reporters.results || []) {
    if (!row.reporterCodeIsoAlpha3 || row.isGroup) continue;
    const current = chosen.get(row.reporterCodeIsoAlpha3);
    if (!current || String(row.entryEffectiveDate) > String(current.entryEffectiveDate)) {
      chosen.set(row.reporterCodeIsoAlpha3, row);
    }
  }
  const byIso3 = new Map([...chosen].map(([iso3, row]) => [iso3, row.reporterCode]));
  const db = openObservatory();
  ensureSchema(db);
  const upsertEconomy = db.prepare(`
    INSERT INTO economies (iso3, iso2, name, region, comtrade_code)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(iso3) DO UPDATE SET
      iso2 = excluded.iso2,
      name = excluded.name,
      region = excluded.region,
      comtrade_code = excluded.comtrade_code
  `);
  const economies = [];
  const missing = [];
  for (const country of wdi.countries) {
    const code = byIso3.get(country.iso3);
    if (!code) {
      missing.push(country.iso3);
      continue;
    }
    upsertEconomy.run(country.iso3, country.iso2, country.name, country.region, code);
    economies.push({ ...country, comtradeCode: code });
  }
  const selected = reporterFilter.size
    ? economies.filter((country) => reporterFilter.has(country.iso3))
    : economies;
  const byCode = new Map(economies.map((country) => [country.comtradeCode, country]));
  const setMeta = db.prepare(`
    INSERT INTO meta (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  setMeta.run("missing_reporters", missing.join(","));
  setMeta.run("years", years.join(","));
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO sources (id, publisher, title, url, license, license_url, retrieved_at, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET retrieved_at = excluded.retrieved_at, note = excluded.note
  `).run(
    SOURCE_ID,
    "United Nations Statistics Division",
    "UN Comtrade annual merchandise trade, HS, public preview",
    SOURCE_URL,
    "UN Comtrade terms of use. Attribute United Nations Comtrade.",
    LICENSE_URL,
    now,
    "Africa–Asia bilateral extracts for products the observatory already tracks. Preview rows are published trade values. A pair absent from a completed extract is not zero trade.",
  );

  const seen = db.prepare("SELECT status FROM fetches WHERE query_key = ?");
  const recordFetch = db.prepare(`
    INSERT INTO fetches (query_key, retrieved_at, row_count, status, detail)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(query_key) DO UPDATE SET
      retrieved_at = excluded.retrieved_at,
      row_count = excluded.row_count,
      status = excluded.status,
      detail = excluded.detail
  `);
  const insertFlow = db.prepare(`
    INSERT INTO trade_flows (
      reporter_iso3, partner_iso3, flow, hs_code, year, value_usd, quantity,
      quantity_unit_code, quantity_unit, net_weight_kg, estimation_flag, source_id, retrieved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(reporter_iso3, partner_iso3, flow, hs_code, year) DO UPDATE SET
      value_usd = excluded.value_usd,
      quantity = excluded.quantity,
      quantity_unit_code = excluded.quantity_unit_code,
      quantity_unit = excluded.quantity_unit,
      net_weight_kg = excluded.net_weight_kg,
      estimation_flag = excluded.estimation_flag,
      retrieved_at = excluded.retrieved_at
  `);

  let done = 0;
  const jobs = [];
  for (const year of years) {
    for (const [flow, flowCode] of FLOWS) {
      for (const batch of BATCHES) {
        for (const reporter of selected) jobs.push({ year, flow, flowCode, batch, reporter });
      }
    }
  }

  for (const job of jobs) {
    done += 1;
    await fetchBatch(db, job, byCode, seen, recordFetch, insertFlow);
    if (done % 25 === 0 || done === jobs.length) {
      const flows = db.prepare("SELECT COUNT(*) AS n FROM trade_flows").get().n;
      console.log(`progress ${done}/${jobs.length} stored ${flows} delay ${delayMs}ms`);
    }
  }

  setMeta.run("retrieved_at", new Date().toISOString());
  setMeta.run("reporters_collected", String(selected.length));
  const summary = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM trade_flows) AS flows,
      (SELECT COUNT(*) FROM fetches WHERE status = 'error') AS errors
  `).get();
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  db.exec("PRAGMA journal_mode = DELETE");
  db.close();
  console.log(`wrote ${OBSERVATORY_DB_PATH} flows=${summary.flows} fetch_errors=${summary.errors}`);
  if (!summary.flows) process.exitCode = 1;
}

async function fetchBatch(db, job, byCode, seen, recordFetch, insertFlow) {
  const { year, flow, flowCode, batch, reporter } = job;
  const key = [reporter.iso3, year, flow, batch.join("+")].join("|") + (job.partnerKey ? `|${job.partnerKey}` : "");
  const previous = seen.get(key);
  if (previous?.status === "ok") return true;

  const partners = job.partners || [...byCode.values()].filter((country) => country.region !== reporter.region);
  const url = `${SOURCE_URL}?reporterCode=${reporter.comtradeCode}&period=${year}&partnerCode=${partners.map((country) => country.comtradeCode).join(",")}&cmdCode=${batch.join(",")}&flowCode=${flowCode}`;
  let payload;
  try {
    payload = await withRetry(() => getJson(url));
  } catch (error) {
    if (error.status === 403 && partners.length > 1) {
      const mid = Math.ceil(partners.length / 2);
      const leftPartners = partners.slice(0, mid);
      const rightPartners = partners.slice(mid);
      const left = await fetchBatch(db, { ...job, partners: leftPartners, partnerKey: leftPartners.map((country) => country.iso3).join(".") }, byCode, seen, recordFetch, insertFlow);
      const right = await fetchBatch(db, { ...job, partners: rightPartners, partnerKey: rightPartners.map((country) => country.iso3).join(".") }, byCode, seen, recordFetch, insertFlow);
      if (left && right) recordFetch.run(key, new Date().toISOString(), 0, "ok", "split-partners");
      else recordFetch.run(key, new Date().toISOString(), 0, "error", error.message);
      return left && right;
    }
    recordFetch.run(key, new Date().toISOString(), 0, "error", error.message);
    console.warn(`error ${key} ${error.message}`);
    return false;
  }
  await sleep(delayMs);
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const count = Number(payload.count ?? rows.length);
  if (count > rows.length || rows.length >= 500) {
    if (batch.length === 1) {
      recordFetch.run(key, new Date().toISOString(), rows.length, "error", "response truncated");
      console.warn(`truncated ${key} count=${count} rows=${rows.length}`);
      return false;
    }
    const mid = Math.ceil(batch.length / 2);
    const left = await fetchBatch(db, { ...job, batch: batch.slice(0, mid) }, byCode, seen, recordFetch, insertFlow);
    const right = await fetchBatch(db, { ...job, batch: batch.slice(mid) }, byCode, seen, recordFetch, insertFlow);
    if (left && right) recordFetch.run(key, new Date().toISOString(), 0, "ok", "split");
    return left && right;
  }

  const retrievedAt = new Date().toISOString();
  let stored = 0;
  db.exec("BEGIN");
  try {
    for (const row of rows) {
      const partner = byCode.get(row.partnerCode);
      const hsCode = canonicalHs(row.cmdCode, batch);
      const value = Number(row.primaryValue);
      if (!partner || partner.region === reporter.region || !hsCode || !Number.isFinite(value) || value <= 0) continue;
      const unitCode = Number(row.qtyUnitCode);
      const hasUnit = Number.isInteger(unitCode) && unitCode > 0;
      const quantityEstimated = Boolean(row.isQtyEstimated);
      const weightEstimated = Boolean(row.isNetWgtEstimated);
      insertFlow.run(
        reporter.iso3,
        partner.iso3,
        flow,
        hsCode,
        year,
        value,
        positiveOrNull(row.qty, quantityEstimated),
        hasUnit ? unitCode : null,
        hasUnit && unitCode === 8 && !quantityEstimated ? "kg" : null,
        positiveOrNull(row.netWgt, weightEstimated),
        Number(row.legacyEstimationFlag) || 0,
        SOURCE_ID,
        retrievedAt,
      );
      stored += 1;
    }
    recordFetch.run(key, retrievedAt, stored, "ok", payload.error ? String(payload.error) : null);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    recordFetch.run(key, new Date().toISOString(), 0, "error", error.message);
    console.warn(`write ${key} ${error.message}`);
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
