import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildDatabase } from "./build.mjs";
import {
  commoditySeries,
  delay,
  extraDatasetId,
  extraIndicators,
  fetchText,
  fishProductionDatasetId,
  fishProductionItems,
  fisheryDatasetId,
  fisheryProducts,
  horticultureDatasetId,
  horticultureProducts,
  specialtyDatasetId,
  specialtyProducts,
  minTradeUsd,
  paths,
  pinkSheetUrl,
  priceDatasetId,
  productionDatasetId,
  productionItems,
  readJson,
  seriesEnd,
  seriesStart,
  tradeDatasetId,
  tradeProducts,
  tradeYears,
  writeJson,
} from "./lib.mjs";

const reporterReferenceUrl = "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";
const partnerReferenceUrl = "https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json";
const tradeCollectionVersion = 2;
const horticultureCollectionVersion = 1;
const specialtyCollectionVersion = 1;
const fisheryCollectionVersion = 1;
const faostatUrl = "https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip";
const fishStatUrl = "https://www.fao.org/fishery/static/Data/GlobalProduction_2026.1.0.zip";
const pinkScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "pinksheet.py");
const faostatScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "faostat.py");
const fishScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "fishstat.py");

function stamp() {
  return new Date().toISOString();
}

function loadTradeState(options) {
  const fresh = {
    datasetId: options.datasetId,
    title: options.title,
    source: "UN Comtrade public preview",
    sourceUrl: "https://comtradeplus.un.org/",
    license: "UN Comtrade data terms",
    licenseUrl: "https://uncomtrade.org/docs/policy-on-the-use-and-re-dissemination-of-un-comtrade-data/",
    frequency: "Annual",
    minValueUsd: minTradeUsd,
    years: tradeYears,
    hsCodes: options.products.map((item) => item.hs),
    note: options.note,
    collectionVersion: options.collectionVersion,
    retrievedAt: null,
    completedQueries: {},
    flows: [],
  };
  let state = fresh;
  if (fs.existsSync(options.statePath)) {
    const saved = readJson(options.statePath);
    state = { ...fresh, ...saved, collectionVersion: saved.collectionVersion || 1 };
  }
  if (options.useClient && fs.existsSync(paths.clientState)) {
    const client = readJson(paths.clientState);
    if ((client.collectionVersion || 1) === (state.collectionVersion || 1) && client.datasetId === state.datasetId) {
      const completed = { ...state.completedQueries, ...client.completedQueries };
      const flows = new Map();
      for (const flow of [...(state.flows || []), ...(client.flows || [])]) flows.set(flowKey(flow), flow);
      state = { ...state, completedQueries: completed, flows: [...flows.values()] };
    }
  }
  if ((state.collectionVersion || 1) !== options.collectionVersion) {
    console.log(`${options.datasetId}: collection version changed. Repeating reporter-year queries.`);
    state.completedQueries = {};
    state.flows = [];
    state.collectionVersion = options.collectionVersion;
  }
  return state;
}

function flowKey(flow) {
  return [flow.reporterIso3, flow.partnerIso3, flow.hsCode, flow.year, flow.flow].join("|");
}

function saveTradeState(state, options) {
  state.retrievedAt = stamp();
  writeJson(options.statePath, state);
  if (options.useClient) writeJson(paths.clientState, state);
}

function indexAreas(rows, isoKey, codeKey) {
  const map = new Map();
  for (const row of rows) {
    if (row.isGroup) continue;
    const iso = row[isoKey];
    const code = row[codeKey];
    if (!iso || code == null) continue;
    const candidate = {
      code: Number(code),
      current: !row.entryExpiredDate,
      effective: String(row.entryEffectiveDate || ""),
    };
    const existing = map.get(iso);
    const better = !existing
      || (candidate.current && !existing.current)
      || (candidate.current === existing.current && candidate.effective > existing.effective);
    if (better) map.set(iso, candidate);
  }
  return new Map([...map].map(([iso, value]) => [iso, value.code]));
}

function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

async function fetchTextRetry(url, label) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetchText(url, { timeoutMs: 120000 });
      if (response.status === 200) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    console.log(`${label} retry ${attempt}: ${lastError.message}`);
    await delay(3000 * attempt);
  }
  throw lastError;
}

async function collectWdi(countries) {
  const iso3 = new Set(countries.map((country) => country.iso3));
  const indicators = [];
  const observations = [];
  let sourceUpdatedAt = null;
  for (const spec of extraIndicators) {
    const metaResponse = await fetchTextRetry(`https://api.worldbank.org/v2/indicator/${spec.code}?format=json`, `WDI ${spec.code} metadata`);
    if (metaResponse.status !== 200) throw new Error(`Indicator metadata ${spec.code} returned HTTP ${metaResponse.status}`);
    const metaJson = JSON.parse(metaResponse.text);
    const meta = metaJson?.[1]?.[0];
    if (!meta?.id) throw new Error(`Indicator ${spec.code} was not found at the World Bank API.`);
    indicators.push({
      ...spec,
      name: meta.name,
      definition: meta.sourceNote || "",
      sourceOrganization: meta.sourceOrganization || "",
      sourceUrl: `https://data.worldbank.org/indicator/${spec.code}`,
    });
    let page = 1;
    let pages = 1;
    let kept = 0;
    while (page <= pages) {
      const url = `https://api.worldbank.org/v2/country/all/indicator/${spec.code}?format=json&per_page=5000&page=${page}&date=${seriesStart}:${seriesEnd}`;
      const response = await fetchTextRetry(url, `WDI ${spec.code} page ${page}`);
      if (response.status !== 200) throw new Error(`WDI ${spec.code} page ${page} returned HTTP ${response.status}`);
      const json = JSON.parse(response.text);
      if (!Array.isArray(json) || json[0]?.message) {
        throw new Error(`WDI ${spec.code} page ${page} returned ${response.text.slice(0, 240)}`);
      }
      sourceUpdatedAt = json[0].lastupdated || sourceUpdatedAt;
      pages = json[0].pages || 1;
      for (const row of json[1] || []) {
        if (!iso3.has(row.countryiso3code) || row.value == null || row.value === "") continue;
        const year = Number(row.date);
        if (year < seriesStart || year > seriesEnd) continue;
        observations.push({
          country: row.countryiso3code,
          indicator: spec.code,
          year,
          value: Number(row.value),
          status: row.obs_status || "",
          decimal: row.decimal ?? null,
        });
        kept += 1;
      }
      page += 1;
    }
    console.log(`WDI ${spec.code} ${kept} observations, source ${sourceUpdatedAt}`);
  }
  const payload = {
    datasetId: extraDatasetId,
    title: "Extended Asia–Africa market indicators",
    source: "World Bank — World Development Indicators",
    sourceUrl: "https://data.worldbank.org/",
    license: "World Bank open data terms (generally CC BY 4.0; source-specific exceptions may apply)",
    licenseUrl: "https://data.worldbank.org/summary-terms-of-use",
    frequency: "Annual",
    sourceUpdatedAt,
    retrievedAt: stamp(),
    range: [seriesStart, seriesEnd],
    note: "Null source values are omitted. A missing country-year is not zero.",
    indicators,
    observations,
  };
  writeJson(paths.wdiExtra, payload);
  return payload;
}

export async function collectPrices() {
  const response = await fetch(pinkSheetUrl, {
    headers: { "user-agent": "AfriXAsia-Observatory/1.0" },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Pink Sheet returned HTTP ${response.status}`);
  const file = path.join(os.tmpdir(), "afrixasia-cmo-monthly.xlsx");
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  const parsed = spawnSync("python3", [pinkScript, file], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (parsed.status !== 0) throw new Error(parsed.stderr || "Pink Sheet parser failed");
  const table = JSON.parse(parsed.stdout);
  const byName = new Map();
  for (const row of table.prices) {
    const list = byName.get(row.series) || [];
    list.push(row);
    byName.set(row.series, list);
  }
  const prices = [];
  for (const series of commoditySeries) {
    const rows = byName.get(series.column);
    if (!rows?.length) throw new Error(`Pink Sheet column missing: ${series.column}`);
    for (const row of rows) prices.push({ series: series.series, period: row.period, price: row.price });
  }
  const periods = prices.map((row) => row.period).sort();
  const payload = {
    datasetId: priceDatasetId,
    title: "Monthly benchmark prices for observatory commodities",
    source: "World Bank Commodity Price Data (The Pink Sheet)",
    sourceUrl: "https://www.worldbank.org/en/research/commodity-markets",
    distributionUrl: pinkSheetUrl,
    license: "World Bank open data terms (generally CC BY 4.0; source-specific exceptions may apply)",
    licenseUrl: "https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets",
    frequency: "Monthly",
    sourceUpdatedAt: table.updated,
    retrievedAt: stamp(),
    note: "Nominal US dollar benchmarks. They are not bilateral Africa–Asia contract prices. Tea is the Mombasa auction series.",
    series: commoditySeries,
    prices,
  };
  writeJson(paths.commodityPrices, payload);
  console.log(`Prices ${prices.length} monthly observations, ${periods[0]} to ${periods.at(-1)}, Pink Sheet ${table.updated}`);
  return payload;
}

async function collectTrade(countries, options) {
  const reporters = asList(JSON.parse((await fetchText(reporterReferenceUrl)).text));
  const partners = asList(JSON.parse((await fetchText(partnerReferenceUrl)).text));
  const reporterByIso = indexAreas(reporters, "reporterCodeIsoAlpha3", "reporterCode");
  const partnerByIso = indexAreas(partners, "PartnerCodeIsoAlpha3", "PartnerCode");
  const isoByPartner = new Map([...partnerByIso].map(([iso, code]) => [code, iso]));
  const missingPartner = countries.filter((country) => !partnerByIso.has(country.iso3));
  if (missingPartner.length) {
    throw new Error(`Comtrade has no partner code for ${missingPartner.map((country) => country.iso3).join(", ")}`);
  }
  const partnersByRegion = {
    Africa: countries.filter((country) => country.region === "Africa").map((country) => partnerByIso.get(country.iso3)).join(","),
    Asia: countries.filter((country) => country.region === "Asia").map((country) => partnerByIso.get(country.iso3)).join(","),
  };
  const state = loadTradeState(options);
  const hsList = options.products.map((item) => item.hs);
  let intervalMs = 5000;
  let nextAt = 0;
  const jobs = [];
  for (const country of countries) {
    for (const year of tradeYears) jobs.push({ country, year });
  }
  let done = Object.values(state.completedQueries).filter((query) => query.status === "ok" || query.status === "not_a_reporter").length;
  console.log(`${options.datasetId}: ${jobs.length} reporter-years, ${done} already finished`);

  async function pace() {
    const wait = nextAt - Date.now();
    if (wait > 0) await delay(wait);
    nextAt = Date.now() + intervalMs;
  }

  async function preview(reporterCode, year, partnerCode, cmdCode) {
    const url = new URL("https://comtradeapi.un.org/public/v1/preview/C/A/HS");
    url.searchParams.set("reporterCode", String(reporterCode));
    url.searchParams.set("period", String(year));
    url.searchParams.set("partnerCode", partnerCode);
    url.searchParams.set("cmdCode", cmdCode);
    url.searchParams.set("flowCode", "X");
    url.searchParams.set("maxRecords", "500");
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await pace();
      let response;
      try {
        response = await fetchText(url, { timeoutMs: 90000 });
      } catch (error) {
        intervalMs = Math.min(20000, Math.max(8000, intervalMs));
        nextAt = Date.now() + intervalMs;
        console.log(`Comtrade ${error.name || "fetch error"}, waiting ${intervalMs}ms`);
        continue;
      }
      if (response.status === 429 || response.status >= 500) {
        intervalMs = Math.min(20000, Math.max(8000, intervalMs * 2));
        nextAt = Date.now() + intervalMs;
        console.log(`Comtrade HTTP ${response.status}, waiting ${intervalMs}ms`);
        continue;
      }
      let payload = {};
      try {
        payload = JSON.parse(response.text);
      } catch {
        payload = { error: response.text.slice(0, 180) };
      }
      return { status: response.status, count: payload.count ?? payload.data?.length ?? 0, data: payload.data || [], error: payload.error || "" };
    }
    return { status: 429, count: 0, data: [], error: "Rate limit persisted" };
  }

  function mergePreview(left, right) {
    if (left.status !== 200) return left;
    if (right.status !== 200) return right;
    const data = [...left.data, ...right.data];
    const truncated = left.error === "truncated" || right.error === "truncated";
    return { status: 200, count: data.length, data, error: truncated ? "truncated" : "" };
  }

  async function previewProducts(reporterCode, year, partnerCode, codes) {
    const result = await preview(reporterCode, year, partnerCode, codes.join(","));
    if (result.status !== 200 || result.count < 500) return result;
    if (codes.length > 1) {
      const mid = Math.ceil(codes.length / 2);
      const left = await previewProducts(reporterCode, year, partnerCode, codes.slice(0, mid));
      const right = await previewProducts(reporterCode, year, partnerCode, codes.slice(mid));
      return mergePreview(left, right);
    }
    const partners = partnerCode.split(",").filter(Boolean);
    if (partners.length > 1) {
      const mid = Math.ceil(partners.length / 2);
      const left = await previewProducts(reporterCode, year, partners.slice(0, mid).join(","), codes);
      const right = await previewProducts(reporterCode, year, partners.slice(mid).join(","), codes);
      return mergePreview(left, right);
    }
    return { ...result, error: "truncated" };
  }

  for (const job of jobs) {
    const key = `${job.country.iso3}:${job.year}`;
    const prior = state.completedQueries[key];
    if (prior && (prior.status === "ok" || prior.status === "not_a_reporter")) continue;
    const reporterCode = reporterByIso.get(job.country.iso3);
    if (!reporterCode) {
      state.completedQueries[key] = {
        reporterIso3: job.country.iso3,
        year: job.year,
        status: "not_a_reporter",
        httpStatus: null,
        rowCount: 0,
        keptCount: 0,
        detail: "No UN Comtrade reporter code for this economy.",
        finishedAt: stamp(),
      };
      saveTradeState(state, options);
      done += 1;
      console.log(`[${done}/${jobs.length}] ${key} not_a_reporter`);
      continue;
    }
    const opposite = job.country.region === "Africa" ? partnersByRegion.Asia : partnersByRegion.Africa;
    let result;
    try {
      result = await previewProducts(reporterCode, job.year, opposite, hsList);
    } catch (error) {
      state.completedQueries[key] = {
        reporterIso3: job.country.iso3,
        year: job.year,
        status: "error",
        httpStatus: null,
        rowCount: 0,
        keptCount: 0,
        detail: error.message,
        finishedAt: stamp(),
      };
      saveTradeState(state, options);
      console.log(`[${done}/${jobs.length}] ${key} error ${error.message}`);
      continue;
    }
    if (result.status !== 200 || (result.error && result.error !== "truncated")) {
      state.completedQueries[key] = {
        reporterIso3: job.country.iso3,
        year: job.year,
        status: "error",
        httpStatus: result.status,
        rowCount: result.count,
        keptCount: 0,
        detail: result.error || `HTTP ${result.status}`,
        finishedAt: stamp(),
      };
      saveTradeState(state, options);
      console.log(`[${done}/${jobs.length}] ${key} error ${result.status} ${result.error}`);
      continue;
    }
    const kept = [];
    for (const row of result.data) {
      const value = Number(row.primaryValue);
      const partnerIso3 = isoByPartner.get(Number(row.partnerCode));
      if (!partnerIso3 || !Number.isFinite(value) || value < minTradeUsd) continue;
      if (!hsList.includes(String(row.cmdCode))) continue;
      kept.push({
        queryKey: key,
        reporterIso3: job.country.iso3,
        partnerIso3,
        hsCode: String(row.cmdCode),
        year: Number(row.period),
        flow: "export",
        tradeValueUsd: value,
        netWeightKg: row.netWgt == null ? null : Number(row.netWgt),
        qty: row.qty == null ? null : Number(row.qty),
        qtyUnitCode: row.qtyUnitCode ?? null,
      });
    }
    state.flows = state.flows.filter((flow) => flow.queryKey !== key);
    state.flows.push(...kept);
    const status = result.error === "truncated" ? "truncated" : "ok";
    state.completedQueries[key] = {
      reporterIso3: job.country.iso3,
      year: job.year,
      status,
      httpStatus: result.status,
      rowCount: result.data.length,
      keptCount: kept.length,
      detail: status === "truncated" ? "Preview limit of 500 rows was hit after splitting products." : "",
      finishedAt: stamp(),
    };
    saveTradeState(state, options);
    done += 1;
    console.log(`[${done}/${jobs.length}] ${key} ${status} api=${result.data.length} kept=${kept.length}`);
  }
  return state;
}

export async function collectProduction() {
  const response = await fetch(faostatUrl, {
    headers: { "user-agent": "AfriXAsia-Observatory/1.0" },
    signal: AbortSignal.timeout(300000),
  });
  if (!response.ok) throw new Error(`FAOSTAT bulk returned HTTP ${response.status}`);
  const file = path.join(os.tmpdir(), "afrixasia-faostat-qcl.zip");
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  const items = productionItems.map((item) => item.itemCode).join(",");
  const parsed = spawnSync("python3", [faostatScript, file, paths.wdi, items], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (parsed.status !== 0) throw new Error(parsed.stderr || parsed.stdout || "FAOSTAT parser failed");
  const table = JSON.parse(parsed.stdout);
  const payload = {
    datasetId: productionDatasetId,
    title: "Crop production for observatory products",
    source: "FAO. 2025. FAOSTAT: Crops and livestock products.",
    sourceUrl: "https://www.fao.org/faostat/en/#data/QCL",
    distributionUrl: faostatUrl,
    license: "CC BY 4.0, subject to the FAO Statistical Database Terms of Use. Not an FAO endorsement.",
    licenseUrl: "https://www.fao.org/contact-us/terms/db-terms-of-use/en/",
    frequency: "Annual",
    sourceUpdatedAt: table.sourceFileDate,
    retrievedAt: stamp(),
    note: "Production (t), area harvested (ha), and yield (kg/ha) for 2015–2024. Tea is fresh leaves, not made tea. Rice is the FAO rice item, not milled-rice trade. Palm fruit and palm oil are separate and must not be added. Cotton lint has no harvested-area series in this extract. Pepper is Piper, not Capsicum. A missing country-year is not zero production. Macao has no rows for these items.",
    items: productionItems,
    rows: table.rows,
  };
  const present = new Set(table.rows.map((row) => row.itemCode));
  const absent = productionItems.filter((item) => !present.has(item.itemCode));
  if (absent.length) {
    throw new Error(`FAOSTAT returned no rows for ${absent.map((item) => `${item.itemCode} ${item.name}`).join(", ")}`);
  }
  writeJson(paths.production, payload);
  console.log(`Production ${table.rows.length} rows, FAOSTAT file ${table.sourceFileDate}`);
  return payload;
}

export async function collectFishProduction() {
  const response = await fetch(fishStatUrl, {
    headers: { "user-agent": "AfriXAsia-Observatory/1.0" },
    signal: AbortSignal.timeout(300000),
  });
  if (!response.ok) throw new Error(`FishStat bulk returned HTTP ${response.status}`);
  const file = path.join(os.tmpdir(), "afrixasia-fishstat.zip");
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  const parsed = spawnSync("python3", [fishScript, file, paths.wdi], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (parsed.status !== 0) throw new Error(parsed.stderr || parsed.stdout || "FishStat parser failed");
  const table = JSON.parse(parsed.stdout);
  const payload = {
    datasetId: fishProductionDatasetId,
    title: "Aquatic-animal production for observatory economies",
    source: "FAO. 2026. FishStat: Global production by production source 1950–2024.",
    sourceUrl: "https://www.fao.org/fishery/en/statistics",
    distributionUrl: fishStatUrl,
    license: "CC BY 4.0, subject to the FAO Statistical Database Terms of Use. Not an FAO endorsement.",
    licenseUrl: "https://www.fao.org/contact-us/terms/db-terms-of-use/en/",
    frequency: "Annual",
    sourceUpdatedAt: table.sourceFileDate,
    retrievedAt: stamp(),
    note: "Live weight of aquatic animals (fish, crustaceans, and molluscs), 2015–2024. Algae, crocodiles, aquatic mammals, pearls, corals, and sponges are excluded. Capture and aquaculture are separate and must not be added into an export figure. A missing country-year is not zero production. This is not HS trade weight.",
    items: fishProductionItems,
    rows: table.rows,
  };
  const present = new Set(table.rows.map((row) => row.itemCode));
  const absent = fishProductionItems.filter((item) => !present.has(item.itemCode));
  if (absent.length) {
    throw new Error(`FishStat returned no rows for ${absent.map((item) => item.itemCode).join(", ")}`);
  }
  writeJson(paths.fishProduction, payload);
  console.log(`Fish production ${table.rows.length} rows, FishStat file ${table.sourceFileDate}`);
  return payload;
}

const tradeOptions = {
  datasetId: tradeDatasetId,
  title: "Africa–Asia merchandise flows for observatory products",
  note: "Reporter exports to the other region only. Values under USD 1 million are omitted. A missing pair is not zero trade. Preview rows are aggregate HS totals.",
  products: tradeProducts,
  collectionVersion: tradeCollectionVersion,
  statePath: paths.tradeFlows,
  useClient: true,
};

const horticultureOptions = {
  datasetId: horticultureDatasetId,
  title: "Africa–Asia tomato and orange exports",
  note: "Fresh or chilled tomatoes (HS 0702) and fresh or dried oranges (HS 080510). Reporter exports to the other region only. Values under USD 1 million are omitted. A missing pair is not zero trade.",
  products: horticultureProducts,
  collectionVersion: horticultureCollectionVersion,
  statePath: paths.tradeHorticulture,
  useClient: false,
};

const specialtyOptions = {
  datasetId: specialtyDatasetId,
  title: "Africa–Asia sesame, vanilla, clove, and pepper exports",
  note: "Sesame seeds (HS 120740), vanilla (HS 0905), cloves (HS 0907), and pepper (HS 090411 and 090412). Reporter exports to the other region only. Values under USD 1 million are omitted. A missing pair is not zero trade. Pepper is Piper, not Capsicum.",
  products: specialtyProducts,
  collectionVersion: specialtyCollectionVersion,
  statePath: paths.tradeSpecialty,
  useClient: false,
};

const fisheryOptions = {
  datasetId: fisheryDatasetId,
  title: "Africa–Asia frozen fish, fillet, and prepared-tuna exports",
  note: "Frozen fish excluding fillets (HS 0303), fish fillets (HS 0304), and prepared or preserved tunas (HS 160414). Reporter exports to the other region only. Values under USD 1 million are omitted. A missing pair is not zero trade. These are customs values, not live-weight production.",
  products: fisheryProducts,
  collectionVersion: fisheryCollectionVersion,
  statePath: paths.tradeFishery,
  useClient: false,
};

export async function collectObservatory() {
  fs.mkdirSync(paths.collected, { recursive: true });
  const wdi = readJson(paths.wdi);
  console.log(`Collecting for ${wdi.countries.length} economies`);
  await collectWdi(wdi.countries);
  await collectPrices();
  await collectProduction();
  await collectFishProduction();
  await collectTrade(wdi.countries, tradeOptions);
  buildDatabase();
  await collectTrade(wdi.countries, horticultureOptions);
  buildDatabase();
  await collectTrade(wdi.countries, specialtyOptions);
  buildDatabase();
  await collectTrade(wdi.countries, fisheryOptions);
  buildDatabase();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  collectObservatory().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
