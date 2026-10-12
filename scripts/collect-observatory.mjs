import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import wdi from "../data/wdi.json" with { type: "json" };
import {
  CORRIDOR_PRODUCTS,
  CORRIDOR_REPORTERS,
  MIN_CORRIDOR_USD,
  SUPPLEMENT_INDICATORS,
} from "../shared/supplement-indicators.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "data", "collected");
const years = { from: 2015, to: 2025 };
const retrievedAt = new Date().toISOString();
const checkedAt = retrievedAt.slice(0, 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url, attempt = 0) {
  const response = await fetch(url);
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await sleep(1500 * (attempt + 1));
    return getJson(url, attempt + 1);
  }
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`${response.status} ${url} ${text.slice(0, 240)}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function chunks(list, size) {
  const batches = [];
  for (let index = 0; index < list.length; index += size) batches.push(list.slice(index, index + size));
  return batches;
}

async function fetchIndicatorMeta(spec) {
  const body = await getJson(`https://api.worldbank.org/v2/indicator/${spec.code}?format=json`);
  const row = body?.[1]?.[0];
  if (!row) throw new Error(`No metadata for ${spec.code}`);
  return {
    code: spec.code,
    name: row.name,
    label: spec.label,
    unit: spec.unit,
    category: spec.category,
    side: spec.side,
    type: spec.type,
    frequency: "Annual",
    definition: row.sourceNote || "",
    sourceOrganization: row.sourceOrganization || "",
    sourceId: String(row.source?.id || "2"),
    source: "World Bank — World Development Indicators",
    sourceUrl: `https://data.worldbank.org/indicator/${spec.code}`,
    licenseUrl: "https://data.worldbank.org/summary-terms-of-use",
    interpretation: spec.interpretation,
  };
}

async function fetchSeries(iso3List, codes) {
  const rows = [];
  let sourceUpdatedAt = "";
  const countryBatches = chunks(iso3List, 40);
  const indicatorBatches = chunks(codes, 4);
  for (const countries of countryBatches) {
    for (const indicators of indicatorBatches) {
      let page = 1;
      let pages = 1;
      while (page <= pages) {
        const url =
          `https://api.worldbank.org/v2/country/${countries.join(";")}` +
          `/indicator/${indicators.join(";")}?source=2&date=${years.from}:${years.to}` +
          `&format=json&per_page=5000&page=${page}`;
        const body = await getJson(url);
        const meta = body?.[0];
        pages = Number(meta?.pages || 1);
        sourceUpdatedAt = meta?.lastupdated || sourceUpdatedAt;
        for (const item of body?.[1] || []) {
          if (item?.value == null || item.value === "") continue;
          rows.push({
            country: item.countryiso3code,
            indicator: item.indicator.id,
            year: Number(item.date),
            value: item.value,
            status: item.obs_status || "",
            decimal: item.decimal ?? 0,
          });
        }
        console.log(`WDI ${indicators.join(",")} countries ${countries.length} page ${page}/${pages} rows ${rows.length}`);
        page += 1;
      }
    }
  }
  return { rows, sourceUpdatedAt };
}

function buildCoverage(observations, iso3List, codes) {
  const byPair = new Map();
  for (const row of observations) {
    const key = `${row.country}|${row.indicator}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key).push(row);
  }
  const coverage = [];
  const latest = [];
  for (const country of iso3List) {
    for (const indicator of codes) {
      const rows = (byPair.get(`${country}|${indicator}`) || []).sort((a, b) => a.year - b.year);
      const present = new Set(rows.map((row) => row.year));
      const missingYears = [];
      for (let year = years.from; year <= years.to; year += 1) {
        if (!present.has(year)) missingYears.push(year);
      }
      const newest = rows.at(-1) || null;
      const previous = rows.at(-2) || null;
      coverage.push({
        country,
        indicator,
        observations: rows.length,
        firstYear: rows[0]?.year ?? null,
        latestYear: newest?.year ?? null,
        status: rows.length ? "available" : "not_reported",
        missingYears,
      });
      if (newest) {
        latest.push({
          country,
          indicator,
          year: newest.year,
          value: newest.value,
          status: newest.status,
          decimal: newest.decimal,
          previousYear: previous?.year ?? null,
          previousValue: previous?.value ?? null,
        });
      }
    }
  }
  return { coverage, latest };
}

function marketProxy(spec, country, row) {
  const origin = spec.origin === "country" ? country.name : "World";
  const target = spec.target === "country" ? country.name : "World";
  return {
    id: `WDI-${country.iso3}-${spec.code}`,
    datasetId: "afrixasia-wdi-supplement",
    indicatorCode: spec.code,
    country: country.name,
    iso2: country.iso2,
    region: country.region,
    category: spec.category,
    product: spec.product,
    side: spec.side,
    indicatorType: spec.indicatorType,
    value: row.value,
    unit: spec.unit,
    period: String(row.year),
    origin,
    target,
    summary: `${spec.product}. ${spec.interpretation} Annual WDI source; do not add this figure to trade values or other units.`,
    source: "World Bank — World Development Indicators",
    sourceUrl: `https://data.worldbank.org/indicator/${spec.code}?locations=${country.iso2}`,
    checkedAt,
    hsCode: null,
    type: spec.type,
  };
}

async function comtradeReporters() {
  const body = await getJson("https://comtradeapi.un.org/files/v1/app/reference/Reporters.json");
  const byIso3 = new Map();
  for (const row of body.results || []) {
    if (row.isGroup || !row.reporterCodeIsoAlpha3) continue;
    byIso3.set(row.reporterCodeIsoAlpha3, row.reporterCode);
  }
  return byIso3;
}

function corridorRecord(flow) {
  return {
    id: `CT-${flow.originIso3}-${flow.targetIso3}-${flow.hsCode}-${flow.period}`,
    datasetId: "afrixasia-comtrade",
    indicatorCode: null,
    country: flow.origin,
    iso2: flow.originIso2,
    region: flow.originRegion,
    category: flow.category,
    product: flow.product,
    side: "supply",
    indicatorType: "bilateral_export",
    value: flow.valueUSD,
    unit: "USD",
    period: flow.period,
    origin: flow.origin,
    target: flow.target,
    summary:
      `${flow.origin} reported exports of ${flow.product} (HS ${flow.hsCode}) to ${flow.target} ` +
      `worth USD ${Math.round(flow.valueUSD).toLocaleString("en-US")} in ${flow.period}. ` +
      "UN Comtrade annual merchandise trade. Historical exports are not available stock or an open order.",
    source: "UN Comtrade",
    sourceUrl: flow.sourceUrl,
    checkedAt,
    hsCode: flow.hsCode,
    type: "product",
  };
}

async function collectCorridors(m49ByIso3) {
  const countries = new Map(wdi.countries.map((country) => [country.iso3, country]));
  const reporters = CORRIDOR_REPORTERS.filter((iso3) => countries.has(iso3) && m49ByIso3.has(iso3));
  const africa = wdi.countries.filter((country) => country.region === "Africa" && m49ByIso3.has(country.iso3));
  const asia = wdi.countries.filter((country) => country.region === "Asia" && m49ByIso3.has(country.iso3));
  const checkpointPath = path.join(outDir, "corridors-checkpoint.json");
  const clientPath = path.join(outDir, "client.json");
  let checkpoint = fs.existsSync(checkpointPath) ? JSON.parse(fs.readFileSync(checkpointPath, "utf8")) : null;
  if (!checkpoint && fs.existsSync(clientPath)) {
    const saved = JSON.parse(fs.readFileSync(clientPath, "utf8"));
    if (Array.isArray(saved.completedQueries)) {
      checkpoint = { done: saved.completedQueries, corridors: saved.corridors || [] };
    }
  }
  if (!checkpoint) checkpoint = { done: [], corridors: [] };
  const done = new Set(checkpoint.done);
  const corridors = checkpoint.corridors;

  const jobs = [];
  for (const iso3 of reporters) {
    const reporter = countries.get(iso3);
    const partners = reporter.region === "Africa" ? asia : africa;
    for (const product of CORRIDOR_PRODUCTS) {
      jobs.push({ reporter, partners, product });
    }
  }

  for (const job of jobs) {
    const key = `${job.reporter.iso3}|${job.product.hs}`;
    if (done.has(key)) continue;
    const partnerCodes = job.partners.map((country) => m49ByIso3.get(country.iso3)).join(",");
    let period = "2024";
    let payload = await getJson(
      "https://comtradeapi.un.org/public/v1/preview/C/A/HS?" +
        new URLSearchParams({
          reporterCode: String(m49ByIso3.get(job.reporter.iso3)),
          period,
          partnerCode: partnerCodes,
          cmdCode: job.product.hs,
          flowCode: "X",
          maxRecords: "500",
        }),
    );
    if (!payload.data?.length) {
      period = "2023";
      payload = await getJson(
        "https://comtradeapi.un.org/public/v1/preview/C/A/HS?" +
          new URLSearchParams({
            reporterCode: String(m49ByIso3.get(job.reporter.iso3)),
            period,
            partnerCode: partnerCodes,
            cmdCode: job.product.hs,
            flowCode: "X",
            maxRecords: "500",
          }),
      );
    }
    const partnerByM49 = new Map(job.partners.map((country) => [m49ByIso3.get(country.iso3), country]));
    let kept = 0;
    for (const row of payload.data || []) {
      const target = partnerByM49.get(row.partnerCode);
      if (!target || row.primaryValue == null || row.primaryValue < MIN_CORRIDOR_USD) continue;
      const sourceUrl =
        "https://comtradeapi.un.org/public/v1/preview/C/A/HS?" +
        new URLSearchParams({
          reporterCode: String(row.reporterCode),
          period: String(row.refYear || period),
          partnerCode: String(row.partnerCode),
          cmdCode: job.product.hs,
          flowCode: "X",
        });
      corridors.push({
        id: `CT-${job.reporter.iso3}-${target.iso3}-${job.product.hs}-${row.refYear || period}`,
        origin: job.reporter.name,
        originIso3: job.reporter.iso3,
        originIso2: job.reporter.iso2,
        originRegion: job.reporter.region,
        target: target.name,
        targetIso3: target.iso3,
        targetIso2: target.iso2,
        product: job.product.name,
        hsCode: job.product.hs,
        period: String(row.refYear || period),
        valueUSD: row.primaryValue,
        quantityKg: row.qtyUnitCode === 8 ? row.qty : row.netWgt > 0 ? row.netWgt : null,
        reporter: job.reporter.name,
        flow: "export",
        category: job.product.category,
        source: "UN Comtrade",
        sourceUrl,
        checkedAt,
      });
      kept += 1;
    }
    done.add(key);
    checkpoint.done = [...done];
    checkpoint.corridors = corridors;
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint));
    console.log(`Comtrade ${job.reporter.iso3} HS ${job.product.hs} ${period} kept ${kept} total ${corridors.length}`);
    await sleep(450);
  }
  return corridors;
}

function writeCollected({ indicators, series, coverage, latest, marketRecords, corridors, sourceUpdatedAt, partial, completedQueries }) {
  const observationCount = series.length;
  const checksum = crypto.createHash("sha256").update(JSON.stringify(series)).digest("hex");
  const client = {
    datasetId: "afrixasia-wdi-supplement",
    retrievedAt,
    sourceUpdatedAt,
    observationCount,
    checksum,
    partial,
    indicators,
    latest,
    coverage,
    marketRecords,
    corridors,
    completedQueries: completedQueries || [],
    products: CORRIDOR_PRODUCTS,
    reporters: CORRIDOR_REPORTERS,
    minCorridorUsd: MIN_CORRIDOR_USD,
    citation: `World Bank, World Development Indicators, retrieved ${checkedAt}. UN Comtrade bilateral exports, retrieved ${checkedAt}. Curated by AfriXAsia.`,
  };
  fs.writeFileSync(path.join(outDir, "client.json"), `${JSON.stringify(client)}\n`);
  fs.writeFileSync(path.join(outDir, "observations.json"), `${JSON.stringify(series)}\n`);
  fs.writeFileSync(
    path.join(outDir, "wdi-series.json"),
    JSON.stringify({ retrievedAt, sourceUpdatedAt, indicators, series, coverage, latest }),
  );
  console.log(
    JSON.stringify(
      {
        partial,
        indicators: indicators.length,
        observations: observationCount,
        latest: latest.length,
        marketRecords: marketRecords.length,
        corridors: corridors.length,
        sourceUpdatedAt,
        checksum,
      },
      null,
      2,
    ),
  );
}

const iso3List = wdi.countries.map((country) => country.iso3);
fs.mkdirSync(outDir, { recursive: true });

const seriesCache = path.join(outDir, "wdi-series.json");
let indicators;
let series;
let coverage;
let latest;
let sourceUpdatedAt;
if (fs.existsSync(seriesCache)) {
  const saved = JSON.parse(fs.readFileSync(seriesCache, "utf8"));
  indicators = saved.indicators;
  series = saved.series;
  coverage = saved.coverage;
  latest = saved.latest;
  sourceUpdatedAt = saved.sourceUpdatedAt;
  console.log(`Reusing saved WDI series (${series.length} observations)`);
} else {
  console.log("Fetching indicator metadata");
  indicators = [];
  for (const spec of SUPPLEMENT_INDICATORS) indicators.push(await fetchIndicatorMeta(spec));
  console.log("Fetching WDI series");
  const fetched = await fetchSeries(
    iso3List,
    SUPPLEMENT_INDICATORS.map((spec) => spec.code),
  );
  sourceUpdatedAt = fetched.sourceUpdatedAt;
  const unique = new Map(fetched.rows.map((row) => [`${row.country}|${row.indicator}|${row.year}`, row]));
  series = [...unique.values()];
  ({ coverage, latest } = buildCoverage(
    series,
    iso3List,
    SUPPLEMENT_INDICATORS.map((spec) => spec.code),
  ));
}
const latestByKey = new Map(latest.map((row) => [`${row.country}|${row.indicator}`, row]));
const marketRecords = [];
for (const spec of SUPPLEMENT_INDICATORS.filter((item) => item.proxy)) {
  for (const country of wdi.countries) {
    const row = latestByKey.get(`${country.iso3}|${spec.code}`);
    if (!row) continue;
    marketRecords.push(marketProxy(spec, country, row));
  }
}

let corridors = [];
let partial = false;
try {
  console.log("Fetching UN Comtrade corridors");
  const m49ByIso3 = await comtradeReporters();
  corridors = await collectCorridors(m49ByIso3);
} catch (error) {
  partial = true;
  const checkpointPath = path.join(outDir, "corridors-checkpoint.json");
  if (fs.existsSync(checkpointPath)) {
    corridors = JSON.parse(fs.readFileSync(checkpointPath, "utf8")).corridors || [];
  }
  console.error(error.message);
  console.error(`Comtrade stopped early. Keeping ${corridors.length} corridor rows already collected.`);
}
for (const flow of corridors) marketRecords.push(corridorRecord(flow));
const checkpointFile = path.join(outDir, "corridors-checkpoint.json");
const completedQueries = fs.existsSync(checkpointFile)
  ? JSON.parse(fs.readFileSync(checkpointFile, "utf8")).done || []
  : [];
writeCollected({
  indicators,
  series,
  coverage,
  latest,
  marketRecords,
  corridors,
  sourceUpdatedAt,
  partial,
  completedQueries,
});
