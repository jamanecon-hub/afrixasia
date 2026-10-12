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
  "supplement_indicators",
  "supplement_observations",
  "trade_flows",
  "trade_queries",
  "collection_meta",
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
      const missing = new Error("Observatory database is missing. Run: npm run observatory:build");
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
  if (!definition) return supplementSeries(selected, indicator, startYear, endYear);

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

function supplementSeries(selected, indicator, startYear, endYear) {
  const definition = getDb().prepare("SELECT * FROM supplement_indicators WHERE code = ?").get(String(indicator));
  if (!definition) return fail(400, `Unknown indicator: ${indicator}`);
  const params = [selected.iso3, definition.code];
  let sql = `SELECT year, value, status, "decimal" AS decimal
             FROM supplement_observations
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
  const span = getDb()
    .prepare(
      `SELECT MIN(year) AS firstYear, MAX(year) AS latestYear, COUNT(*) AS observations
       FROM supplement_observations WHERE country_iso3 = ? AND indicator_code = ?`,
    )
    .get(selected.iso3, definition.code);
  const reported = new Set(
    getDb()
      .prepare(
        `SELECT year FROM supplement_observations WHERE country_iso3 = ? AND indicator_code = ?`,
      )
      .all(selected.iso3, definition.code)
      .map((row) => row.year),
  );
  const missingYears = [];
  if (span?.firstYear != null) {
    for (let year = span.firstYear; year <= span.latestYear; year += 1) {
      if (!reported.has(year)) missingYears.push(year);
    }
  }
  const allPoints = getDb()
    .prepare(
      `SELECT year, value FROM supplement_observations
       WHERE country_iso3 = ? AND indicator_code = ? ORDER BY year`,
    )
    .all(selected.iso3, definition.code);
  const latest = allPoints[allPoints.length - 1] || null;
  const previous = allPoints.length > 1 ? allPoints[allPoints.length - 2] : null;
  return {
    country: selected,
    indicator: {
      code: definition.code,
      name: definition.name,
      unit: definition.unit,
      category: definition.category,
      definition: definition.definition,
      source: definition.source,
      sourceUrl: definition.source_url,
      licenseUrl: definition.license_url,
      frequency: definition.frequency,
      dataset: "wdi-supplement",
    },
    points,
    count: points.length,
    coverage: {
      observations: span?.observations || 0,
      firstYear: span?.firstYear ?? null,
      latestYear: span?.latestYear ?? null,
      status: points.length ? "available" : "not_reported",
      missingYears,
    },
    latestReported: latest
      ? {
          year: latest.year,
          value: latest.value,
          previousYear: previous?.year ?? null,
          previousValue: previous?.value ?? null,
        }
      : null,
    note: "Collected WDI values. A missing year is omitted and is not zero. These series sit beside the published 17-indicator snapshot.",
  };
}

export function searchTrade(query = {}) {
  const origin = query.origin ? findCountry(query.origin) : null;
  if (query.origin && !origin) return fail(400, "Unknown origin. Use an ISO2, ISO3 or country name.");
  const target = query.target ? findCountry(query.target) : null;
  if (query.target && !target) return fail(400, "Unknown target. Use an ISO2, ISO3 or country name.");
  const year = query.year == null || query.year === "" ? null : Number(query.year);
  if (year != null && !Number.isInteger(year)) return fail(400, "Invalid year.");
  const min = query.min == null || query.min === "" ? null : Number(query.min);
  if (min != null && !Number.isFinite(min)) return fail(400, "Invalid min.");
  const limit = Math.min(5000, Math.max(1, Number(query.limit || 100)));
  if (!Number.isInteger(limit)) return fail(400, "Invalid limit.");
  const hs = String(query.hs || query.hsCode || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const clauses = [];
  const params = [];
  if (origin) {
    clauses.push("reporter_iso3 = ?");
    params.push(origin.iso3);
  }
  if (target) {
    clauses.push("partner_iso3 = ?");
    params.push(target.iso3);
  }
  if (year != null) {
    clauses.push("year = ?");
    params.push(year);
  }
  if (hs.length) {
    clauses.push(`hs_code IN (${hs.map(() => "?").join(", ")})`);
    params.push(...hs);
  }
  if (query.category) {
    clauses.push("category = ?");
    params.push(String(query.category));
  }
  if (min != null) {
    clauses.push("value_usd >= ?");
    params.push(min);
  }
  if (query.q) {
    clauses.push("(product LIKE ? OR origin LIKE ? OR target LIKE ? OR hs_code LIKE ?)");
    const like = `%${String(query.q)}%`;
    params.push(like, like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = getDb().prepare(`SELECT COUNT(*) AS n FROM trade_flows ${where}`).get(...params).n;
  const flows = getDb()
    .prepare(
      `SELECT year, hs_code AS hsCode, product, category, reporter_iso3 AS reporterIso3,
              partner_iso3 AS partnerIso3, origin, target, origin_region AS originRegion,
              target_region AS targetRegion, flow, value_usd AS valueUsd, quantity_kg AS quantityKg,
              classification_code AS classificationCode, source, source_url AS sourceUrl, retrieved_at AS retrievedAt
       FROM trade_flows ${where}
       ORDER BY value_usd DESC, year DESC, hs_code, origin, target
       LIMIT ?`,
    )
    .all(...params, limit)
    .map(plain);
  return {
    total,
    limit,
    flows,
    note: "Bilateral goods exports from the UN Comtrade public preview. Values under USD 1 million are omitted. A missing origin–target–product row is not zero trade.",
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
  const metaRows = getDb().prepare("SELECT * FROM collection_meta").all();
  const meta = Object.fromEntries(metaRows.map((row) => [row.id, plain(row)]));
  const quietReporters = getDb()
    .prepare(
      `SELECT reporter_iso3 AS reporterIso3
       FROM trade_queries
       GROUP BY reporter_iso3
       HAVING SUM(kept_count) = 0
       ORDER BY reporter_iso3`,
    )
    .all()
    .map((row) => row.reporterIso3);
  return {
    database: "data/observatory.sqlite",
    ...snapshot,
    tables: tableCounts(),
    collection: meta,
    tradeQueries: getDb().prepare("SELECT COUNT(*) AS n FROM trade_queries").get().n,
    reportersWithoutTradeRows: quietReporters,
    members:
      "Circle members stay in data/members.json. POST /api/registration is the only writer, so members are not copied into SQLite.",
    note: "Historical references, not live orders or inventory. Missing indicator years and missing trade pairs are omitted, not stored as zero. Trade rows under USD 1 million are omitted.",
  };
}
