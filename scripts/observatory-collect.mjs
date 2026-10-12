import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import wdi from "../data/wdi.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const collectedDir = path.join(root, "data", "collected");
const wdiPath = path.join(collectedDir, "wdi-extra.json");
const tradePath = path.join(collectedDir, "trade-flows.json");
const clientPath = path.join(collectedDir, "client.json");

const MIN_USD = 1_000_000;
const HS = [
  { code: "0901", product: "Coffee", category: "Food & agriculture" },
  { code: "0902", product: "Tea", category: "Food & agriculture" },
  { code: "1801", product: "Cocoa beans", category: "Food & agriculture" },
  { code: "1006", product: "Rice", category: "Food & agriculture" },
  { code: "080131", product: "Cashew nuts, in shell", category: "Food & agriculture" },
  { code: "1511", product: "Palm oil", category: "Food & agriculture" },
  { code: "5201", product: "Cotton, not carded or combed", category: "Apparel & textiles" },
  { code: "6109", product: "T-shirts, singlets and other vests, knitted", category: "Apparel & textiles" },
];
const INDICATORS = [
  {
    code: "TX.VAL.MRCH.CD.WT",
    unit: "current US$",
    category: "Trade",
    definition: "Merchandise exports in current US dollars. This is the scale of goods sold abroad, not an order book.",
  },
  {
    code: "TM.VAL.MRCH.CD.WT",
    unit: "current US$",
    category: "Trade",
    definition: "Merchandise imports in current US dollars.",
  },
  {
    code: "TX.VAL.MANF.ZS.UN",
    unit: "% of merchandise exports",
    category: "Apparel & textiles",
    definition: "Manufactures as a share of merchandise exports. Context for apparel and light manufacturing, not a garment order.",
  },
  {
    code: "TM.VAL.MANF.ZS.UN",
    unit: "% of merchandise imports",
    category: "Apparel & textiles",
    definition: "Manufactures as a share of merchandise imports.",
  },
  {
    code: "NV.AGR.TOTL.ZS",
    unit: "% of GDP",
    category: "Food & agriculture",
    definition: "Agriculture, forestry, and fishing value added as a share of GDP.",
  },
  {
    code: "NV.IND.MANF.ZS",
    unit: "% of GDP",
    category: "Apparel & textiles",
    definition: "Manufacturing value added as a share of GDP.",
  },
  {
    code: "NV.SRV.TOTL.ZS",
    unit: "% of GDP",
    category: "Services (aggregate)",
    definition: "Services value added as a share of GDP. An aggregate, not one service line.",
  },
  {
    code: "FP.CPI.TOTL.ZG",
    unit: "annual %",
    category: "Market context",
    definition: "Consumer price inflation, annual percent. Price context for contracts, not a product price.",
  },
  {
    code: "PA.NUS.FCRF",
    unit: "LCU per US$",
    category: "Market context",
    definition: "Official exchange rate, local currency units per US dollar, period average.",
  },
  {
    code: "EG.ELC.ACCS.ZS",
    unit: "% of population",
    category: "Market context",
    definition: "Access to electricity. Infrastructure context for production and services.",
  },
  {
    code: "IT.CEL.SETS.P2",
    unit: "per 100 people",
    category: "Digital access",
    definition: "Mobile cellular subscriptions per 100 people. Digital reach context for services, media, and payments.",
  },
];
const PRIORITY = [
  "KEN", "TZA", "ETH", "UGA", "GHA", "CIV", "NGA", "ZAF", "SEN", "CMR", "RWA", "MOZ", "MWI", "ZMB", "EGY", "MAR",
  "MDG", "BEN", "BFA", "IDN", "VNM", "THA", "IND", "CHN", "MYS", "BGD", "PAK", "LKA", "PHL", "KHM", "TUR", "ARE",
  "SAU", "JPN", "KOR", "SGP",
];

const headers = {
  accept: "application/json",
  "user-agent": "AfriXAsia-Observatory/1.0 (public market reference collection)",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value));
  fs.renameSync(tmp, file);
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt) await sleep(1500 * attempt);
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(90000) });
      const text = await response.text();
      let body;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { error: text.slice(0, 300) };
      }
      const errorText = typeof body.error === "string" ? body.error : body.error ? JSON.stringify(body.error) : "";
      if (response.status === 429 || response.status === 402 || /quota|rate limit|too many requests/i.test(errorText)) {
        const wait = (attempt + 1) * 20000;
        console.log(`rate limit\twaiting ${wait / 1000}s`);
        await sleep(wait);
        lastError = new Error(errorText || `HTTP ${response.status}`);
        lastError.quota = true;
        continue;
      }
      if (response.ok && !errorText) return body;
      lastError = new Error(errorText || `HTTP ${response.status}`);
      if (response.status >= 400 && response.status < 500 && response.status !== 408) break;
    } catch (error) {
      if (error.quota) throw error;
      lastError = error;
      console.log(`retry\t${attempt + 1}\t${error.message}`);
    }
  }
  throw lastError;
}

function wdiPayload(indicators, observations, sourceUpdatedAt) {
  return {
    retrievedAt: new Date().toISOString(),
    source: "World Bank, World Development Indicators",
    sourceUpdatedAt,
    license: "World Bank open data terms (generally CC BY 4.0; source-specific exceptions may apply)",
    licenseUrl: "https://data.worldbank.org/summary-terms-of-use",
    range: { from: 2015, to: 2025 },
    note: "Null source values are omitted. A missing country-year is not zero. These 11 indicators supplement the published 17-indicator snapshot and are not part of its checksum.",
    indicators,
    observations,
  };
}

async function collectWdi() {
  const iso3 = new Set(wdi.countries.map((country) => country.iso3));
  const existing = readJson(wdiPath, null);
  const indicators = Array.isArray(existing?.indicators) ? existing.indicators : [];
  const observations = Array.isArray(existing?.observations) ? existing.observations : [];
  const done = new Set(indicators.map((row) => row.code));
  let sourceUpdatedAt = existing?.sourceUpdatedAt || null;
  for (const indicator of INDICATORS) {
    if (done.has(indicator.code)) {
      console.log(`WDI ${indicator.code}\tskipped`);
      continue;
    }
    const rows = [];
    let page = 1;
    let pages = 1;
    while (page <= pages) {
      const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator.code}?format=json&date=2015:2025&per_page=10000&page=${page}`;
      const body = await fetchJson(url);
      if (!Array.isArray(body) || !body[0]) {
        throw new Error(`World Bank response for ${indicator.code} was not a data page.`);
      }
      sourceUpdatedAt = body[0].lastupdated || sourceUpdatedAt;
      pages = body[0].pages || 1;
      rows.push(...(body[1] || []));
      page += 1;
    }
    const name = rows.find((row) => row.indicator?.value)?.indicator.value || indicator.code;
    indicators.push({
      code: indicator.code,
      name,
      unit: indicator.unit,
      category: indicator.category,
      definition: indicator.definition,
      sourceUrl: `https://data.worldbank.org/indicator/${indicator.code}`,
    });
    let kept = 0;
    for (const row of rows) {
      if (!iso3.has(row.countryiso3code) || row.value == null) continue;
      observations.push({
        country: row.countryiso3code,
        indicator: indicator.code,
        year: Number(row.date),
        value: row.value,
        status: row.obs_status || "",
        decimal: row.decimal ?? null,
      });
      kept += 1;
    }
    console.log(`WDI ${indicator.code}\t${kept}`);
    writeJson(wdiPath, wdiPayload(indicators, observations, sourceUpdatedAt));
    await sleep(120);
  }
  writeJson(wdiPath, wdiPayload(indicators, observations, sourceUpdatedAt));
  console.log(`WDI supplement\t${indicators.length} indicators\t${observations.length} observations`);
}

function emptyTrade(years, reporterIso3) {
  return {
    retrievedAt: new Date().toISOString(),
    source: "UN Comtrade public preview API",
    license: "UN Comtrade terms of use",
    licenseUrl: "https://comtradeplus.un.org/",
    flow: "export",
    classification: "HS",
    minValueUsd: MIN_USD,
    years,
    hs: HS,
    reporterIso3,
    completedQueries: [],
    queryLog: [],
    note: "Africa–Asia bilateral goods exports. Values under USD 1 million are omitted. A missing pair is not zero trade. The public preview can stop a full reporter pass; completedQueries is the resume list.",
    flows: [],
  };
}

function loadTrade(years, reporterIso3) {
  const committed = readJson(tradePath, null);
  const client = readJson(clientPath, null);
  const trade = committed && Array.isArray(committed.flows) ? committed : emptyTrade(years, reporterIso3);
  trade.years = years;
  trade.hs = HS;
  trade.reporterIso3 = reporterIso3;
  trade.minValueUsd = MIN_USD;
  if (client && Array.isArray(client.completedQueries) && client.completedQueries.length >= (trade.completedQueries || []).length) {
    trade.completedQueries = client.completedQueries;
  }
  trade.completedQueries = [...new Set(trade.completedQueries || [])];
  return trade;
}

function saveTrade(trade) {
  trade.retrievedAt = new Date().toISOString();
  writeJson(tradePath, trade);
  writeJson(clientPath, {
    completedQueries: trade.completedQueries,
    updatedAt: trade.retrievedAt,
  });
}

async function collectTrade() {
  const reporters = await fetchJson("https://comtradeapi.un.org/files/v1/app/reference/Reporters.json");
  const list = reporters.results || reporters;
  const m49ByIso = new Map(
    list
      .filter((row) => !row.isGroup && row.reporterCodeIsoAlpha3)
      .map((row) => [row.reporterCodeIsoAlpha3, row.reporterCode]),
  );
  const countryByM49 = new Map();
  for (const country of wdi.countries) {
    const code = m49ByIso.get(country.iso3);
    if (code) countryByM49.set(code, country);
  }
  const economies = wdi.countries
    .filter((country) => m49ByIso.has(country.iso3))
    .sort((a, b) => {
      const rankA = PRIORITY.indexOf(a.iso3);
      const rankB = PRIORITY.indexOf(b.iso3);
      return (rankA === -1 ? 1000 : rankA) - (rankB === -1 ? 1000 : rankB) || a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
    });
  const asia = economies.filter((country) => country.region === "Asia").map((country) => m49ByIso.get(country.iso3));
  const africa = economies.filter((country) => country.region === "Africa").map((country) => m49ByIso.get(country.iso3));
  const hsCodes = HS.map((item) => item.code).join(",");
  const byHs = new Map(HS.map((item) => [item.code, item]));

  let years = [2024, 2023];
  try {
    const probe = await fetchJson(
      `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${m49ByIso.get("KEN")}&period=2025&partnerCode=0&cmdCode=0902&flowCode=X`,
    );
    if (Array.isArray(probe.data) && probe.data.some((row) => row.primaryValue > 0)) years = [2025, 2024, 2023];
  } catch (error) {
    console.log(`Comtrade 2025 probe\t${error.message}`);
  }
  console.log(`Comtrade years\t${years.join(",")}`);

  const trade = loadTrade(years, economies.map((country) => country.iso3));
  const done = new Set(trade.completedQueries);
  const flows = new Map(
    trade.flows.map((row) => [`${row.year}|${row.hsCode}|${row.reporterIso3}|${row.partnerIso3}`, row]),
  );
  const planned = [];
  for (const country of economies) {
    for (const year of years) planned.push(`${country.iso3}|${year}`);
  }
  const pending = planned.filter((key) => !done.has(key));
  console.log(`Comtrade pending\t${pending.length}/${planned.length}`);
  let consecutiveErrors = 0;

  for (const key of pending) {
    const [iso3, yearText] = key.split("|");
    const year = Number(yearText);
    const country = economies.find((item) => item.iso3 === iso3);
    const reporterCode = m49ByIso.get(iso3);
    const partners = country.region === "Africa" ? asia : africa;
    const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterCode}&period=${year}&partnerCode=${partners.join(",")}&cmdCode=${hsCodes}&flowCode=X`;
    let body;
    try {
      body = await fetchJson(url);
    } catch (error) {
      saveTrade(trade);
      if (error.quota) {
        console.log(`Comtrade quota stop\t${key}\t${error.message}`);
        return;
      }
      console.log(`Comtrade error\t${key}\t${error.message}`);
      trade.queryLog = trade.queryLog.filter((row) => row.key !== key);
      trade.queryLog.push({
        key,
        reporterIso3: iso3,
        year,
        returned: 0,
        kept: 0,
        status: "error",
      });
      saveTrade(trade);
      consecutiveErrors += 1;
      if (consecutiveErrors >= 5) {
        console.log("Comtrade stopped after 5 consecutive errors");
        return;
      }
      await sleep(400);
      continue;
    }
    consecutiveErrors = 0;
    const rows = Array.isArray(body.data) ? body.data : [];
    let kept = 0;
    for (const row of rows) {
      const product = byHs.get(String(row.cmdCode));
      const partner = countryByM49.get(row.partnerCode);
      if (!product || !partner || partner.region === country.region) continue;
      if (!(row.primaryValue >= MIN_USD)) continue;
      const flow = {
        year,
        hsCode: product.code,
        product: product.product,
        category: product.category,
        reporterIso3: country.iso3,
        partnerIso3: partner.iso3,
        origin: country.name,
        target: partner.name,
        originRegion: country.region,
        targetRegion: partner.region,
        flow: "export",
        valueUsd: row.primaryValue,
        quantityKg: row.qtyUnitCode === 8 ? row.netWgt : null,
        classificationCode: row.classificationCode || null,
        sourceUrl: `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterCode}&period=${year}&partnerCode=${row.partnerCode}&cmdCode=${product.code}&flowCode=X`,
        retrievedAt: new Date().toISOString(),
      };
      flows.set(`${year}|${product.code}|${country.iso3}|${partner.iso3}`, flow);
      kept += 1;
    }
    trade.flows = [...flows.values()];
    trade.completedQueries = [...done.add(key)];
    trade.queryLog = trade.queryLog.filter((row) => row.key !== key);
    trade.queryLog.push({
      key,
      reporterIso3: iso3,
      year,
      returned: rows.length,
      kept,
      status: rows.length >= 500 ? "truncated" : "ok",
    });
    saveTrade(trade);
    console.log(`Comtrade ${key}\treturned ${rows.length}\tkept ${kept}`);
    await sleep(8000);
  }
  console.log(`Comtrade flows\t${trade.flows.length}\tcompleted ${trade.completedQueries.length}/${planned.length}`);
}

await collectWdi();
await collectTrade();
