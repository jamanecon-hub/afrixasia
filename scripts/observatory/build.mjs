import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { pathToFileURL } from "node:url";
import {
  extraDatasetId,
  fishProductionDatasetId,
  fisheryDatasetId,
  fisheryProducts,
  rubberDatasetId,
  rubberProducts,
  groundnutDatasetId,
  groundnutProducts,
  maizeDatasetId,
  maizeProducts,
  tobaccoDatasetId,
  tobaccoProducts,
  sugarDatasetId,
  sugarProducts,
  horticultureDatasetId,
  horticultureProducts,
  marketDatasetId,
  specialtyDatasetId,
  specialtyProducts,
  paths,
  priceDatasetId,
  productionDatasetId,
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
  const horticulture = fs.existsSync(paths.tradeHorticulture) ? readJson(paths.tradeHorticulture) : null;
  const specialty = fs.existsSync(paths.tradeSpecialty) ? readJson(paths.tradeSpecialty) : null;
  const fishery = fs.existsSync(paths.tradeFishery) ? readJson(paths.tradeFishery) : null;
  const rubber = fs.existsSync(paths.tradeRubber) ? readJson(paths.tradeRubber) : null;
  const groundnuts = fs.existsSync(paths.tradeGroundnuts) ? readJson(paths.tradeGroundnuts) : null;
  const maize = fs.existsSync(paths.tradeMaize) ? readJson(paths.tradeMaize) : null;
  const tobacco = fs.existsSync(paths.tradeTobacco) ? readJson(paths.tradeTobacco) : null;
  const sugar = fs.existsSync(paths.tradeSugar) ? readJson(paths.tradeSugar) : null;
  const prices = fs.existsSync(paths.commodityPrices) ? readJson(paths.commodityPrices) : null;
  const production = fs.existsSync(paths.production) ? readJson(paths.production) : null;
  const fish = fs.existsSync(paths.fishProduction) ? readJson(paths.fishProduction) : null;

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
  if (horticulture) {
    insertDataset(db, {
      id: horticulture.datasetId || horticultureDatasetId,
      title: horticulture.title,
      source: horticulture.source,
      sourceUrl: horticulture.sourceUrl,
      license: horticulture.license,
      licenseUrl: horticulture.licenseUrl,
      frequency: horticulture.frequency,
      updatedAt: horticulture.retrievedAt,
      retrievedAt: horticulture.retrievedAt,
      note: horticulture.note,
    });
  }
  if (specialty) {
    insertDataset(db, {
      id: specialty.datasetId || specialtyDatasetId,
      title: specialty.title,
      source: specialty.source,
      sourceUrl: specialty.sourceUrl,
      license: specialty.license,
      licenseUrl: specialty.licenseUrl,
      frequency: specialty.frequency,
      updatedAt: specialty.retrievedAt,
      retrievedAt: specialty.retrievedAt,
      note: specialty.note,
    });
  }
  if (fishery) {
    insertDataset(db, {
      id: fishery.datasetId || fisheryDatasetId,
      title: fishery.title,
      source: fishery.source,
      sourceUrl: fishery.sourceUrl,
      license: fishery.license,
      licenseUrl: fishery.licenseUrl,
      frequency: fishery.frequency,
      updatedAt: fishery.retrievedAt,
      retrievedAt: fishery.retrievedAt,
      note: fishery.note,
    });
  }
  if (rubber) {
    insertDataset(db, {
      id: rubber.datasetId || rubberDatasetId,
      title: rubber.title,
      source: rubber.source,
      sourceUrl: rubber.sourceUrl,
      license: rubber.license,
      licenseUrl: rubber.licenseUrl,
      frequency: rubber.frequency,
      updatedAt: rubber.retrievedAt,
      retrievedAt: rubber.retrievedAt,
      note: rubber.note,
    });
  }
  if (groundnuts) {
    insertDataset(db, {
      id: groundnuts.datasetId || groundnutDatasetId,
      title: groundnuts.title,
      source: groundnuts.source,
      sourceUrl: groundnuts.sourceUrl,
      license: groundnuts.license,
      licenseUrl: groundnuts.licenseUrl,
      frequency: groundnuts.frequency,
      updatedAt: groundnuts.retrievedAt,
      retrievedAt: groundnuts.retrievedAt,
      note: groundnuts.note,
    });
  }
  if (maize) {
    insertDataset(db, {
      id: maize.datasetId || maizeDatasetId,
      title: maize.title,
      source: maize.source,
      sourceUrl: maize.sourceUrl,
      license: maize.license,
      licenseUrl: maize.licenseUrl,
      frequency: maize.frequency,
      updatedAt: maize.retrievedAt,
      retrievedAt: maize.retrievedAt,
      note: maize.note,
    });
  }
  if (tobacco) {
    insertDataset(db, {
      id: tobacco.datasetId || tobaccoDatasetId,
      title: tobacco.title,
      source: tobacco.source,
      sourceUrl: tobacco.sourceUrl,
      license: tobacco.license,
      licenseUrl: tobacco.licenseUrl,
      frequency: tobacco.frequency,
      updatedAt: tobacco.retrievedAt,
      retrievedAt: tobacco.retrievedAt,
      note: tobacco.note,
    });
  }
  if (sugar) {
    insertDataset(db, {
      id: sugar.datasetId || sugarDatasetId,
      title: sugar.title,
      source: sugar.source,
      sourceUrl: sugar.sourceUrl,
      license: sugar.license,
      licenseUrl: sugar.licenseUrl,
      frequency: sugar.frequency,
      updatedAt: sugar.retrievedAt,
      retrievedAt: sugar.retrievedAt,
      note: sugar.note,
    });
  }
  if (production) {
    insertDataset(db, {
      id: production.datasetId || productionDatasetId,
      title: production.title,
      source: production.source,
      sourceUrl: production.sourceUrl,
      license: production.license,
      licenseUrl: production.licenseUrl,
      frequency: production.frequency,
      updatedAt: production.sourceUpdatedAt || production.retrievedAt,
      retrievedAt: production.retrievedAt,
      note: production.note,
    });
  }
  if (fish) {
    insertDataset(db, {
      id: fish.datasetId || fishProductionDatasetId,
      title: fish.title,
      source: fish.source,
      sourceUrl: fish.sourceUrl,
      license: fish.license,
      licenseUrl: fish.licenseUrl,
      frequency: fish.frequency,
      updatedAt: fish.sourceUpdatedAt || fish.retrievedAt,
      retrievedAt: fish.retrievedAt,
      note: fish.note,
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
  const productList = [...tradeProducts, ...horticultureProducts, ...specialtyProducts, ...fisheryProducts, ...rubberProducts, ...groundnutProducts, ...maizeProducts, ...tobaccoProducts, ...sugarProducts];
  for (const product of productList) {
    insertProduct.run(product.hs, product.name, product.category, product.observatoryProduct);
  }

  const insertFlow = db.prepare(`
    INSERT OR REPLACE INTO trade_flows (
      reporter_iso3, partner_iso3, hs_code, year, flow, trade_value_usd, net_weight_kg, qty, qty_unit_code, query_key, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const knownHs = new Set(productList.map((product) => product.hs));
  function insertFlows(source, fallbackDatasetId) {
    for (const flow of source?.flows || []) {
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
        source.datasetId || fallbackDatasetId,
      );
    }
  }
  db.exec("BEGIN");
  insertFlows(trade, tradeDatasetId);
  insertFlows(horticulture, horticultureDatasetId);
  insertFlows(specialty, specialtyDatasetId);
  insertFlows(fishery, fisheryDatasetId);
  insertFlows(rubber, rubberDatasetId);
  insertFlows(groundnuts, groundnutDatasetId);
  insertFlows(maize, maizeDatasetId);
  insertFlows(tobacco, tobaccoDatasetId);
  insertFlows(sugar, sugarDatasetId);
  db.exec("COMMIT");

  const insertQuery = db.prepare(`
    INSERT INTO collection_queries (
      dataset_id, query_key, reporter_iso3, year, status, http_status, row_count, kept_count, detail, finished_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  function insertQueries(source, fallbackDatasetId) {
    for (const [key, query] of Object.entries(source?.completedQueries || {})) {
      insertQuery.run(
        source.datasetId || fallbackDatasetId,
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
  }
  insertQueries(trade, tradeDatasetId);
  insertQueries(horticulture, horticultureDatasetId);
  insertQueries(specialty, specialtyDatasetId);
  insertQueries(fishery, fisheryDatasetId);
  insertQueries(rubber, rubberDatasetId);
  insertQueries(groundnuts, groundnutDatasetId);
  insertQueries(maize, maizeDatasetId);
  insertQueries(tobacco, tobaccoDatasetId);
  insertQueries(sugar, sugarDatasetId);

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
  if (prices?.series?.some((series) => series.series === "Rubber, TSR20")) {
    const rubberPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Rubber, TSR20' AND period = '2026-09'
    `).get();
    if (!rubberPrice) throw new Error("September 2026 TSR20 rubber price is missing from the database.");
    if (Math.abs(rubberPrice.price - 2.41) > 0.001) {
      throw new Error(`TSR20 rubber price ${rubberPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Groundnuts")) {
    const groundnutPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Groundnuts' AND period = '2026-09'
    `).get();
    if (!groundnutPrice) throw new Error("September 2026 groundnut price is missing from the database.");
    if (Math.abs(groundnutPrice.price - 1563) > 0.001) {
      throw new Error(`Groundnut price ${groundnutPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Maize")) {
    const maizePrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Maize' AND period = '2026-09'
    `).get();
    if (!maizePrice) throw new Error("September 2026 maize price is missing from the database.");
    if (Math.abs(maizePrice.price - 239.6) > 0.001) {
      throw new Error(`Maize price ${maizePrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Tobacco, US import u.v.")) {
    const tobaccoPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Tobacco, US import u.v.' AND period = '2026-07'
    `).get();
    if (!tobaccoPrice) throw new Error("July 2026 tobacco price is missing from the database.");
    if (Math.abs(tobaccoPrice.price - 6775) > 0.001) {
      throw new Error(`Tobacco price ${tobaccoPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Sugar, world")) {
    const sugarPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Sugar, world' AND period = '2026-09'
    `).get();
    if (!sugarPrice) throw new Error("September 2026 world sugar price is missing from the database.");
    if (Math.abs(sugarPrice.price - 0.41) > 0.001) {
      throw new Error(`World sugar price ${sugarPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }

  const insertProductionItem = db.prepare(`
    INSERT INTO production_items (item_code, name, category, observatory_product, detail)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const item of [...(production?.items || []), ...(fish?.items || [])]) {
    insertProductionItem.run(item.itemCode, item.name, item.category, item.observatoryProduct, item.detail || "");
  }
  const insertProduction = db.prepare(`
    INSERT INTO production (
      country_iso3, item_code, element_code, element_name, year, value, unit, flag, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const productionItems = new Set([...(production?.items || []), ...(fish?.items || [])].map((item) => item.itemCode));
  db.exec("BEGIN");
  for (const row of production?.rows || []) {
    if (!countryIds.has(row.country) || !productionItems.has(row.itemCode) || row.value == null) continue;
    insertProduction.run(
      row.country,
      row.itemCode,
      row.elementCode,
      row.element,
      row.year,
      row.value,
      row.unit,
      row.flag || "",
      production.datasetId || productionDatasetId,
    );
  }
  for (const row of fish?.rows || []) {
    if (!countryIds.has(row.country) || !productionItems.has(row.itemCode) || row.value == null) continue;
    insertProduction.run(
      row.country,
      row.itemCode,
      row.elementCode,
      row.element,
      row.year,
      row.value,
      row.unit,
      row.flag || "",
      fish.datasetId || fishProductionDatasetId,
    );
  }
  db.exec("COMMIT");
  if (production) {
    const teaLeaves = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'KEN' AND item_code = '667' AND element_code = '5510' AND year = 2023
    `).get();
    if (!teaLeaves) throw new Error("Kenya 2023 tea-leaf production is missing from the database.");
    if (teaLeaves.value !== 2577800 || teaLeaves.unit !== "t" || teaLeaves.flag !== "A") {
      throw new Error(`Kenya tea-leaf production ${teaLeaves.value} ${teaLeaves.unit} flag ${teaLeaves.flag} does not match the FAOSTAT extract.`);
    }
    const rubberOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'CIV' AND item_code = '836' AND element_code = '5510' AND year = 2023
    `).get();
    if (!rubberOutput) throw new Error("Côte d'Ivoire 2023 natural rubber production is missing from the database.");
    if (rubberOutput.value !== 1624824 || rubberOutput.unit !== "t" || rubberOutput.flag !== "A") {
      throw new Error(`Côte d'Ivoire rubber ${rubberOutput.value} ${rubberOutput.unit} flag ${rubberOutput.flag} does not match the FAOSTAT extract.`);
    }
    const groundnutOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'SEN' AND item_code = '242' AND element_code = '5510' AND year = 2023
    `).get();
    if (!groundnutOutput) throw new Error("Senegal 2023 groundnut production is missing from the database.");
    if (groundnutOutput.value !== 1675329 || groundnutOutput.unit !== "t" || groundnutOutput.flag !== "A") {
      throw new Error(`Senegal groundnuts ${groundnutOutput.value} ${groundnutOutput.unit} flag ${groundnutOutput.flag} does not match the FAOSTAT extract.`);
    }
    const maizeOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'ZAF' AND item_code = '56' AND element_code = '5510' AND year = 2023
    `).get();
    if (!maizeOutput) throw new Error("South Africa 2023 maize production is missing from the database.");
    if (maizeOutput.value !== 16430000 || maizeOutput.unit !== "t" || maizeOutput.flag !== "A") {
      throw new Error(`South Africa maize ${maizeOutput.value} ${maizeOutput.unit} flag ${maizeOutput.flag} does not match the FAOSTAT extract.`);
    }
    const tobaccoOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'ZWE' AND item_code = '826' AND element_code = '5510' AND year = 2023
    `).get();
    if (!tobaccoOutput) throw new Error("Zimbabwe 2023 unmanufactured tobacco production is missing from the database.");
    if (Math.abs(tobaccoOutput.value - 194828.2) > 0.001 || tobaccoOutput.unit !== "t" || tobaccoOutput.flag !== "A") {
      throw new Error(`Zimbabwe tobacco ${tobaccoOutput.value} ${tobaccoOutput.unit} flag ${tobaccoOutput.flag} does not match the FAOSTAT extract.`);
    }
    const caneOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'IND' AND item_code = '156' AND element_code = '5510' AND year = 2023
    `).get();
    if (!caneOutput) throw new Error("India 2023 sugar-cane production is missing from the database.");
    if (Math.abs(caneOutput.value - 490533351.06) > 0.001 || caneOutput.unit !== "t" || caneOutput.flag !== "A") {
      throw new Error(`India sugar cane ${caneOutput.value} ${caneOutput.unit} flag ${caneOutput.flag} does not match the FAOSTAT extract.`);
    }
    const beetOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'CHN' AND item_code = '157' AND element_code = '5510' AND year = 2023
    `).get();
    if (!beetOutput) throw new Error("China 2023 sugar-beet production is missing from the database.");
    if (beetOutput.value !== 9160200 || beetOutput.unit !== "t" || beetOutput.flag !== "A") {
      throw new Error(`China sugar beet ${beetOutput.value} ${beetOutput.unit} flag ${beetOutput.flag} does not match the FAOSTAT extract.`);
    }
    const rawSugarOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'ZAF' AND item_code = '162' AND element_code = '5510' AND year = 2023
    `).get();
    if (!rawSugarOutput) throw new Error("South Africa 2023 raw sugar production is missing from the database.");
    if (rawSugarOutput.value !== 2075000 || rawSugarOutput.unit !== "t" || rawSugarOutput.flag !== "A") {
      throw new Error(`South Africa raw sugar ${rawSugarOutput.value} ${rawSugarOutput.unit} flag ${rawSugarOutput.flag} does not match the FAOSTAT extract.`);
    }
  }
  if (fish) {
    const egyptAqua = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'EGY' AND item_code = 'FISH-AQUA' AND element_code = 'Q_tlw' AND year = 2022
    `).get();
    if (!egyptAqua) throw new Error("Egypt 2022 aquaculture production is missing from the database.");
    if (egyptAqua.value !== 1552430 || egyptAqua.unit !== "t" || egyptAqua.flag !== "AI") {
      throw new Error(`Egypt aquaculture ${egyptAqua.value} ${egyptAqua.unit} flag ${egyptAqua.flag} does not match the FishStat extract.`);
    }
  }

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

  const sesameQuery = specialty?.completedQueries?.["NGA:2024"];
  if (sesameQuery?.status === "ok") {
    const sesame = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'CHN' AND hs_code = '120740' AND year = 2024 AND flow = 'export'
    `).get();
    if (!sesame) throw new Error("Nigeria 2024 sesame export to China is missing from the database.");
    if (Math.abs(sesame.trade_value_usd - 144016173.881) > 1) {
      throw new Error(`Nigeria sesame value ${sesame.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (sesame.net_weight_kg !== 115969260) {
      throw new Error(`Nigeria sesame quantity ${sesame.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const groundnutQuery = groundnuts?.completedQueries?.["SEN:2024"];
  if (groundnutQuery?.status === "ok") {
    const groundnutTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'SEN' AND partner_iso3 = 'CHN' AND hs_code = '1202' AND year = 2024 AND flow = 'export'
    `).get();
    if (!groundnutTrade) throw new Error("Senegal 2024 groundnut export to China is missing from the database.");
    if (Math.abs(groundnutTrade.trade_value_usd - 92525200.621) > 1) {
      throw new Error(`Senegal groundnut value ${groundnutTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (groundnutTrade.net_weight_kg !== 101953500) {
      throw new Error(`Senegal groundnut quantity ${groundnutTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const maizeQuery = maize?.completedQueries?.["ZAF:2023"];
  if (maizeQuery?.status === "ok") {
    const maizeTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'KOR' AND hs_code = '1005' AND year = 2023 AND flow = 'export'
    `).get();
    if (!maizeTrade) throw new Error("South Africa 2023 maize export to Korea is missing from the database.");
    if (Math.abs(maizeTrade.trade_value_usd - 160080574.428) > 1) {
      throw new Error(`South Africa maize value ${maizeTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (maizeTrade.net_weight_kg !== 601540980) {
      throw new Error(`South Africa maize quantity ${maizeTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const tobaccoQuery = tobacco?.completedQueries?.["ZWE:2024"];
  if (tobaccoQuery?.status === "ok") {
    const tobaccoTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZWE' AND partner_iso3 = 'CHN' AND hs_code = '2401' AND year = 2024 AND flow = 'export'
    `).get();
    if (!tobaccoTrade) throw new Error("Zimbabwe 2024 unmanufactured tobacco export to China is missing from the database.");
    if (Math.abs(tobaccoTrade.trade_value_usd - 627946907.139) > 1) {
      throw new Error(`Zimbabwe tobacco value ${tobaccoTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (tobaccoTrade.net_weight_kg !== 68738674) {
      throw new Error(`Zimbabwe tobacco quantity ${tobaccoTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const sugarQuery = sugar?.completedQueries?.["IND:2024"];
  if (sugarQuery?.status === "ok") {
    const sugarTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'IND' AND partner_iso3 = 'LBY' AND hs_code = '1701' AND year = 2024 AND flow = 'export'
    `).get();
    if (!sugarTrade) throw new Error("India 2024 sugar export to Libya is missing from the database.");
    if (Math.abs(sugarTrade.trade_value_usd - 295754311.572) > 1) {
      throw new Error(`India sugar value ${sugarTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (sugarTrade.net_weight_kg !== 476420000) {
      throw new Error(`India sugar quantity ${sugarTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const rubberQuery = rubber?.completedQueries?.["CIV:2024"];
  if (rubberQuery?.status === "ok") {
    const rubberTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'CIV' AND partner_iso3 = 'CHN' AND hs_code = '4001' AND year = 2024 AND flow = 'export'
    `).get();
    if (!rubberTrade) throw new Error("Côte d'Ivoire 2024 natural rubber export to China is missing from the database.");
    if (Math.abs(rubberTrade.trade_value_usd - 578969668.137) > 1) {
      throw new Error(`Côte d'Ivoire rubber value ${rubberTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (rubberTrade.net_weight_kg !== 399042127) {
      throw new Error(`Côte d'Ivoire rubber quantity ${rubberTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const fishQuery = fishery?.completedQueries?.["CHN:2024"];
  if (fishQuery?.status === "ok") {
    const frozenFish = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'CHN' AND partner_iso3 = 'CIV' AND hs_code = '0303' AND year = 2024 AND flow = 'export'
    `).get();
    if (!frozenFish) throw new Error("China 2024 frozen-fish export to Côte d'Ivoire is missing from the database.");
    if (Math.abs(frozenFish.trade_value_usd - 140948284) > 1) {
      throw new Error(`China frozen-fish value ${frozenFish.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (frozenFish.net_weight_kg !== 76140821) {
      throw new Error(`China frozen-fish quantity ${frozenFish.net_weight_kg} does not match the Comtrade preview.`);
    }
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
    production: db.prepare("SELECT COUNT(*) AS n FROM production").get().n,
    marketRecords: db.prepare("SELECT COUNT(*) AS n FROM market_records").get().n,
  };
  db.close();
  console.log(`Built ${paths.database}`, counts);
  return counts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildDatabase();
}
