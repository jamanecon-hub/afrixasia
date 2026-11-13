import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const OBSERVATORY_DB_PATH = process.env.OBSERVATORY_DB
  ? path.resolve(process.env.OBSERVATORY_DB)
  : path.join(root, "data", "observatory.sqlite");

export const SOURCE_ID = "un-comtrade-preview";

export const PRODUCTS = [
  {
    hsCode: "03",
    name: "Fish and crustaceans",
    category: "Food & agriculture",
    parentHs: null,
    level: "chapter",
    note: "HS chapter covering fishery products in the observatory. A chapter total is not a species-level supply figure.",
  },
  {
    hsCode: "070200",
    name: "Tomatoes, fresh or chilled",
    category: "Food & agriculture",
    parentHs: null,
    level: "subheading",
    note: "Matches the curated fresh-tomato reference. Not available stock.",
  },
  {
    hsCode: "080131",
    name: "Cashew nuts, in shell",
    category: "Food & agriculture",
    parentHs: null,
    level: "subheading",
    note: "Current HS line for in-shell cashews. The curated observatory reference cites 080130, which the Comtrade preview does not return. Shelled cashews (080132) are not included.",
  },
  {
    hsCode: "080510",
    name: "Oranges",
    category: "Food & agriculture",
    parentHs: null,
    level: "subheading",
    note: "Matches the curated orange reference.",
  },
  {
    hsCode: "0901",
    name: "Coffee",
    category: "Food & agriculture",
    parentHs: null,
    level: "heading",
    note: "HS heading for coffee, whether or not roasted.",
  },
  {
    hsCode: "0902",
    name: "Tea",
    category: "Food & agriculture",
    parentHs: null,
    level: "heading",
    note: "HS heading for tea. Matches the curated Kenya tea corridor.",
  },
  {
    hsCode: "1001",
    name: "Wheat and meslin",
    category: "Food & agriculture",
    parentHs: null,
    level: "heading",
    note: "Matches the curated wheat and meslin reference.",
  },
  {
    hsCode: "1006",
    name: "Rice",
    category: "Food & agriculture",
    parentHs: null,
    level: "heading",
    note: "HS heading for rice. Matches the curated rice corridors.",
  },
  {
    hsCode: "180100",
    name: "Cocoa beans",
    category: "Food & agriculture",
    parentHs: null,
    level: "subheading",
    note: "Whole or broken cocoa beans, raw or roasted. Not cocoa paste, butter, or chocolate.",
  },
  {
    hsCode: "61",
    name: "Apparel, knitted or crocheted",
    category: "Apparel & textiles",
    parentHs: null,
    level: "chapter",
    note: "HS chapter total. Includes t-shirts under 610910. Do not add the t-shirt line to this chapter.",
  },
  {
    hsCode: "610910",
    name: "T-shirts and singlets of cotton, knitted",
    category: "Apparel & textiles",
    parentHs: "61",
    level: "subheading",
    note: "Subset of HS chapter 61. Already inside the chapter total when both rows exist.",
  },
  {
    hsCode: "62",
    name: "Apparel, not knitted or crocheted",
    category: "Apparel & textiles",
    parentHs: null,
    level: "chapter",
    note: "HS chapter total for woven apparel. Not additive with chapter 61.",
  },
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  publisher TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  license TEXT NOT NULL,
  license_url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  note TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS economies (
  iso3 TEXT PRIMARY KEY,
  iso2 TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  comtrade_code INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  hs_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  parent_hs TEXT,
  level TEXT NOT NULL,
  note TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS trade_flows (
  reporter_iso3 TEXT NOT NULL,
  partner_iso3 TEXT NOT NULL,
  flow TEXT NOT NULL,
  hs_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  value_usd REAL NOT NULL,
  quantity REAL,
  quantity_unit_code INTEGER,
  quantity_unit TEXT,
  net_weight_kg REAL,
  estimation_flag INTEGER NOT NULL,
  source_id TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  PRIMARY KEY (reporter_iso3, partner_iso3, flow, hs_code, year)
);
CREATE TABLE IF NOT EXISTS fetches (
  query_key TEXT PRIMARY KEY,
  retrieved_at TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS trade_partner_year ON trade_flows (partner_iso3, year);
CREATE INDEX IF NOT EXISTS trade_hs_year ON trade_flows (hs_code, year);
CREATE INDEX IF NOT EXISTS trade_flow_year ON trade_flows (flow, year);
`;

export function openObservatory({ readOnly = false } = {}) {
  if (readOnly && !fs.existsSync(OBSERVATORY_DB_PATH)) return null;
  if (!readOnly) fs.mkdirSync(path.dirname(OBSERVATORY_DB_PATH), { recursive: true });
  const db = new DatabaseSync(OBSERVATORY_DB_PATH, { readOnly, timeout: 10000 });
  if (!readOnly) {
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}

export function ensureSchema(db) {
  db.exec(SCHEMA);
  const insert = db.prepare(`
    INSERT INTO products (hs_code, name, category, parent_hs, level, note)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(hs_code) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      parent_hs = excluded.parent_hs,
      level = excluded.level,
      note = excluded.note
  `);
  for (const product of PRODUCTS) {
    insert.run(product.hsCode, product.name, product.category, product.parentHs, product.level, product.note);
  }
  db.prepare(`DELETE FROM products WHERE hs_code NOT IN (${PRODUCTS.map(() => "?").join(",")})`).run(
    ...PRODUCTS.map((product) => product.hsCode),
  );
}

function metaMap(db) {
  return Object.fromEntries(db.prepare("SELECT key, value FROM meta").all().map((row) => [row.key, row.value]));
}

export function observatoryStatus(db) {
  const meta = metaMap(db);
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM trade_flows) AS flows,
      (SELECT COUNT(DISTINCT reporter_iso3) FROM trade_flows) AS reporters,
      (SELECT COUNT(DISTINCT partner_iso3) FROM trade_flows) AS partners,
      (SELECT COUNT(*) FROM fetches WHERE status = 'ok') AS fetchesOk,
      (SELECT COUNT(*) FROM fetches WHERE status = 'error') AS fetchesError
  `).get();
  const years = db.prepare("SELECT DISTINCT year FROM trade_flows ORDER BY year").all().map((row) => row.year);
  return {
    id: "afrixasia-observatory-trade",
    engine: "sqlite",
    file: "data/observatory.sqlite",
    retrievedAt: meta.retrieved_at || null,
    years,
    counts,
    source: db.prepare("SELECT * FROM sources WHERE id = ?").get(SOURCE_ID) || null,
    products: db.prepare(`
      SELECT hs_code AS hsCode, name, category, parent_hs AS parentHs, level, note
      FROM products ORDER BY category, hs_code
    `).all(),
    economies: db.prepare("SELECT COUNT(*) AS total FROM economies").get().total,
    limits: [
      "A missing reporter–partner–product–year was not in the extract. It is not zero trade.",
      "Export and import rows are different reporters' statements. Do not add them as one shipment.",
      "HS 610910 is inside chapter 61. Chapter totals are not additive with their lines, or with each other.",
      "Figures are historical statistical extracts, not orders, prices, or available inventory.",
      "The USD figure is the reported trade value. Quantity or weight flagged as estimated is omitted, not shown as a measurement.",
    ],
    tradeApi: "/api/observatory/trade",
  };
}

function clause(filters, sqlParts, params) {
  if (filters.reporterIso3) {
    sqlParts.push("t.reporter_iso3 = ?");
    params.push(filters.reporterIso3);
  }
  if (filters.partnerIso3) {
    sqlParts.push("t.partner_iso3 = ?");
    params.push(filters.partnerIso3);
  }
  if (filters.flow) {
    sqlParts.push("t.flow = ?");
    params.push(filters.flow);
  }
  if (filters.year) {
    sqlParts.push("t.year = ?");
    params.push(filters.year);
  }
  if (filters.category) {
    sqlParts.push("p.category = ?");
    params.push(filters.category);
  }
  if (filters.hsCodes?.length) {
    sqlParts.push(`t.hs_code IN (${filters.hsCodes.map(() => "?").join(",")})`);
    params.push(...filters.hsCodes);
  }
  if (filters.originIso3 || filters.targetIso3) {
    sqlParts.push(`(
      (t.flow = 'export' AND (? IS NULL OR t.reporter_iso3 = ?) AND (? IS NULL OR t.partner_iso3 = ?))
      OR
      (t.flow = 'import' AND (? IS NULL OR t.partner_iso3 = ?) AND (? IS NULL OR t.reporter_iso3 = ?))
    )`);
    const origin = filters.originIso3 || null;
    const target = filters.targetIso3 || null;
    params.push(origin, origin, target, target, origin, origin, target, target);
  }
}

const TRADE_SELECT = `
  SELECT
    t.reporter_iso3 AS reporterIso3,
    er.name AS reporter,
    er.iso2 AS reporterIso2,
    er.region AS reporterRegion,
    t.partner_iso3 AS partnerIso3,
    ep.name AS partner,
    ep.iso2 AS partnerIso2,
    ep.region AS partnerRegion,
    t.flow,
    t.hs_code AS hsCode,
    p.name AS product,
    p.category,
    p.parent_hs AS parentHs,
    p.level,
    t.year,
    t.value_usd AS valueUsd,
    t.quantity,
    t.quantity_unit_code AS quantityUnitCode,
    t.quantity_unit AS quantityUnit,
    t.net_weight_kg AS netWeightKg,
    t.estimation_flag AS estimationFlag,
    'reported' AS status,
    CASE
      WHEN t.quantity IS NOT NULL THEN 'reported'
      WHEN t.estimation_flag IN (2, 6) THEN 'estimated_omitted'
      ELSE 'not_reported'
    END AS quantityStatus,
    CASE
      WHEN t.net_weight_kg IS NOT NULL THEN 'reported'
      WHEN t.estimation_flag IN (4, 6) THEN 'estimated_omitted'
      ELSE 'not_reported'
    END AS weightStatus,
    t.retrieved_at AS retrievedAt,
    'United Nations Comtrade' AS source,
    'https://comtradeplus.un.org/' AS sourceUrl
  FROM trade_flows t
  JOIN economies er ON er.iso3 = t.reporter_iso3
  JOIN economies ep ON ep.iso3 = t.partner_iso3
  JOIN products p ON p.hs_code = t.hs_code
`;

export function queryTrade(db, filters) {
  const where = [];
  const params = [];
  clause(filters, where, params);
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = db.prepare(`
    SELECT COUNT(*) AS total
    FROM trade_flows t
    JOIN products p ON p.hs_code = t.hs_code
    ${sqlWhere}
  `).get(...params).total;
  const page = filters.page;
  const perPage = filters.perPage;
  const rows = db.prepare(`
    ${TRADE_SELECT}
    ${sqlWhere}
    ORDER BY t.year DESC, t.value_usd DESC, t.reporter_iso3, t.partner_iso3, t.hs_code
    LIMIT ? OFFSET ?
  `).all(...params, perPage, (page - 1) * perPage);
  return { total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)), rows };
}

export function knownHs(db, code) {
  return db.prepare("SELECT hs_code FROM products WHERE hs_code = ?").get(code) || null;
}

export function knownCategory(db, category) {
  return db.prepare("SELECT 1 AS ok FROM products WHERE category = ? LIMIT 1").get(category) || null;
}
