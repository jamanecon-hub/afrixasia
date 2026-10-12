import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import observations from "../data/observations.json" with { type: "json" };
import brief from "../data/brief.json" with { type: "json" };
import catalog from "../data/catalog.json" with { type: "json" };
import { market, wdi } from "../shared/reference.mjs";
import { dbPath } from "./db.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function emptyToNull(value) {
  return value === undefined ? null : value;
}

function jsonOrNull(value) {
  return value == null ? null : JSON.stringify(value);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const schema = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = DELETE;

CREATE TABLE snapshot (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  wdi_id TEXT NOT NULL,
  version TEXT NOT NULL,
  retrieved_at TEXT,
  source_updated_at TEXT,
  range_from INTEGER,
  range_to INTEGER,
  observation_count INTEGER NOT NULL,
  null_source_values INTEGER NOT NULL,
  license TEXT,
  license_url TEXT,
  geography_note TEXT,
  checksum TEXT,
  citation TEXT,
  market_as_of TEXT,
  reference_version TEXT,
  brief_date TEXT,
  brief_updated_at TEXT,
  brief_status TEXT,
  brief_method TEXT,
  brief_note_method TEXT,
  rss_headline_count INTEGER,
  source_failures INTEGER,
  successful_feeds INTEGER,
  total_feeds INTEGER,
  scanned_country_count INTEGER,
  loaded_at TEXT NOT NULL
) STRICT;

CREATE TABLE countries (
  iso3 TEXT PRIMARY KEY,
  iso2 TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  source_name TEXT,
  region TEXT,
  capital TEXT,
  income_group TEXT,
  lat REAL,
  lon REAL,
  source_url TEXT
) STRICT;

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
  interpretation TEXT
) STRICT;

-- Reported values only. Source gaps are not inserted and are not stored as zero.
CREATE TABLE observations (
  country_iso3 TEXT NOT NULL,
  indicator_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  value REAL,
  status TEXT,
  "decimal" INTEGER,
  PRIMARY KEY (country_iso3, indicator_code, year),
  FOREIGN KEY (country_iso3) REFERENCES countries(iso3),
  FOREIGN KEY (indicator_code) REFERENCES indicators(code)
) STRICT;

CREATE INDEX idx_observations_country_indicator ON observations (country_iso3, indicator_code);
CREATE INDEX idx_observations_indicator_year ON observations (indicator_code, year);

CREATE TABLE coverage (
  country_iso3 TEXT NOT NULL,
  indicator_code TEXT NOT NULL,
  observations INTEGER NOT NULL,
  first_year INTEGER,
  latest_year INTEGER,
  status TEXT NOT NULL,
  missing_years TEXT NOT NULL,
  PRIMARY KEY (country_iso3, indicator_code),
  FOREIGN KEY (country_iso3) REFERENCES countries(iso3),
  FOREIGN KEY (indicator_code) REFERENCES indicators(code)
) STRICT;

CREATE TABLE latest_observations (
  country_iso3 TEXT NOT NULL,
  indicator_code TEXT NOT NULL,
  year INTEGER,
  value REAL,
  status TEXT,
  "decimal" INTEGER,
  previous_year INTEGER,
  previous_value REAL,
  PRIMARY KEY (country_iso3, indicator_code),
  FOREIGN KEY (country_iso3) REFERENCES countries(iso3),
  FOREIGN KEY (indicator_code) REFERENCES indicators(code)
) STRICT;

CREATE TABLE market_records (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
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
  type TEXT,
  dataset_id TEXT,
  indicator_code TEXT,
  evidence_scope TEXT,
  license TEXT,
  availability_status TEXT,
  application_deadline TEXT,
  published_at TEXT,
  FOREIGN KEY (iso2) REFERENCES countries(iso2)
) STRICT;

CREATE INDEX idx_market_country ON market_records (country);
CREATE INDEX idx_market_category_side ON market_records (category, side);
CREATE INDEX idx_market_origin ON market_records (origin);
CREATE INDEX idx_market_target ON market_records (target);

CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  iso2 TEXT,
  region TEXT,
  category TEXT,
  description TEXT,
  website TEXT,
  email TEXT,
  verification TEXT,
  checked_at TEXT,
  country_code TEXT,
  contact TEXT,
  source_ref TEXT,
  status TEXT,
  verified_at TEXT,
  availability TEXT,
  country_meaning TEXT,
  source_url TEXT,
  source_retrieval TEXT,
  additional_source_urls TEXT,
  FOREIGN KEY (iso2) REFERENCES countries(iso2)
) STRICT;

CREATE INDEX idx_providers_country ON providers (country);
CREATE INDEX idx_providers_category ON providers (category);

CREATE TABLE headlines (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  source TEXT,
  published_at TEXT,
  region TEXT,
  summary TEXT,
  provenance TEXT,
  countries_json TEXT,
  regions_json TEXT
) STRICT;

CREATE INDEX idx_headlines_region ON headlines (region);

CREATE TABLE headline_countries (
  headline_id INTEGER NOT NULL,
  country TEXT NOT NULL,
  PRIMARY KEY (headline_id, country),
  FOREIGN KEY (headline_id) REFERENCES headlines(id)
) STRICT;

CREATE INDEX idx_headline_countries_country ON headline_countries (country);

CREATE TABLE market_news (
  id TEXT PRIMARY KEY,
  date TEXT,
  country TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  url TEXT,
  countries_json TEXT,
  region TEXT,
  source_ref TEXT,
  implication TEXT
) STRICT;

CREATE TABLE corridors (
  id INTEGER PRIMARY KEY,
  origin TEXT NOT NULL,
  target TEXT NOT NULL,
  product TEXT,
  hs_code TEXT,
  period TEXT,
  value_usd REAL,
  quantity_kg REAL,
  reporter TEXT,
  source_url TEXT
) STRICT;

CREATE TABLE regional_evidence (
  id INTEGER PRIMARY KEY,
  region TEXT NOT NULL,
  category TEXT,
  metric TEXT,
  value REAL,
  unit TEXT,
  period TEXT,
  source TEXT,
  source_url TEXT,
  checked_at TEXT,
  scope TEXT,
  summary TEXT
) STRICT;

CREATE TABLE country_briefs (
  iso3 TEXT PRIMARY KEY,
  iso2 TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  feed_status TEXT,
  topics_json TEXT,
  baseline TEXT,
  note TEXT,
  annual_trends_json TEXT,
  headlines_json TEXT,
  source_url TEXT,
  reference_version TEXT,
  FOREIGN KEY (iso3) REFERENCES countries(iso3)
) STRICT;

CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  source TEXT,
  source_updated_at TEXT,
  license TEXT,
  license_url TEXT,
  frequency TEXT,
  api TEXT,
  csv TEXT,
  metadata TEXT,
  checksum TEXT
) STRICT;

CREATE TABLE retrievals (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  total INTEGER,
  last_updated TEXT
) STRICT;
`;

function replaceDatabase() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const file = `${dbPath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  const db = new DatabaseSync(dbPath);
  db.exec(schema);

  const insertCountry = db.prepare(`
    INSERT INTO countries (
      iso3, iso2, name, source_name, region, capital, income_group, lat, lon, source_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertIndicator = db.prepare(`
    INSERT INTO indicators (
      code, name, label, unit, category, side, type, frequency, definition,
      source_organization, source_id, source, source_url, license_url, interpretation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertObservation = db.prepare(`
    INSERT INTO observations (country_iso3, indicator_code, year, value, status, "decimal")
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertCoverage = db.prepare(`
    INSERT INTO coverage (
      country_iso3, indicator_code, observations, first_year, latest_year, status, missing_years
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLatest = db.prepare(`
    INSERT INTO latest_observations (
      country_iso3, indicator_code, year, value, status, "decimal", previous_year, previous_value
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMarket = db.prepare(`
    INSERT INTO market_records (
      id, country, iso2, region, category, product, side, indicator_type, value, unit, period,
      origin, target, summary, source_url, source, checked_at, hs_code, type, dataset_id,
      indicator_code, evidence_scope, license, availability_status, application_deadline, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertProvider = db.prepare(`
    INSERT INTO providers (
      id, name, country, iso2, region, category, description, website, email, verification,
      checked_at, country_code, contact, source_ref, status, verified_at, availability,
      country_meaning, source_url, source_retrieval, additional_source_urls
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertHeadline = db.prepare(`
    INSERT INTO headlines (
      id, title, url, source, published_at, region, summary, provenance, countries_json, regions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertHeadlineCountry = db.prepare(`
    INSERT INTO headline_countries (headline_id, country) VALUES (?, ?)
  `);
  const insertNews = db.prepare(`
    INSERT INTO market_news (
      id, date, country, title, summary, source, url, countries_json, region, source_ref, implication
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCorridor = db.prepare(`
    INSERT INTO corridors (
      id, origin, target, product, hs_code, period, value_usd, quantity_kg, reporter, source_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRegional = db.prepare(`
    INSERT INTO regional_evidence (
      id, region, category, metric, value, unit, period, source, source_url, checked_at, scope, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertBrief = db.prepare(`
    INSERT INTO country_briefs (
      iso3, iso2, country, region, feed_status, topics_json, baseline, note,
      annual_trends_json, headlines_json, source_url, reference_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDataset = db.prepare(`
    INSERT INTO datasets (
      id, title, description, source, source_updated_at, license, license_url, frequency, api, csv, metadata, checksum
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRetrieval = db.prepare(`
    INSERT INTO retrievals (id, url, total, last_updated) VALUES (?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    for (const country of wdi.countries) {
      insertCountry.run(
        country.iso3,
        country.iso2,
        country.name,
        emptyToNull(country.sourceName),
        emptyToNull(country.region),
        emptyToNull(country.capital),
        emptyToNull(country.incomeGroup),
        emptyToNull(country.lat),
        emptyToNull(country.lon),
        emptyToNull(country.sourceUrl),
      );
    }
    for (const indicator of wdi.indicators) {
      insertIndicator.run(
        indicator.code,
        indicator.name,
        emptyToNull(indicator.label),
        emptyToNull(indicator.unit),
        emptyToNull(indicator.category),
        emptyToNull(indicator.side),
        emptyToNull(indicator.type),
        emptyToNull(indicator.frequency),
        emptyToNull(indicator.definition),
        emptyToNull(indicator.sourceOrganization),
        emptyToNull(indicator.sourceId),
        emptyToNull(indicator.source),
        emptyToNull(indicator.sourceUrl),
        emptyToNull(indicator.licenseUrl),
        emptyToNull(indicator.interpretation),
      );
    }
    for (const row of observations) {
      insertObservation.run(
        row.country,
        row.indicator,
        row.year,
        emptyToNull(row.value),
        emptyToNull(row.status),
        emptyToNull(row.decimal),
      );
    }
    for (const row of wdi.coverage) {
      insertCoverage.run(
        row.country,
        row.indicator,
        row.observations,
        emptyToNull(row.firstYear),
        emptyToNull(row.latestYear),
        row.status,
        JSON.stringify(row.missingYears ?? []),
      );
    }
    for (const row of wdi.latest) {
      insertLatest.run(
        row.country,
        row.indicator,
        emptyToNull(row.year),
        emptyToNull(row.value),
        emptyToNull(row.status),
        emptyToNull(row.decimal),
        emptyToNull(row.previousYear),
        emptyToNull(row.previousValue),
      );
    }
    for (const row of market.records) {
      insertMarket.run(
        row.id,
        row.country,
        emptyToNull(row.iso2),
        emptyToNull(row.region),
        emptyToNull(row.category),
        emptyToNull(row.product),
        emptyToNull(row.side),
        emptyToNull(row.indicatorType),
        emptyToNull(row.value),
        emptyToNull(row.unit),
        emptyToNull(row.period),
        emptyToNull(row.origin),
        emptyToNull(row.target),
        emptyToNull(row.summary),
        emptyToNull(row.sourceUrl),
        emptyToNull(row.source),
        emptyToNull(row.checkedAt),
        emptyToNull(row.hsCode),
        emptyToNull(row.type),
        emptyToNull(row.datasetId),
        emptyToNull(row.indicatorCode),
        emptyToNull(row.evidenceScope),
        emptyToNull(row.license),
        emptyToNull(row.availabilityStatus),
        emptyToNull(row.applicationDeadline),
        emptyToNull(row.publishedAt),
      );
    }
    for (const row of market.providers) {
      insertProvider.run(
        row.id,
        row.name,
        emptyToNull(row.country),
        emptyToNull(row.iso2),
        emptyToNull(row.region),
        emptyToNull(row.category),
        emptyToNull(row.description),
        emptyToNull(row.website),
        emptyToNull(row.email),
        emptyToNull(row.verification),
        emptyToNull(row.checkedAt),
        emptyToNull(row.countryCode),
        emptyToNull(row.contact),
        emptyToNull(row.sourceRef),
        emptyToNull(row.status),
        emptyToNull(row.verifiedAt),
        emptyToNull(row.availability),
        emptyToNull(row.countryMeaning),
        emptyToNull(row.sourceUrl),
        emptyToNull(row.sourceRetrieval),
        jsonOrNull(row.additionalSourceUrls),
      );
    }
    brief.news.forEach((row, index) => {
      const id = index + 1;
      insertHeadline.run(
        id,
        row.title,
        emptyToNull(row.url),
        emptyToNull(row.source),
        emptyToNull(row.date),
        emptyToNull(row.region),
        emptyToNull(row.summary),
        emptyToNull(row.provenance),
        jsonOrNull(row.countries),
        jsonOrNull(row.regions),
      );
      for (const country of new Set(row.countries || [])) insertHeadlineCountry.run(id, country);
    });
    market.news.forEach((row, index) => {
      insertNews.run(
        row.id || `market-news-${index + 1}`,
        emptyToNull(row.date),
        emptyToNull(row.country),
        row.title,
        emptyToNull(row.summary),
        emptyToNull(row.source),
        emptyToNull(row.url),
        jsonOrNull(row.countries),
        emptyToNull(row.region),
        emptyToNull(row.sourceRef),
        emptyToNull(row.implication),
      );
    });
    market.corridors.forEach((row, index) => {
      insertCorridor.run(
        index + 1,
        row.origin,
        row.target,
        emptyToNull(row.product),
        emptyToNull(row.hsCode),
        emptyToNull(row.period),
        emptyToNull(row.valueUSD),
        emptyToNull(row.quantityKg),
        emptyToNull(row.reporter),
        emptyToNull(row.sourceUrl),
      );
    });
    market.regionalEvidence.forEach((row, index) => {
      insertRegional.run(
        index + 1,
        row.region,
        emptyToNull(row.category),
        emptyToNull(row.metric),
        emptyToNull(row.value),
        emptyToNull(row.unit),
        emptyToNull(row.period),
        emptyToNull(row.source),
        emptyToNull(row.sourceUrl),
        emptyToNull(row.checkedAt),
        emptyToNull(row.scope),
        emptyToNull(row.summary),
      );
    });
    for (const row of brief.notes) {
      insertBrief.run(
        row.iso3,
        row.iso2,
        row.country,
        emptyToNull(row.region),
        emptyToNull(row.feedStatus),
        jsonOrNull(row.topics),
        emptyToNull(row.baseline),
        emptyToNull(row.note),
        jsonOrNull(row.annualTrends),
        jsonOrNull(row.headlines),
        emptyToNull(row.sourceUrl),
        emptyToNull(row.referenceVersion),
      );
    }
    for (const row of catalog.datasets) {
      insertDataset.run(
        row.id,
        emptyToNull(row.title),
        emptyToNull(row.description),
        emptyToNull(row.source),
        emptyToNull(row.sourceUpdatedAt),
        emptyToNull(row.license),
        emptyToNull(row.licenseUrl),
        emptyToNull(row.frequency),
        emptyToNull(row.api),
        emptyToNull(row.csv),
        emptyToNull(row.metadata),
        emptyToNull(row.checksum),
      );
    }
    wdi.retrievals.forEach((row, index) => {
      insertRetrieval.run(index + 1, row.url, emptyToNull(row.total), emptyToNull(row.lastUpdated));
    });
    db.prepare(`
      INSERT INTO snapshot (
        id, wdi_id, version, retrieved_at, source_updated_at, range_from, range_to,
        observation_count, null_source_values, license, license_url, geography_note, checksum,
        citation, market_as_of, reference_version, brief_date, brief_updated_at, brief_status,
        brief_method, brief_note_method, rss_headline_count, source_failures, successful_feeds,
        total_feeds, scanned_country_count, loaded_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      wdi.id,
      wdi.version,
      emptyToNull(wdi.retrievedAt),
      emptyToNull(wdi.sourceUpdatedAt),
      emptyToNull(wdi.range?.from),
      emptyToNull(wdi.range?.to),
      wdi.observationCount,
      wdi.nullSourceValues,
      emptyToNull(wdi.license),
      emptyToNull(wdi.licenseUrl),
      emptyToNull(wdi.geographyNote),
      emptyToNull(wdi.checksum),
      emptyToNull(catalog.citation),
      emptyToNull(market.asOf),
      emptyToNull(market.referenceVersion),
      emptyToNull(brief.date),
      emptyToNull(brief.updatedAt),
      emptyToNull(brief.status),
      emptyToNull(brief.method),
      emptyToNull(brief.noteMethod),
      emptyToNull(brief.rssHeadlineCount),
      emptyToNull(brief.sourceFailures),
      emptyToNull(brief.successfulFeeds),
      emptyToNull(brief.totalFeeds),
      emptyToNull(brief.scannedCountryCount),
      new Date().toISOString(),
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    db.close();
    throw error;
  }

  const count = (table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
  const counts = {
    countries: count("countries"),
    indicators: count("indicators"),
    observations: count("observations"),
    coverage: count("coverage"),
    latest_observations: count("latest_observations"),
    market_records: count("market_records"),
    providers: count("providers"),
    headlines: count("headlines"),
    headline_countries: count("headline_countries"),
    market_news: count("market_news"),
    corridors: count("corridors"),
    regional_evidence: count("regional_evidence"),
    country_briefs: count("country_briefs"),
    datasets: count("datasets"),
    retrievals: count("retrievals"),
  };
  assertEqual("countries", counts.countries, wdi.countries.length);
  assertEqual("indicators", counts.indicators, wdi.indicators.length);
  assertEqual("observations", counts.observations, observations.length);
  assertEqual("observationCount", counts.observations, wdi.observationCount);
  assertEqual("market_records", counts.market_records, market.records.length);
  assertEqual("providers", counts.providers, market.providers.length);
  assertEqual("headlines", counts.headlines, brief.news.length);
  assertEqual("coverage", counts.coverage, wdi.coverage.length);
  assertEqual("latest", counts.latest_observations, wdi.latest.length);
  assertEqual("country_briefs", counts.country_briefs, brief.notes.length);
  assertEqual("corridors", counts.corridors, market.corridors.length);
  assertEqual("regional_evidence", counts.regional_evidence, market.regionalEvidence.length);
  assertEqual("market_news", counts.market_news, market.news.length);

  const nullValues = db.prepare("SELECT COUNT(*) AS n FROM observations WHERE value IS NULL").get().n;
  const sourceNulls = observations.filter((row) => row.value == null).length;
  assertEqual("null observation values", nullValues, sourceNulls);

  const missingSlots = db
    .prepare("SELECT missing_years FROM coverage")
    .all()
    .reduce((sum, row) => sum + JSON.parse(row.missing_years).length, 0);
  assertEqual("missing year slots", missingSlots, wdi.nullSourceValues);

  const sample = db
    .prepare(
      "SELECT value FROM observations WHERE country_iso3 = 'AFG' AND indicator_code = 'BM.GSR.NFSV.CD' AND year = 2015",
    )
    .get();
  const sourceSample = observations.find(
    (row) => row.country === "AFG" && row.indicator === "BM.GSR.NFSV.CD" && row.year === 2015,
  );
  if (!sample || sample.value !== sourceSample.value) {
    throw new Error("Observation value round-trip failed.");
  }
  const filledGap = db
    .prepare(
      "SELECT 1 AS present FROM observations WHERE country_iso3 = 'CAF' AND indicator_code = 'BM.GSR.NFSV.CD' AND year = 2015",
    )
    .get();
  if (filledGap) throw new Error("A missing source year was stored as an observation.");

  const integrity = db.prepare("PRAGMA integrity_check").get();
  if (integrity.integrity_check !== "ok") throw new Error(`integrity_check ${integrity.integrity_check}`);

  db.close();
  const bytes = fs.statSync(dbPath).size;
  console.log(`Wrote ${path.relative(root, dbPath)} (${bytes} bytes)`);
  for (const [table, n] of Object.entries(counts)) console.log(`${table}\t${n}`);
  console.log(`null_observation_values\t${nullValues}`);
  console.log(`missing_year_slots\t${missingSlots}`);
  console.log("members\tskipped (data/members.json remains the registration store)");
}

replaceDatabase();
