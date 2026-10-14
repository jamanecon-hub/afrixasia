import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const paths = {
  root,
  data: path.join(root, "data"),
  collected: path.join(root, "data", "collected"),
  database: path.join(root, "data", "observatory.sqlite"),
  wdi: path.join(root, "data", "wdi.json"),
  observations: path.join(root, "data", "observations.json"),
  market: path.join(root, "data", "market.json"),
  wdiExtra: path.join(root, "data", "collected", "wdi-extra.json"),
  tradeFlows: path.join(root, "data", "collected", "trade-flows.json"),
  clientState: path.join(root, "data", "collected", "client.json"),
  commodityPrices: path.join(root, "data", "collected", "commodity-prices.json"),
};

export const snapshotDatasetId = "afrixasia-wdi";
export const extraDatasetId = "worldbank-wdi-extra";
export const tradeDatasetId = "un-comtrade-africa-asia";
export const priceDatasetId = "worldbank-pink-sheet";
export const marketDatasetId = "afrixasia-market";

export const tradeYears = [2023, 2024, 2025];
export const minTradeUsd = 1_000_000;
export const seriesStart = 2015;
export const seriesEnd = 2025;

export const extraIndicators = [
  {
    code: "NY.GDP.MKTP.CD",
    label: "PDB",
    unit: "current US$",
    category: "Market context",
    side: "context",
    interpretation: "Size of the economy. Historical scale, not product demand.",
  },
  {
    code: "FP.CPI.TOTL.ZG",
    label: "Inflasi",
    unit: "annual %",
    category: "Market context",
    side: "context",
    interpretation: "Consumer-price context for contracts. Not a commodity quote.",
  },
  {
    code: "PA.NUS.FCRF",
    label: "Nilai tukar resmi",
    unit: "LCU per US$",
    category: "Market context",
    side: "context",
    interpretation: "Official annual average exchange rate. Not a spot market quote.",
  },
  {
    code: "TX.VAL.MRCH.CD.WT",
    label: "Ekspor barang",
    unit: "current US$",
    category: "Market context",
    side: "supply",
    interpretation: "Merchandise export value. Not an order book or available stock.",
  },
  {
    code: "TM.VAL.MRCH.CD.WT",
    label: "Impor barang",
    unit: "current US$",
    category: "Market context",
    side: "demand",
    interpretation: "Merchandise import value. Not a live purchase order.",
  },
  {
    code: "BX.KLT.DINV.CD.WD",
    label: "Arus masuk FDI",
    unit: "current US$",
    category: "Market context",
    side: "context",
    interpretation: "FDI net inflows. Not a project pipeline.",
  },
  {
    code: "NV.AGR.TOTL.ZS",
    label: "Porsi nilai tambah pertanian",
    unit: "% of GDP",
    category: "Food & agriculture",
    side: "context",
    interpretation: "Agriculture share of GDP. Not harvested volume or export supply.",
  },
  {
    code: "AG.PRD.FOOD.XD",
    label: "Indeks produksi pangan",
    unit: "index, 2014-2016 = 100",
    category: "Food & agriculture",
    side: "supply",
    interpretation: "Food production index. Not available inventory.",
  },
  {
    code: "NV.IND.MANF.ZS",
    label: "Porsi nilai tambah manufaktur",
    unit: "% of GDP",
    category: "Apparel & textiles",
    side: "context",
    interpretation: "Manufacturing share of GDP. Apparel is one part of manufacturing.",
  },
  {
    code: "TX.VAL.MANF.ZS.UN",
    label: "Porsi ekspor manufaktur",
    unit: "% of merchandise exports",
    category: "Apparel & textiles",
    side: "supply",
    interpretation: "Manufactures share of merchandise exports. Not factory capacity.",
  },
  {
    code: "BX.TRF.PWKR.CD.DT",
    label: "Remitansi diterima",
    unit: "current US$",
    category: "Workforce",
    side: "context",
    interpretation: "Personal remittances received. Not a count of placed workers.",
  },
  {
    code: "IT.CEL.SETS.P2",
    label: "Langganan seluler",
    unit: "per 100 people",
    category: "Digital access",
    side: "context",
    interpretation: "Mobile subscriptions per 100 people. Not digital-service revenue.",
  },
];

export const tradeProducts = [
  { hs: "0901", name: "Coffee", category: "Food & agriculture", observatoryProduct: "Kopi" },
  { hs: "0902", name: "Tea", category: "Food & agriculture", observatoryProduct: "Teh" },
  { hs: "1001", name: "Wheat and meslin", category: "Food & agriculture", observatoryProduct: "Gandum dan meslin" },
  { hs: "1006", name: "Rice", category: "Food & agriculture", observatoryProduct: "Beras" },
  { hs: "1801", name: "Cocoa beans", category: "Food & agriculture", observatoryProduct: "Biji kakao" },
  { hs: "080131", name: "Cashew nuts, in shell", category: "Food & agriculture", observatoryProduct: "Kacang mete" },
  { hs: "080132", name: "Cashew nuts, shelled", category: "Food & agriculture", observatoryProduct: "Kacang mete" },
  { hs: "1511", name: "Palm oil", category: "Food & agriculture", observatoryProduct: "Palm oil" },
  { hs: "5201", name: "Cotton, not carded or combed", category: "Apparel & textiles", observatoryProduct: "Cotton" },
  { hs: "610910", name: "T-shirts and singlets of cotton", category: "Apparel & textiles", observatoryProduct: "Kaos dan singlet katun" },
];

export const pinkSheetUrl =
  "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx";

export const commoditySeries = [
  {
    column: "Cocoa",
    series: "Cocoa",
    product: "Cocoa beans",
    category: "Food & agriculture",
    observatoryProduct: "Biji kakao",
    unit: "USD per kg",
    detail: "International Cocoa Organization price, nominal US dollars per kilogram.",
  },
  {
    column: "Coffee, Arabica",
    series: "Coffee, Arabica",
    product: "Coffee",
    category: "Food & agriculture",
    observatoryProduct: "Kopi",
    unit: "USD per kg",
    detail: "International Coffee Organization, Arabica.",
  },
  {
    column: "Coffee, Robusta",
    series: "Coffee, Robusta",
    product: "Coffee",
    category: "Food & agriculture",
    observatoryProduct: "Kopi",
    unit: "USD per kg",
    detail: "International Coffee Organization, Robusta.",
  },
  {
    column: "Tea, Mombasa",
    series: "Tea, Mombasa",
    product: "Tea",
    category: "Food & agriculture",
    observatoryProduct: "Teh",
    unit: "USD per kg",
    detail: "Mombasa auction. This is the Kenya tea benchmark in the Pink Sheet.",
  },
  {
    column: "Palm oil",
    series: "Palm oil",
    product: "Palm oil",
    category: "Food & agriculture",
    observatoryProduct: "Palm oil",
    unit: "USD per metric ton",
    detail: "World Bank Pink Sheet palm oil series.",
  },
  {
    column: "Rice, Thai 5%",
    series: "Rice, Thai 5%",
    product: "Rice",
    category: "Food & agriculture",
    observatoryProduct: "Beras",
    unit: "USD per metric ton",
    detail: "Thai rice, 5 percent broken.",
  },
  {
    column: "Rice, Viet Namese 5%",
    series: "Rice, Vietnamese 5%",
    product: "Rice",
    category: "Food & agriculture",
    observatoryProduct: "Beras",
    unit: "USD per metric ton",
    detail: "Vietnamese rice, 5 percent broken.",
  },
  {
    column: "Wheat, US HRW",
    series: "Wheat, US HRW",
    product: "Wheat",
    category: "Food & agriculture",
    observatoryProduct: "Gandum dan meslin",
    unit: "USD per metric ton",
    detail: "US hard red winter wheat.",
  },
  {
    column: "Orange",
    series: "Orange",
    product: "Oranges",
    category: "Food & agriculture",
    observatoryProduct: "Jeruk",
    unit: "USD per kg",
    detail: "World Bank Pink Sheet orange series.",
  },
  {
    column: "Cotton, A Index",
    series: "Cotton, A Index",
    product: "Cotton",
    category: "Apparel & textiles",
    observatoryProduct: "Cotton",
    unit: "USD per kg",
    detail: "Cotton Outlook A Index.",
  },
];

export const schema = `
PRAGMA foreign_keys = ON;

CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  license_url TEXT,
  frequency TEXT,
  updated_at TEXT,
  retrieved_at TEXT,
  note TEXT
);

CREATE TABLE countries (
  iso3 TEXT PRIMARY KEY,
  iso2 TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  capital TEXT,
  income_group TEXT,
  lat REAL,
  lon REAL,
  source_url TEXT
);

CREATE TABLE indicators (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT,
  unit TEXT,
  category TEXT,
  side TEXT,
  frequency TEXT,
  definition TEXT,
  source_organization TEXT,
  source_url TEXT,
  interpretation TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id)
);

CREATE TABLE observations (
  country_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  indicator_code TEXT NOT NULL REFERENCES indicators(code),
  year INTEGER NOT NULL,
  value REAL,
  status TEXT,
  decimal INTEGER,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (country_iso3, indicator_code, year, dataset_id)
);

CREATE TABLE hs_products (
  hs_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  observatory_product TEXT NOT NULL
);

CREATE TABLE trade_flows (
  reporter_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  partner_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  hs_code TEXT NOT NULL REFERENCES hs_products(hs_code),
  year INTEGER NOT NULL,
  flow TEXT NOT NULL,
  trade_value_usd REAL NOT NULL,
  net_weight_kg REAL,
  qty REAL,
  qty_unit_code INTEGER,
  query_key TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (reporter_iso3, partner_iso3, hs_code, year, flow, dataset_id)
);

CREATE TABLE collection_queries (
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  query_key TEXT NOT NULL,
  reporter_iso3 TEXT,
  year INTEGER,
  status TEXT NOT NULL,
  http_status INTEGER,
  row_count INTEGER,
  kept_count INTEGER,
  detail TEXT,
  finished_at TEXT,
  PRIMARY KEY (dataset_id, query_key)
);

CREATE TABLE commodity_series (
  series TEXT PRIMARY KEY,
  product TEXT NOT NULL,
  category TEXT NOT NULL,
  observatory_product TEXT,
  unit TEXT NOT NULL,
  detail TEXT
);

CREATE TABLE commodity_prices (
  series TEXT NOT NULL REFERENCES commodity_series(series),
  period TEXT NOT NULL,
  price REAL NOT NULL,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (series, period, dataset_id)
);

CREATE TABLE market_records (
  id TEXT PRIMARY KEY,
  country TEXT,
  iso2 TEXT,
  region TEXT,
  category TEXT,
  product TEXT,
  side TEXT,
  indicator_type TEXT,
  value REAL,
  unit TEXT,
  period TEXT,
  origin TEXT,
  target TEXT,
  summary TEXT,
  source_url TEXT,
  source TEXT,
  checked_at TEXT,
  hs_code TEXT,
  record_type TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id)
);

CREATE TABLE published_corridors (
  origin TEXT,
  target TEXT,
  product TEXT,
  hs_code TEXT,
  period TEXT,
  value_usd REAL,
  quantity_kg REAL,
  reporter TEXT,
  source_url TEXT
);

CREATE INDEX idx_observations_indicator ON observations(indicator_code, year);
CREATE INDEX idx_observations_country ON observations(country_iso3, indicator_code);
CREATE INDEX idx_trade_hs ON trade_flows(hs_code, year);
CREATE INDEX idx_trade_reporter ON trade_flows(reporter_iso3, year);
CREATE INDEX idx_trade_partner ON trade_flows(partner_iso3, year);
CREATE INDEX idx_prices_series ON commodity_prices(series, period);

CREATE VIEW v_africa_asia_trade AS
SELECT
  t.reporter_iso3,
  r.name AS reporter_name,
  r.region AS reporter_region,
  t.partner_iso3,
  p.name AS partner_name,
  p.region AS partner_region,
  t.hs_code,
  h.name AS product_name,
  h.category,
  h.observatory_product,
  t.year,
  t.flow,
  t.trade_value_usd,
  t.net_weight_kg,
  t.qty,
  t.dataset_id
FROM trade_flows t
JOIN countries r ON r.iso3 = t.reporter_iso3
JOIN countries p ON p.iso3 = t.partner_iso3
JOIN hs_products h ON h.hs_code = t.hs_code
WHERE r.region <> p.region;
`;

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value)}\n`);
  fs.renameSync(temporary, file);
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => value !== ""));
}

export async function fetchText(url, { timeoutMs = 60000 } = {}) {
  const response = await fetch(url, {
    headers: { accept: "application/json,text/csv,text/plain,*/*", "user-agent": "AfriXAsia-Observatory/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  return { status: response.status, text, url };
}
