import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/observatory.sqlite");
let db;

function database() {
  if (db) return db;
  if (!fs.existsSync(dbPath)) return null;
  db = new DatabaseSync(dbPath, { readOnly: true });
  return db;
}

function parseRows(rows) {
  return rows.map((row) => JSON.parse(row.payload));
}

export function observatoryReady() {
  return Boolean(database());
}

export function observatoryStatus() {
  const handle = database();
  if (!handle) return null;
  const tables = handle
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((table) => ({
      name: table.name,
      rows: handle.prepare(`SELECT COUNT(*) AS n FROM ${table.name}`).get().n,
    }));
  const meta = Object.fromEntries(handle.prepare("SELECT key, value FROM meta").all().map((row) => [row.key, row.value]));
  return {
    engine: "sqlite",
    file: "data/observatory.sqlite",
    builtAt: meta.builtAt || null,
    wdiVersion: meta.wdiVersion || null,
    supplementRetrievedAt: meta.supplementRetrievedAt || null,
    tables,
    access: {
      series: "/api/reference?view=series&country=KEN&indicator=AG.PRD.FOOD.XD",
      market: "/api/market?country=Kenya&category=Food%20%26%20agriculture",
      corridors: "/api/corridors?origin=Kenya&hs=0902",
      sql: "npm run observatory:query -- corridors --origin Kenya",
    },
  };
}

export function document(id) {
  const handle = database();
  if (!handle) return null;
  const row = handle.prepare("SELECT body FROM documents WHERE id = ?").get(id);
  return row ? JSON.parse(row.body) : null;
}

export function selectObservations({ view, countries, indicators, start, end }) {
  const handle = database();
  if (!handle) return null;
  const where = [];
  const params = [];
  if (countries?.length) {
    where.push(`country IN (${countries.map(() => "?").join(",")})`);
    params.push(...countries);
  }
  if (indicators?.length) {
    where.push(`indicator IN (${indicators.map(() => "?").join(",")})`);
    params.push(...indicators);
  }
  if (view === "latest") {
    const sql = `SELECT country, indicator, year, value, status, decimal, previous_year AS previousYear, previous_value AS previousValue
      FROM latest ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY country, indicator`;
    return handle.prepare(sql).all(...params);
  }
  where.push("year >= ?");
  where.push("year <= ?");
  params.push(start, end);
  const sql = `SELECT country, indicator, year, value, status, decimal FROM observations
    WHERE ${where.join(" AND ")} ORDER BY country, indicator, year`;
  return handle.prepare(sql).all(...params);
}

export function selectMarket(query) {
  const handle = database();
  if (!handle) return null;
  if (query.id) {
    const row = handle.prepare("SELECT payload FROM market_records WHERE id = ?").get(query.id);
    return row ? JSON.parse(row.payload) : undefined;
  }
  const where = [];
  const params = [];
  for (const [column, value] of [
    ["country", query.country],
    ["region", query.region],
    ["category", query.category],
    ["side", query.side],
    ["type", query.type],
    ["origin", query.origin],
    ["target", query.target],
  ]) {
    if (!value) continue;
    where.push(`${column} = ?`);
    params.push(value);
  }
  if (query.q) {
    where.push("instr(lower(country || ' ' || product || ' ' || category || ' ' || payload), ?) > 0");
    params.push(String(query.q).toLowerCase());
  }
  const sql = `SELECT payload FROM market_records ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id`;
  return parseRows(handle.prepare(sql).all(...params));
}

export function selectProviders(query) {
  const handle = database();
  if (!handle) return null;
  if (query.id) {
    const row = handle.prepare("SELECT payload FROM providers WHERE id = ?").get(query.id);
    return row ? JSON.parse(row.payload) : undefined;
  }
  const where = [];
  const params = [];
  for (const [column, value] of [
    ["country", query.countryName || ""],
    ["region", query.region],
    ["category", query.category],
  ]) {
    if (!value) continue;
    where.push(`${column} = ?`);
    params.push(value);
  }
  if (query.iso2) {
    where.push("(country = ? OR instr(payload, ?) > 0)");
    params.push(query.countryName || "", `"iso2":"${query.iso2}"`);
  }
  if (query.q) {
    where.push("instr(lower(name || ' ' || country || ' ' || payload), ?) > 0");
    params.push(String(query.q).toLowerCase());
  }
  const sql = `SELECT payload FROM providers ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY name`;
  return parseRows(handle.prepare(sql).all(...params));
}

export function selectCorridors(query) {
  const handle = database();
  if (!handle) return null;
  const where = [];
  const params = [];
  if (query.origin) {
    where.push("(origin = ? OR origin_iso3 = ?)");
    params.push(query.origin, query.origin.toUpperCase());
  }
  if (query.target) {
    where.push("(target = ? OR target_iso3 = ?)");
    params.push(query.target, query.target.toUpperCase());
  }
  if (query.category) {
    where.push("category = ?");
    params.push(query.category);
  }
  if (query.hs || query.hsCode) {
    where.push("hs_code = ?");
    params.push(query.hs || query.hsCode);
  }
  if (query.period) {
    where.push("period = ?");
    params.push(query.period);
  }
  if (query.min) {
    where.push("value_usd >= ?");
    params.push(Number(query.min));
  }
  const sql = `SELECT payload FROM corridors ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY value_usd DESC`;
  return parseRows(handle.prepare(sql).all(...params));
}
