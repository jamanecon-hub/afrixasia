import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import observations from "../data/observations.json" with { type: "json" };
import supplementObservations from "../data/collected/observations.json" with { type: "json" };
import brief from "../data/brief.json" with { type: "json" };
import catalog from "../data/catalog.json" with { type: "json" };
import collected from "../data/collected/client.json" with { type: "json" };
import { market, summary, wdi } from "../shared/reference.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, "data", "observatory.sqlite");

const datasets = catalog.datasets.filter(
  (dataset) => !["afrixasia-wdi-supplement", "afrixasia-comtrade", "afrixasia-observatory-db"].includes(dataset.id),
);
if (collected.observationCount) {
  datasets.push(
    {
      id: "afrixasia-wdi-supplement",
      title: "Sector context for thin observatory coverage",
      description:
        "World Bank series for textile value added, food production, employment structure, secondary enrollment, adult literacy, mobile access, travel services, and tourism arrivals, 2015–2025. Not summed with the 10 October snapshot.",
      source: "World Bank WDI; upstream providers identified per indicator",
      sourceUpdatedAt: collected.sourceUpdatedAt,
      retrievedAt: collected.retrievedAt,
      license: "World Bank open data terms (generally CC BY 4.0; source-specific exceptions may apply)",
      licenseUrl: "https://data.worldbank.org/summary-terms-of-use",
      frequency: "Annual; collected snapshot",
      api: "/api/reference?indicator=NV.MNF.TXTL.ZS.UN",
      csv: "/api/reference?view=series&indicator=NV.MNF.TXTL.ZS.UN&format=csv",
      checksum: collected.checksum,
    },
    {
      id: "afrixasia-comtrade",
      title: "Asia–Africa bilateral merchandise corridors",
      description: collected.partial
        ? "UN Comtrade annual export flows for coffee, tea, cocoa, rice, cashew, palm oil, cotton, and knitted shirts. Values under USD 1 million are omitted. The public preview quota stopped this extract before every listed reporter finished; a missing pair is not zero trade."
        : "UN Comtrade annual export flows for selected food and apparel HS codes between observatory economies. Values under USD 1 million are omitted. A missing pair is not zero trade.",
      source: "UN Comtrade",
      retrievedAt: collected.retrievedAt,
      license: "UN Comtrade terms of use",
      licenseUrl: "https://comtradeplus.un.org/",
      frequency: "Annual; collected snapshot",
      api: "/api/corridors",
      csv: "/api/corridors?format=csv",
      minValueUsd: collected.minCorridorUsd,
    },
  );
}
datasets.push({
  id: "afrixasia-observatory-db",
  title: "Observatory SQLite database",
  description:
    "Queryable copy of WDI observations, market references, organization profiles, bilateral corridors, and the media brief.",
  api: "/api/db",
  file: "data/observatory.sqlite",
});

const nextCatalog = {
  ...catalog,
  summary: summary(),
  datasets,
  citation: collected.citation
    ? `${catalog.citation} ${collected.citation}`
    : catalog.citation,
};

fs.rmSync(dbPath, { force: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = DELETE;
  CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE countries (
    iso3 TEXT PRIMARY KEY,
    iso2 TEXT NOT NULL,
    name TEXT NOT NULL,
    source_name TEXT,
    region TEXT NOT NULL,
    lat REAL,
    lon REAL,
    capital TEXT,
    income_group TEXT,
    source_url TEXT
  );
  CREATE TABLE indicators (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT,
    unit TEXT,
    category TEXT,
    side TEXT,
    type TEXT,
    frequency TEXT,
    definition TEXT,
    source_organization TEXT,
    source_id TEXT,
    source TEXT,
    source_url TEXT,
    license_url TEXT,
    interpretation TEXT,
    dataset_id TEXT NOT NULL
  );
  CREATE TABLE observations (
    country TEXT NOT NULL,
    indicator TEXT NOT NULL,
    year INTEGER NOT NULL,
    value REAL NOT NULL,
    status TEXT,
    decimal INTEGER,
    dataset_id TEXT NOT NULL,
    PRIMARY KEY (country, indicator, year)
  );
  CREATE TABLE coverage (
    country TEXT NOT NULL,
    indicator TEXT NOT NULL,
    observations INTEGER NOT NULL,
    first_year INTEGER,
    latest_year INTEGER,
    status TEXT NOT NULL,
    missing_years TEXT NOT NULL,
    PRIMARY KEY (country, indicator)
  );
  CREATE TABLE latest (
    country TEXT NOT NULL,
    indicator TEXT NOT NULL,
    year INTEGER,
    value REAL,
    status TEXT,
    decimal INTEGER,
    previous_year INTEGER,
    previous_value REAL,
    PRIMARY KEY (country, indicator)
  );
  CREATE TABLE market_records (
    id TEXT PRIMARY KEY,
    country TEXT,
    region TEXT,
    category TEXT,
    side TEXT,
    type TEXT,
    origin TEXT,
    target TEXT,
    product TEXT,
    dataset_id TEXT,
    payload TEXT NOT NULL
  );
  CREATE TABLE providers (
    id TEXT PRIMARY KEY,
    country TEXT,
    region TEXT,
    category TEXT,
    name TEXT,
    payload TEXT NOT NULL
  );
  CREATE TABLE corridors (
    id TEXT PRIMARY KEY,
    origin TEXT,
    target TEXT,
    origin_iso3 TEXT,
    target_iso3 TEXT,
    category TEXT,
    hs_code TEXT,
    period TEXT,
    value_usd REAL,
    payload TEXT NOT NULL
  );
  CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    body TEXT NOT NULL
  );
  CREATE INDEX idx_observations_indicator ON observations (indicator, year);
  CREATE INDEX idx_market_country ON market_records (country, category, side);
  CREATE INDEX idx_corridors_pair ON corridors (origin, target, hs_code);
`);

const insertCountry = db.prepare(
  `INSERT INTO countries (iso3, iso2, name, source_name, region, lat, lon, capital, income_group, source_url)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertIndicator = db.prepare(
  `INSERT INTO indicators (
     code, name, label, unit, category, side, type, frequency, definition, source_organization,
     source_id, source, source_url, license_url, interpretation, dataset_id
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertObservation = db.prepare(
  `INSERT OR IGNORE INTO observations (country, indicator, year, value, status, decimal, dataset_id)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
);
const insertCoverage = db.prepare(
  `INSERT INTO coverage (country, indicator, observations, first_year, latest_year, status, missing_years)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
);
const insertLatest = db.prepare(
  `INSERT INTO latest (country, indicator, year, value, status, decimal, previous_year, previous_value)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertMarket = db.prepare(
  `INSERT INTO market_records (id, country, region, category, side, type, origin, target, product, dataset_id, payload)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertProvider = db.prepare(
  `INSERT INTO providers (id, country, region, category, name, payload) VALUES (?, ?, ?, ?, ?, ?)`,
);
const insertCorridor = db.prepare(
  `INSERT INTO corridors (id, origin, target, origin_iso3, target_iso3, category, hs_code, period, value_usd, payload)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const baseCodes = new Set(
  JSON.parse(fs.readFileSync(path.join(root, "data", "wdi.json"), "utf8")).indicators.map((item) => item.code),
);

db.exec("BEGIN");
for (const country of wdi.countries) {
  insertCountry.run(
    country.iso3,
    country.iso2,
    country.name,
    country.sourceName || country.name,
    country.region,
    country.lat,
    country.lon,
    country.capital || "",
    country.incomeGroup || "",
    country.sourceUrl || "",
  );
}
for (const indicator of wdi.indicators) {
  insertIndicator.run(
    indicator.code,
    indicator.name,
    indicator.label || "",
    indicator.unit || "",
    indicator.category || "",
    indicator.side || "",
    indicator.type || "",
    indicator.frequency || "Annual",
    indicator.definition || "",
    indicator.sourceOrganization || "",
    indicator.sourceId || "",
    indicator.source || "",
    indicator.sourceUrl || "",
    indicator.licenseUrl || "",
    indicator.interpretation || "",
    baseCodes.has(indicator.code) ? "afrixasia-wdi" : "afrixasia-wdi-supplement",
  );
}
for (const row of observations) {
  insertObservation.run(row.country, row.indicator, row.year, row.value, row.status || "", row.decimal ?? 0, "afrixasia-wdi");
}
for (const row of supplementObservations) {
  insertObservation.run(
    row.country,
    row.indicator,
    row.year,
    row.value,
    row.status || "",
    row.decimal ?? 0,
    "afrixasia-wdi-supplement",
  );
}
for (const row of wdi.coverage) {
  insertCoverage.run(
    row.country,
    row.indicator,
    row.observations,
    row.firstYear,
    row.latestYear,
    row.status,
    JSON.stringify(row.missingYears || []),
  );
}
for (const row of wdi.latest) {
  insertLatest.run(
    row.country,
    row.indicator,
    row.year,
    row.value,
    row.status || "",
    row.decimal ?? 0,
    row.previousYear,
    row.previousValue,
  );
}
for (const row of market.records) {
  insertMarket.run(
    row.id,
    row.country || "",
    row.region || "",
    row.category || "",
    row.side || "",
    row.type || "",
    row.origin || "",
    row.target || "",
    row.product || "",
    row.datasetId || "",
    JSON.stringify(row),
  );
}
for (const row of market.providers) {
  insertProvider.run(row.id, row.country || "", row.region || "", row.category || "", row.name || "", JSON.stringify(row));
}
market.corridors.forEach((row, index) => {
  insertCorridor.run(
    row.id || `corridor-${index + 1}`,
    row.origin || "",
    row.target || "",
    row.originIso3 || "",
    row.targetIso3 || "",
    row.category || "",
    row.hsCode || "",
    row.period || "",
    row.valueUSD ?? null,
    JSON.stringify(row),
  );
});
db.prepare("INSERT INTO documents (id, body) VALUES (?, ?)").run("brief", JSON.stringify(brief));
db.prepare("INSERT INTO documents (id, body) VALUES (?, ?)").run("catalog", JSON.stringify(nextCatalog));
db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run("builtAt", new Date().toISOString());
db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run("wdiVersion", wdi.version);
db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run("supplementRetrievedAt", collected.retrievedAt || "");
db.exec("COMMIT");

fs.writeFileSync(path.join(root, "data", "catalog.json"), `${JSON.stringify(nextCatalog)}\n`);
const counts = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((table) => ({ table: table.name, rows: db.prepare(`SELECT COUNT(*) AS n FROM ${table.name}`).get().n }));
db.close();
console.log(JSON.stringify({ file: "data/observatory.sqlite", counts, summary: nextCatalog.summary }, null, 2));
