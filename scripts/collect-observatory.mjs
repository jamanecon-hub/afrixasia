import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import wdi from "../data/wdi.json" with { type: "json" };
import {
  FX_INDICATOR,
  LOGISTICS_SERIES,
  OBSERVATORY_DB_PATH,
  PRICE_SERIES,
  PRICE_SOURCE_ID,
  SOURCE_ID,
  WDI_SOURCE_ID,
  ensureSchema,
  openObservatory,
} from "../shared/observatory-db.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE_URL = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";
const REPORTERS_URL = "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";
const LICENSE_URL = "https://comtradeplus.un.org/";
const PINK_SHEET_URL = "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx";
const PINK_SHEET_PAGE = "https://www.worldbank.org/en/research/commodity-markets";
const PINK_LICENSE_URL = "https://data.worldbank.org/summary-terms-of-use";
const WDI_LICENSE_URL = "https://data.worldbank.org/summary-terms-of-use";
const USER_AGENT = "AfriXAsiaMarketObservatory/1.0";
const BATCHES = [
  [
    "0901", "0902", "1001", "1006", "080131", "180100",
    "070200", "080510", "03", "61", "62", "610910",
  ],
  ["080132", "1803", "1804", "1805", "1511", "120740", "5201"],
  ["2510", "310210", "310311", "310420", "310530"],
  ["1005", "1202", "1701", "4001"],
];
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
    error.body = (await response.text()).slice(0, 500);
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
      const quota = error.status === 403 && /quota/i.test(error.body || "");
      const retry = error.status === 429 || quota || error.status >= 500 || error.name === "TimeoutError";
      if (!retry || attempt === 6) break;
      if (error.status === 429) delayMs = Math.min(delayMs + 400, 4000);
      const replenished = /replenished in (\d{2}):(\d{2}):(\d{2})/.exec(error.body || "");
      if (replenished) {
        const seconds = Number(replenished[1]) * 3600 + Number(replenished[2]) * 60 + Number(replenished[3]);
        wait = Math.max(wait, (seconds + 5) * 1000);
      }
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

function closeObservatory(db) {
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  db.exec("PRAGMA journal_mode = DELETE");
  db.close();
}

async function main() {
  const db = openObservatory();
  ensureSchema(db);
  await ingestMacro(db);
  if (process.env.OBSERVATORY_SKIP_TRADE === "1") {
    closeObservatory(db);
    console.log("skipped trade and Pink Sheet refresh");
    return;
  }
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
  await ingestPrices(db);
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
    "Africa–Asia bilateral extracts for products the observatory already tracks, including maize, groundnuts, cane or beet sugar, and natural rubber. Preview rows are published trade values. A pair absent from a completed extract is not zero trade. Those lines are not added together, and they are not added to rice, sesame, or the fertilizer lines.",
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
  closeObservatory(db);
  console.log(`wrote ${OBSERVATORY_DB_PATH} flows=${summary.flows} fetch_errors=${summary.errors}`);
  if (!summary.flows) process.exitCode = 1;
}

async function readWdi(indicator, iso3List) {
  const url = `https://api.worldbank.org/v2/en/indicator/${indicator}?downloadformat=csv`;
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${indicator}`);
  const file = path.join(os.tmpdir(), `afrixasia-${indicator}.zip`);
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  const parsed = spawnSync("python3", [
    path.join(root, "scripts", "wdi-bulk.py"),
    file,
    iso3List,
    "2015",
    "2025",
  ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (parsed.status !== 0) throw new Error((parsed.stderr || parsed.stdout || `${indicator} parse failed`).trim());
  return JSON.parse(parsed.stdout);
}

async function ingestMacro(db) {
  const iso3List = wdi.countries.map((country) => country.iso3).join(",");
  const allowed = new Set(wdi.countries.map((country) => country.iso3));
  const exchange = await readWdi(FX_INDICATOR, iso3List);
  if (exchange.indicator !== FX_INDICATOR) throw new Error(`Expected ${FX_INDICATOR} and parsed ${exchange.indicator}`);
  const logistics = [];
  for (const series of LOGISTICS_SERIES) {
    const payload = await readWdi(series.indicator, iso3List);
    if (payload.indicator !== series.indicator) throw new Error(`Expected ${series.indicator} and parsed ${payload.indicator}`);
    logistics.push({ series, payload });
  }
  const retrievedAt = new Date().toISOString();
  const insertRate = db.prepare(`
    INSERT INTO exchange_rates (iso3, year, lcu_per_usd, source_id, retrieved_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertLogistics = db.prepare(`
    INSERT INTO logistics_observations (series_code, iso3, year, value, source_id, retrieved_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const setMeta = db.prepare(`
    INSERT INTO meta (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  let rates = 0;
  let points = 0;
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM exchange_rates").run();
    db.prepare("DELETE FROM logistics_observations").run();
    for (const row of exchange.rows) {
      if (!allowed.has(row.iso3)) continue;
      insertRate.run(row.iso3, row.year, row.value, WDI_SOURCE_ID, retrievedAt);
      rates += 1;
    }
    for (const item of logistics) {
      for (const row of item.payload.rows) {
        if (!allowed.has(row.iso3)) continue;
        insertLogistics.run(item.series.code, row.iso3, row.year, row.value, WDI_SOURCE_ID, retrievedAt);
        points += 1;
      }
    }
    if (!rates || !points) throw new Error("World Bank extract did not include exchange rates and logistics observations.");
    const dates = [
      `official exchange rate file updated ${exchange.updatedOn}`,
      ...logistics.map((item) => `${item.series.code} file updated ${item.payload.updatedOn}`),
    ];
    db.prepare(`
      INSERT INTO sources (id, publisher, title, url, license, license_url, retrieved_at, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        url = excluded.url,
        retrieved_at = excluded.retrieved_at,
        note = excluded.note
    `).run(
      WDI_SOURCE_ID,
      "World Bank",
      "World Development Indicators: official exchange rate, liner shipping connectivity, and logistics performance",
      "https://data.worldbank.org/",
      "World Bank open data terms (generally CC BY 4.0; source-specific exceptions may apply)",
      WDI_LICENSE_URL,
      retrievedAt,
      `Annual observations for the observatory economies, 2015–2025. ${dates.join(". ")}. PA.NUS.FCRF is local currency units per US dollar, an annual average. IS.SHP.GCNW.XQ is the UNCTAD liner shipping connectivity index with 2004 = 100. LP.LPI.OVRL.XQ is a 1-to-5 survey score; its 2022 column is the survey fielded from 6 September to 5 November 2022. A missing economy-year was not published. These are not freight quotes, spot rates for a contract date, orders, or forecasts.`,
    );
    setMeta.run("fx_updated_on", exchange.updatedOn);
    setMeta.run("logistics_updated_on", logistics.map((item) => `${item.series.code}:${item.payload.updatedOn}`).join(","));
    setMeta.run("macro_retrieved_at", retrievedAt);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  console.log(`wdi exchange_rates=${rates} logistics=${points} fx_updated=${exchange.updatedOn}`);
}

async function ingestPrices(db) {
  const response = await fetch(PINK_SHEET_URL, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for the Pink Sheet`);
  const file = path.join(os.tmpdir(), "afrixasia-cmo-monthly.xlsx");
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  const parsed = spawnSync("python3", [
    path.join(root, "scripts", "pink-sheet.py"),
    file,
    PRICE_SERIES.map((series) => series.header).join("|"),
  ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (parsed.status !== 0) throw new Error((parsed.stderr || parsed.stdout || "Pink Sheet parse failed").trim());
  const payload = JSON.parse(parsed.stdout);
  const byHeader = new Map(payload.columns.map((column) => [column.header, column]));
  const retrievedAt = new Date().toISOString();
  const replace = db.prepare(`
    INSERT INTO commodity_prices (series_code, period, price_usd, source_id, retrieved_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(series_code, period) DO UPDATE SET
      price_usd = excluded.price_usd,
      source_id = excluded.source_id,
      retrieved_at = excluded.retrieved_at
  `);
  const setMeta = db.prepare(`
    INSERT INTO meta (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  let points = 0;
  db.exec("BEGIN");
  try {
    for (const series of PRICE_SERIES) {
      const column = byHeader.get(series.header);
      if (!column) throw new Error(`Missing Pink Sheet column ${series.header}`);
      const unit = column.unit === "($/kg)" ? "USD/kg" : column.unit === "($/mt)" ? "USD/mt" : "";
      if (unit !== series.unit) throw new Error(`Unit for ${series.header} is ${column.unit}`);
      for (const row of column.rows) {
        replace.run(series.code, row.period, row.price, PRICE_SOURCE_ID, retrievedAt);
        points += 1;
      }
    }
    db.prepare(`
      INSERT INTO sources (id, publisher, title, url, license, license_url, retrieved_at, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        url = excluded.url,
        retrieved_at = excluded.retrieved_at,
        note = excluded.note
    `).run(
      PRICE_SOURCE_ID,
      "World Bank",
      "World Bank Commodity Price Data (The Pink Sheet), monthly nominal US dollars",
      PINK_SHEET_URL,
      "World Bank open data terms (generally CC BY 4.0)",
      PINK_LICENSE_URL,
      retrievedAt,
      `Workbook updated on ${payload.updatedOn}. Published at ${PINK_SHEET_PAGE}. Extract keeps January 2015 onward for commodities the observatory tracks. A missing month was not published. Prices are nominal reference quotes, not bilateral unit values.`,
    );
    setMeta.run("price_updated_on", payload.updatedOn);
    setMeta.run("price_retrieved_at", retrievedAt);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  console.log(`pink sheet updated ${payload.updatedOn} points=${points}`);
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
    if (error.status === 403 && partners.length > 1 && !/quota/i.test(error.body || "")) {
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
