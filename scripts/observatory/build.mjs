import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { pathToFileURL } from "node:url";
import {
  extraDatasetId,
  marketDatasetId,
  paths,
  priceDatasetId,
  readJson,
  schema,
  snapshotDatasetId,
  tradeDatasetId,
  tradeProducts,
} from "./lib.mjs";

function insertDataset(db, row) {
  db.prepare(`
    INSERT INTO datasets (id, title, source, source_url, license, license_url, frequency, updated_at, retrieved_at, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id,
    row.title,
    row.source,
    row.sourceUrl || "",
    row.license || "",
    row.licenseUrl || "",
    row.frequency || "",
    row.updatedAt || "",
    row.retrievedAt || "",
    row.note || "",
  );
}

export function buildDatabase() {
  fs.mkdirSync(paths.data, { recursive: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = `${paths.database}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  const db = new DatabaseSync(paths.database);
  db.exec(schema);

  const wdi = readJson(paths.wdi);
  const observations = readJson(paths.observations);
  const market = readJson(paths.market);
  const extra = fs.existsSync(paths.wdiExtra) ? readJson(paths.wdiExtra) : null;
  const trade = fs.existsSync(paths.tradeFlows) ? readJson(paths.tradeFlows) : null;
  const prices = fs.existsSync(paths.commodityPrices) ? readJson(paths.commodityPrices) : null;

  insertDataset(db, {
    id: snapshotDatasetId,
    title: "Asia–Africa World Development Indicators snapshot",
    source: "World Bank — World Development Indicators",
    sourceUrl: "https://data.worldbank.org/",
    license: wdi.license,
    licenseUrl: wdi.licenseUrl,
    frequency: "Annual",
    updatedAt: wdi.sourceUpdatedAt,
    retrievedAt: wdi.retrievedAt,
    note: "Published observatory snapshot. Null source values are omitted.",
  });
  insertDataset(db, {
    id: marketDatasetId,
    title: "Historical product and service references",
    source: "Sources retained on each record",
    sourceUrl: "",
    license: "Source-specific terms apply",
    licenseUrl: "",
    frequency: "Published snapshot",
    updatedAt: market.asOf,
    retrievedAt: market.asOf,
    note: "Curated references and WDI trade proxies already shown in the market file.",
  });
  if (extra) {
    insertDataset(db, {
      id: extra.datasetId || extraDatasetId,
      title: extra.title,
      source: extra.source,
      sourceUrl: extra.sourceUrl,
      license: extra.license,
      licenseUrl: extra.licenseUrl,
      frequency: extra.frequency,
      updatedAt: extra.sourceUpdatedAt,
      retrievedAt: extra.retrievedAt,
      note: extra.note,
    });
  }
  if (trade) {
    insertDataset(db, {
      id: trade.datasetId || tradeDatasetId,
      title: trade.title,
      source: trade.source,
      sourceUrl: trade.sourceUrl,
      license: trade.license,
      licenseUrl: trade.licenseUrl,
      frequency: trade.frequency,
      updatedAt: trade.retrievedAt,
      retrievedAt: trade.retrievedAt,
      note: trade.note,
    });
  }
  if (prices) {
    insertDataset(db, {
      id: prices.datasetId || priceDatasetId,
      title: prices.title,
      source: prices.source,
      sourceUrl: prices.sourceUrl,
      license: prices.license,
      licenseUrl: prices.licenseUrl,
      frequency: prices.frequency,
      updatedAt: prices.sourceUpdatedAt || prices.retrievedAt,
      retrievedAt: prices.retrievedAt,
      note: prices.note,
    });
  }

  const insertCountry = db.prepare(`
    INSERT INTO countries (iso3, iso2, name, region, capital, income_group, lat, lon, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const country of wdi.countries) {
    insertCountry.run(country.iso3, country.iso2, country.name, country.region, country.capital, country.incomeGroup, country.lat, country.lon, country.sourceUrl);
  }

  const insertIndicator = db.prepare(`
    INSERT INTO indicators (
      code, name, label, unit, category, side, frequency, definition, source_organization, source_url, interpretation, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const indicator of wdi.indicators) {
    insertIndicator.run(
      indicator.code,
      indicator.name,
      indicator.label,
      indicator.unit,
      indicator.category,
      indicator.side,
      indicator.frequency,
      indicator.definition,
      indicator.sourceOrganization,
      indicator.sourceUrl,
      indicator.interpretation,
      snapshotDatasetId,
    );
  }
  for (const indicator of extra?.indicators || []) {
    insertIndicator.run(
      indicator.code,
      indicator.name,
      indicator.label,
      indicator.unit,
      indicator.category,
      indicator.side,
      "Annual",
      indicator.definition,
      indicator.sourceOrganization,
      indicator.sourceUrl,
      indicator.interpretation,
      extra.datasetId || extraDatasetId,
    );
  }

  const insertObservation = db.prepare(`
    INSERT INTO observations (country_iso3, indicator_code, year, value, status, decimal, dataset_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const countryIds = new Set(wdi.countries.map((country) => country.iso3));
  db.exec("BEGIN");
  for (const row of observations) {
    if (!countryIds.has(row.country) || row.value == null) continue;
    insertObservation.run(row.country, row.indicator, row.year, row.value, row.status || "", row.decimal ?? null, snapshotDatasetId);
  }
  for (const row of extra?.observations || []) {
    if (!countryIds.has(row.country) || row.value == null) continue;
    insertObservation.run(row.country, row.indicator, row.year, row.value, row.status || "", row.decimal ?? null, extra.datasetId || extraDatasetId);
  }
  db.exec("COMMIT");

  const insertProduct = db.prepare(`
    INSERT INTO hs_products (hs_code, name, category, observatory_product) VALUES (?, ?, ?, ?)
  `);
  for (const product of tradeProducts) insertProduct.run(product.hs, product.name, product.category, product.observatoryProduct);

  const insertFlow = db.prepare(`
    INSERT OR REPLACE INTO trade_flows (
      reporter_iso3, partner_iso3, hs_code, year, flow, trade_value_usd, net_weight_kg, qty, qty_unit_code, query_key, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const knownHs = new Set(tradeProducts.map((product) => product.hs));
  db.exec("BEGIN");
  for (const flow of trade?.flows || []) {
    if (!countryIds.has(flow.reporterIso3) || !countryIds.has(flow.partnerIso3) || !knownHs.has(flow.hsCode)) continue;
    insertFlow.run(
      flow.reporterIso3,
      flow.partnerIso3,
      flow.hsCode,
      flow.year,
      flow.flow,
      flow.tradeValueUsd,
      flow.netWeightKg,
      flow.qty,
      flow.qtyUnitCode,
      flow.queryKey,
      trade.datasetId || tradeDatasetId,
    );
  }
  db.exec("COMMIT");

  const insertQuery = db.prepare(`
    INSERT INTO collection_queries (
      dataset_id, query_key, reporter_iso3, year, status, http_status, row_count, kept_count, detail, finished_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const [key, query] of Object.entries(trade?.completedQueries || {})) {
    insertQuery.run(
      trade.datasetId || tradeDatasetId,
      key,
      query.reporterIso3,
      query.year,
      query.status,
      query.httpStatus,
      query.rowCount,
      query.keptCount,
      query.detail || "",
      query.finishedAt,
    );
  }

  const insertSeries = db.prepare(`
    INSERT INTO commodity_series (series, product, category, observatory_product, unit, detail)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const series of prices?.series || []) {
    insertSeries.run(series.series, series.product, series.category, series.observatoryProduct, series.unit, series.detail || "");
  }
  const insertPrice = db.prepare(`
    INSERT INTO commodity_prices (series, period, price, dataset_id) VALUES (?, ?, ?, ?)
  `);
  db.exec("BEGIN");
  for (const price of prices?.prices || []) {
    insertPrice.run(price.series, price.period, price.price, prices.datasetId || priceDatasetId);
  }
  db.exec("COMMIT");

  const insertRecord = db.prepare(`
    INSERT INTO market_records (
      id, country, iso2, region, category, product, side, indicator_type, value, unit, period,
      origin, target, summary, source_url, source, checked_at, hs_code, record_type, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const record of market.records) {
    insertRecord.run(
      record.id,
      record.country,
      record.iso2,
      record.region,
      record.category,
      record.product,
      record.side,
      record.indicatorType,
      typeof record.value === "number" ? record.value : null,
      record.unit,
      record.period,
      record.origin,
      record.target,
      record.summary,
      record.sourceUrl,
      record.source,
      record.checkedAt,
      record.hsCode,
      record.type,
      marketDatasetId,
    );
  }
  const insertCorridor = db.prepare(`
    INSERT INTO published_corridors (origin, target, product, hs_code, period, value_usd, quantity_kg, reporter, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const corridor of market.corridors) {
    insertCorridor.run(
      corridor.origin,
      corridor.target,
      corridor.product,
      corridor.hsCode,
      corridor.period,
      corridor.valueUSD,
      corridor.quantityKg,
      corridor.reporter,
      corridor.sourceUrl,
    );
  }

  const tea = db.prepare(`
    SELECT trade_value_usd, net_weight_kg FROM trade_flows
    WHERE reporter_iso3 = 'KEN' AND partner_iso3 = 'PAK' AND hs_code = '0902' AND year = 2024 AND flow = 'export'
  `).get();
  const kenyaQuery = trade?.completedQueries?.["KEN:2024"];
  if (kenyaQuery?.status === "ok") {
    if (!tea) throw new Error("Kenya 2024 tea export to Pakistan is missing from the database.");
    if (Math.abs(tea.trade_value_usd - 554186717.21) > 1) {
      throw new Error(`Kenya tea value ${tea.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (tea.net_weight_kg !== 221460000) {
      throw new Error(`Kenya tea quantity ${tea.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const counts = {
    countries: db.prepare("SELECT COUNT(*) AS n FROM countries").get().n,
    indicators: db.prepare("SELECT COUNT(*) AS n FROM indicators").get().n,
    observations: db.prepare("SELECT COUNT(*) AS n FROM observations").get().n,
    tradeFlows: db.prepare("SELECT COUNT(*) AS n FROM trade_flows").get().n,
    prices: db.prepare("SELECT COUNT(*) AS n FROM commodity_prices").get().n,
    marketRecords: db.prepare("SELECT COUNT(*) AS n FROM market_records").get().n,
  };
  db.close();
  console.log(`Built ${paths.database}`, counts);
  return counts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildDatabase();
}
