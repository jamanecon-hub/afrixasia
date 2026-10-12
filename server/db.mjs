import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const dbPath = path.join(root, "data", "observatory.sqlite");

let database = null;
let openedMtime = 0;
let countryCache = null;

const COUNT_TABLES = [
  "countries",
  "indicators",
  "observations",
  "coverage",
  "latest_observations",
  "market_records",
  "providers",
  "headlines",
  "headline_countries",
  "market_news",
  "corridors",
  "regional_evidence",
  "country_briefs",
  "datasets",
  "retrievals",
];

function plain(row) {
  return row ? { ...row } : null;
}

function fail(status, error) {
  return { error, status };
}

function getDb() {
  let stat;
  try {
    stat = fs.statSync(dbPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      const missing = new Error("Observatory database is missing. Run: node server/load-db.mjs");
      missing.code = "DB_MISSING";
      throw missing;
    }
    throw error;
  }
  if (!database || stat.mtimeMs !== openedMtime) {
    if (database) database.close();
    database = new DatabaseSync(dbPath, { readOnly: true });
    openedMtime = stat.mtimeMs;
    countryCache = null;
  }
  return database;
}

function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  return JSON.parse(value);
}

function countries() {
  if (!countryCache) {
    countryCache = getDb()
      .prepare(
        `SELECT iso2, iso3, name, source_name AS sourceName, region, capital,
                income_group AS incomeGroup, lat, lon, source_url AS sourceUrl
         FROM countries
         ORDER BY name`,
      )
      .all()
      .map(plain);
  }
  return countryCache;
}

export function listCountries() {
  return countries();
}

export function findCountry(value) {
  if (!value) return null;
  const needle = String(value).trim().toLowerCase();
  return (
    countries().find((country) =>
      [country.iso2, country.iso3, country.name, country.sourceName].some(
        (item) => item && item.toLowerCase() === needle,
      ),
    ) || null
  );
}

function placeName(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return findCountry(text)?.name || text;
}

function indicatorRow(row) {
  return {
    code: row.code,
    name: row.name,
    label: row.label,
    unit: row.unit,
    category: row.category,
    side: row.side,
    type: row.type,
    frequency: row.frequency,
    definition: row.definition,
    sourceOrganization: row.source_organization,
    sourceId: row.source_id,
    source: row.source,
    sourceUrl: row.source_url,
    licenseUrl: row.license_url,
    interpretation: row.interpretation,
  };
}

export function indicatorSeries({ country, indicator, start, end } = {}) {
  if (!country) return fail(400, "country is required. Use an ISO2, ISO3 or country name.");
  if (!indicator) return fail(400, "indicator is required.");
  const selected = findCountry(country);
  if (!selected) return fail(400, "Unknown country. Use an ISO2, ISO3 or country name.");
  const startYear = start == null || start === "" ? null : Number(start);
  const endYear = end == null || end === "" ? null : Number(end);
  if ((startYear != null && !Number.isInteger(startYear)) || (endYear != null && !Number.isInteger(endYear))) {
    return fail(400, "Invalid year range.");
  }
  if (startYear != null && endYear != null && startYear > endYear) return fail(400, "Invalid year range.");

  const definition = getDb().prepare("SELECT * FROM indicators WHERE code = ?").get(String(indicator));
  if (!definition) return fail(400, `Unknown indicator: ${indicator}`);

  const params = [selected.iso3, definition.code];
  let sql = `SELECT year, value, status, "decimal" AS decimal
             FROM observations
             WHERE country_iso3 = ? AND indicator_code = ?`;
  if (startYear != null) {
    sql += " AND year >= ?";
    params.push(startYear);
  }
  if (endYear != null) {
    sql += " AND year <= ?";
    params.push(endYear);
  }
  sql += " ORDER BY year";
  const points = getDb().prepare(sql).all(...params).map(plain);
  const coverage = getDb()
    .prepare(
      `SELECT observations, first_year AS firstYear, latest_year AS latestYear, status, missing_years
       FROM coverage WHERE country_iso3 = ? AND indicator_code = ?`,
    )
    .get(selected.iso3, definition.code);
  const latest = getDb()
    .prepare(
      `SELECT year, value, status, "decimal" AS decimal, previous_year AS previousYear, previous_value AS previousValue
       FROM latest_observations WHERE country_iso3 = ? AND indicator_code = ?`,
    )
    .get(selected.iso3, definition.code);

  return {
    country: selected,
    indicator: indicatorRow(definition),
    points,
    count: points.length,
    coverage: coverage
      ? {
          observations: coverage.observations,
          firstYear: coverage.firstYear,
          latestYear: coverage.latestYear,
          status: coverage.status,
          missingYears: parseJson(coverage.missing_years, []),
        }
      : null,
    latestReported: plain(latest),
    note: "Reported observations only. Missing years are omitted and are not zero.",
  };
}

function marketRow(row) {
  return {
    id: row.id,
    country: row.country,
    iso2: row.iso2,
    region: row.region,
    category: row.category,
    product: row.product,
    side: row.side,
    indicatorType: row.indicator_type,
    value: row.value,
    unit: row.unit,
    period: row.period,
    origin: row.origin,
    target: row.target,
    summary: row.summary,
    sourceUrl: row.source_url,
    source: row.source,
    checkedAt: row.checked_at,
    hsCode: row.hs_code,
    type: row.type,
    datasetId: row.dataset_id,
    indicatorCode: row.indicator_code,
    evidenceScope: row.evidence_scope,
    license: row.license,
    availabilityStatus: row.availability_status,
    applicationDeadline: row.application_deadline,
    publishedAt: row.published_at,
  };
}

const marketSelect = `SELECT id, country, iso2, region, category, product, side, indicator_type, value, unit,
  period, origin, target, summary, source_url, source, checked_at, hs_code, type, dataset_id,
  indicator_code, evidence_scope, license, availability_status, application_deadline, published_at
  FROM market_records`;

export function marketById(id) {
  if (!id) return null;
  const row = getDb().prepare(`${marketSelect} WHERE id = ?`).get(String(id));
  return row ? marketRow(row) : null;
}

export function searchMarket(query = {}) {
  const country = placeName(query.country);
  const origin = placeName(query.origin);
  const target = placeName(query.target);
  const category = String(query.category || "").trim();
  const side = String(query.side || "").trim();
  const rows = getDb()
    .prepare(
      `${marketSelect}
       WHERE (? = '' OR country = ?)
         AND (? = '' OR category = ?)
         AND (? = '' OR side = ?)
         AND (? = '' OR origin = ?)
         AND (? = '' OR target = ?)
       ORDER BY id`,
    )
    .all(country, country, category, category, side, side, origin, origin, target, target);
  const q = String(query.q || "").trim().toLowerCase();
  const records = (q
    ? rows.filter((row) =>
        [row.country, row.product, row.category, row.summary].join(" ").toLowerCase().includes(q),
      )
    : rows
  ).map(marketRow);
  return {
    total: records.length,
    records,
    note: "Historical market references, not live orders or inventory.",
  };
}

function providerRow(row) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    iso2: row.iso2,
    region: row.region,
    category: row.category,
    description: row.description,
    website: row.website,
    email: row.email,
    verification: row.verification,
    checkedAt: row.checked_at,
    countryCode: row.country_code,
    contact: row.contact,
    sourceRef: row.source_ref,
    status: row.status,
    verifiedAt: row.verified_at,
    availability: row.availability,
    countryMeaning: row.country_meaning,
    sourceUrl: row.source_url,
    sourceRetrieval: row.source_retrieval,
    additionalSourceUrls: parseJson(row.additional_source_urls, null),
  };
}

const providerSelect = `SELECT id, name, country, iso2, region, category, description, website, email,
  verification, checked_at, country_code, contact, source_ref, status, verified_at, availability,
  country_meaning, source_url, source_retrieval, additional_source_urls
  FROM providers`;

export function providerById(id) {
  if (!id) return null;
  const row = getDb().prepare(`${providerSelect} WHERE id = ?`).get(String(id));
  return row ? providerRow(row) : null;
}

export function searchProviders(query = {}) {
  const selected = query.country ? findCountry(query.country) : null;
  const country = selected?.name || String(query.country || "").trim();
  const iso2 = selected?.iso2 || "";
  const category = String(query.category || "").trim();
  const region = String(query.region || "").trim();
  const rows = getDb()
    .prepare(
      `${providerSelect}
       WHERE (? = '' OR country = ? OR (? <> '' AND iso2 = ?))
         AND (? = '' OR category = ?)
         AND (? = '' OR region = ?)
       ORDER BY name`,
    )
    .all(country, country, iso2, iso2, category, category, region, region);
  const q = String(query.q || "").trim().toLowerCase();
  const providers = (q
    ? rows.filter((row) => [row.name, row.description, row.country].join(" ").toLowerCase().includes(q))
    : rows
  ).map(providerRow);
  return {
    total: providers.length,
    providers,
    note: "Public organization references checked against official websites. Not registered members.",
  };
}

function headlineRow(row) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source,
    date: row.published_at,
    region: row.region,
    summary: row.summary,
    provenance: row.provenance,
    countries: parseJson(row.countries_json, []),
    regions: parseJson(row.regions_json, []),
  };
}

export function searchHeadlines(query = {}) {
  const country = placeName(query.country);
  const region = String(query.region || "").trim();
  const rows = getDb()
    .prepare(
      `SELECT id, title, url, source, published_at, region, summary, provenance, countries_json, regions_json
       FROM headlines
       WHERE (? = '' OR region = ?)
         AND (? = '' OR EXISTS (
           SELECT 1 FROM headline_countries hc
           WHERE hc.headline_id = headlines.id AND hc.country = ?
         ))
       ORDER BY id`,
    )
    .all(region, region, country, country);
  const q = String(query.q || "").trim().toLowerCase();
  const headlines = (q
    ? rows.filter((row) => [row.title, row.summary, row.source].join(" ").toLowerCase().includes(q))
    : rows
  ).map(headlineRow);
  return { total: headlines.length, headlines };
}

export function countryBrief(value) {
  const selected = findCountry(value);
  if (!selected) return null;
  const row = getDb().prepare("SELECT * FROM country_briefs WHERE iso3 = ?").get(selected.iso3);
  if (!row) return null;
  return {
    country: row.country,
    iso2: row.iso2,
    iso3: row.iso3,
    region: row.region,
    feedStatus: row.feed_status,
    topics: parseJson(row.topics_json, []),
    baseline: row.baseline,
    note: row.note,
    annualTrends: parseJson(row.annual_trends_json, []),
    headlines: parseJson(row.headlines_json, []),
    sourceUrl: row.source_url,
    referenceVersion: row.reference_version,
  };
}

export function coverageRows({ country, indicator } = {}) {
  const params = [];
  let sql = `SELECT country_iso3 AS country, indicator_code AS indicator, observations,
                    first_year AS firstYear, latest_year AS latestYear, status, missing_years
             FROM coverage WHERE 1 = 1`;
  if (country) {
    const selected = findCountry(country);
    if (!selected) return fail(400, "Unknown country. Use an ISO2, ISO3 or country name.");
    sql += " AND country_iso3 = ?";
    params.push(selected.iso3);
  }
  if (indicator) {
    sql += " AND indicator_code = ?";
    params.push(String(indicator));
  }
  sql += " ORDER BY country_iso3, indicator_code";
  const rows = getDb()
    .prepare(sql)
    .all(...params)
    .map((row) => ({
      country: row.country,
      indicator: row.indicator,
      observations: row.observations,
      firstYear: row.firstYear,
      latestYear: row.latestYear,
      status: row.status,
      missingYears: parseJson(row.missing_years, []),
    }));
  return {
    total: rows.length,
    rows,
    note: "missingYears are source gaps. They are not stored as zero observations.",
  };
}

export function listCorridors() {
  const corridors = getDb()
    .prepare(
      `SELECT id, origin, target, product, hs_code AS hsCode, period, value_usd AS valueUSD,
              quantity_kg AS quantityKg, reporter, source_url AS sourceUrl
       FROM corridors ORDER BY id`,
    )
    .all()
    .map(plain);
  return {
    total: corridors.length,
    corridors,
    note: "Historical corridor references, not live shipments.",
  };
}

export function listRegionalEvidence() {
  const regionalEvidence = getDb()
    .prepare(
      `SELECT id, region, category, metric, value, unit, period, source, source_url AS sourceUrl,
              checked_at AS checkedAt, scope, summary
       FROM regional_evidence ORDER BY id`,
    )
    .all()
    .map(plain);
  return {
    total: regionalEvidence.length,
    regionalEvidence,
    note: "Regional figures are not country measurements.",
  };
}

export function tableCounts() {
  const db = getDb();
  const tables = {};
  for (const name of COUNT_TABLES) {
    tables[name] = db.prepare(`SELECT COUNT(*) AS n FROM ${name}`).get().n;
  }
  return tables;
}

export function summary() {
  const snapshot = plain(
    getDb()
      .prepare(
        `SELECT version, wdi_id AS datasetId, retrieved_at AS retrievedAt, source_updated_at AS sourceUpdatedAt,
                range_from AS rangeFrom, range_to AS rangeTo, observation_count AS observationCount,
                null_source_values AS nullSourceValues, market_as_of AS marketAsOf, brief_date AS briefDate,
                brief_status AS briefStatus, loaded_at AS loadedAt
         FROM snapshot WHERE id = 1`,
      )
      .get(),
  );
  return {
    database: "data/observatory.sqlite",
    ...snapshot,
    tables: tableCounts(),
    members:
      "Circle members stay in data/members.json. POST /api/registration is the only writer, so members are not copied into SQLite.",
    note: "Historical references, not live orders or inventory. Missing indicator years are omitted, not stored as zero.",
  };
}
